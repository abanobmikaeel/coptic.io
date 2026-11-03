import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Bindings, D1Database, D1PreparedStatement } from '../../env'

// Runs the subscription routes against a real SQLite database built from the D1
// migrations, so the SQL itself is exercised rather than mocked.

const email = vi.hoisted(() => ({
	sendOTPEmail: vi.fn(),
	sendWelcomeEmail: vi.fn(),
	sendEmail: vi.fn(),
}))
// Signature checks have their own tests; here every webhook request counts as genuine.
vi.mock('../../services/subscriptions/sns', async (importOriginal) => ({
	...(await importOriginal<typeof import('../../services/subscriptions/sns')>()),
	verifySnsMessage: async () => true,
}))
vi.mock('../../services/subscriptions/email', async (importOriginal) => ({
	...(await importOriginal<typeof import('../../services/subscriptions/email')>()),
	...email,
}))

const { app } = await import('../../index')
const { d1Db } = await import('../../services/subscriptions/db')
const { sendDailyReadings } = await import('../../services/subscriptions/daily')

/** The slice of the D1 API the adapter uses, backed by node:sqlite. */
const sqliteD1 = (sqlite: DatabaseSync): D1Database => ({
	prepare(query) {
		let values: unknown[] = []
		const statement: D1PreparedStatement = {
			bind(...next) {
				values = next
				return statement
			},
			async all<T>() {
				return { results: sqlite.prepare(query).all(...(values as never[])) as T[] }
			},
		}
		return statement
	},
})

const migration = readFileSync(
	new URL('../../../migrations/0001_subscriptions.sql', import.meta.url),
	'utf8',
)

let sqlite: DatabaseSync
let env: Bindings

beforeEach(() => {
	vi.clearAllMocks()
	sqlite = new DatabaseSync(':memory:')
	sqlite.exec(migration)
	env = { SUBSCRIPTIONS_DB: sqliteD1(sqlite) } as unknown as Bindings
})

const send = (path: string, method: string, body?: unknown, headers?: Record<string, string>) =>
	app.request(
		path,
		{
			method,
			headers: { 'Content-Type': 'application/json', ...headers },
			body: body === undefined ? undefined : JSON.stringify(body),
		},
		env,
	)

/** Subscribes and verifies an address, returning its subscriber token. */
const signUp = async (address: string, name?: string): Promise<string> => {
	expect((await send('/api/subscriptions/subscribe', 'POST', { email: address })).status).toBe(200)
	const code = email.sendOTPEmail.mock.lastCall?.[2]
	const res = await send('/api/subscriptions/verify', 'POST', { email: address, code, name })
	expect(res.status).toBe(200)
	return ((await res.json()) as { token: string }).token
}

describe('subscriptions on SQLite', () => {
	it('signs up, verifies once and refuses a second sign-up', async () => {
		await send('/api/subscriptions/subscribe', 'POST', { email: 'New@Example.com' })
		const code = email.sendOTPEmail.mock.lastCall?.[2] as string
		expect(code).toMatch(/^\d{6}$/)

		const wrong = code === '000000' ? '111111' : '000000'
		const bad = await send('/api/subscriptions/verify', 'POST', {
			email: 'new@example.com',
			code: wrong,
		})
		expect(bad.status).toBe(400)

		const ok = await send('/api/subscriptions/verify', 'POST', {
			email: 'new@example.com',
			code,
			name: 'Mina',
		})
		expect(ok.status).toBe(200)
		expect(email.sendWelcomeEmail).toHaveBeenCalledOnce()

		const reused = await send('/api/subscriptions/verify', 'POST', {
			email: 'new@example.com',
			code,
		})
		expect(reused.status).toBe(400)

		const again = await send('/api/subscriptions/subscribe', 'POST', { email: 'new@example.com' })
		expect(again.status).toBe(409)

		const row = sqlite.prepare('SELECT * FROM subscribers').get() as Record<string, unknown>
		expect(row).toMatchObject({
			email: 'new@example.com',
			name: 'Mina',
			verified: 1,
			daily_readings: 1,
			timezone: 'America/New_York',
		})
		expect(row.id).toMatch(/^[0-9a-f-]{36}$/)
	})

	it('rejects an expired code', async () => {
		sqlite
			.prepare(
				`INSERT INTO otp_codes (id, email, code, expires_at)
         VALUES ('otp-1', 'late@example.com', '123456', datetime('now', '-1 minute'))`,
			)
			.run()
		const res = await send('/api/subscriptions/verify', 'POST', {
			email: 'late@example.com',
			code: '123456',
		})
		expect(res.status).toBe(400)
	})

	it('re-verifying keeps the existing name when none is given', async () => {
		await signUp('a@example.com', 'Mina')
		sqlite.prepare('UPDATE subscribers SET verified = 0').run()
		await signUp('a@example.com')

		const row = sqlite.prepare('SELECT name, verified FROM subscribers').get()
		expect(row).toEqual({ name: 'Mina', verified: 1 })
		expect(sqlite.prepare('SELECT count(*) AS n FROM subscribers').get()).toEqual({ n: 1 })
	})

	it('reads and updates preferences as booleans', async () => {
		const token = await signUp('a@example.com', 'Mina')
		const headers = { 'x-subscriber-token': token }

		const read = await send('/api/subscriptions/preferences', 'GET', undefined, headers)
		expect(await read.json()).toEqual({
			email: 'a@example.com',
			name: 'Mina',
			patronSaint: null,
			dailyReadings: true,
			feastReminders: true,
		})

		const update = await send(
			'/api/subscriptions/preferences',
			'PUT',
			{ name: 'Mina', patronSaint: 'St. Mark', dailyReadings: false, feastReminders: true },
			headers,
		)
		expect(await update.json()).toMatchObject({
			patronSaint: 'St. Mark',
			dailyReadings: false,
			feastReminders: true,
		})
		expect(sqlite.prepare('SELECT daily_readings FROM subscribers').get()).toEqual({
			daily_readings: 0,
		})
	})

	it('sends the daily email only to verified subscribers who opted in', async () => {
		await signUp('daily@example.com')
		const optedOut = await signUp('quiet@example.com')
		await send(
			'/api/subscriptions/preferences',
			'PUT',
			{ dailyReadings: false, feastReminders: true },
			{ 'x-subscriber-token': optedOut },
		)
		sqlite
			.prepare(`INSERT INTO subscribers (id, email, token) VALUES ('s-x', 'unverified@x.co', 't')`)
			.run()

		const fetchApi = async (path: string) =>
			Response.json(path === '/api/calendar' ? { dateString: 'Hatour 14' } : { reference: {} })
		const result = await sendDailyReadings(env, d1Db(env.SUBSCRIPTIONS_DB!), fetchApi)

		expect(result).toEqual({ sent: 1, failed: 0, total: 1 })
		expect(email.sendEmail.mock.calls[0]?.[1]).toMatchObject({ to: 'daily@example.com' })
	})

	it('unsubscribes by token and removes bounced addresses', async () => {
		const token = await signUp('a@example.com')
		await signUp('b@example.com')

		const res = await send(`/api/subscriptions/unsubscribe?token=${token}`, 'POST')
		expect(res.status).toBe(200)
		expect((await send(`/api/subscriptions/unsubscribe?token=${token}`, 'POST')).status).toBe(404)

		await send('/api/subscriptions/webhooks/ses', 'POST', {
			Type: 'Notification',
			TopicArn: 'arn:aws:sns:us-east-1:1:ses',
			Message: JSON.stringify({
				notificationType: 'Bounce',
				bounce: { bouncedRecipients: [{ emailAddress: 'B@Example.com' }] },
			}),
		})
		expect(sqlite.prepare('SELECT count(*) AS n FROM subscribers').get()).toEqual({ n: 0 })
	})
})
