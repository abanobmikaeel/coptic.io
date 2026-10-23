import { beforeEach, describe, expect, it, vi } from 'vitest'

const db = vi.hoisted(() => ({
	query: vi.fn(),
	queryOne: vi.fn(),
	close: vi.fn(),
}))
const email = vi.hoisted(() => ({
	sendOTPEmail: vi.fn(),
	sendWelcomeEmail: vi.fn(),
}))

vi.mock('../../services/subscriptions/db', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../services/subscriptions/db')>()
	return {
		...actual,
		withDb: vi.fn(
			async (env: { HYPERDRIVE?: unknown } | undefined, fn: (d: typeof db) => unknown) => {
				if (env && !env.HYPERDRIVE) throw new actual.DatabaseUnavailableError()
				return fn(db)
			},
		),
	}
})
vi.mock('../../services/subscriptions/email', async (importOriginal) => ({
	...(await importOriginal<typeof import('../../services/subscriptions/email')>()),
	...email,
}))

const { app } = await import('../../index')

const json = (body: unknown) => ({
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify(body),
})

beforeEach(() => {
	vi.clearAllMocks()
	db.query.mockResolvedValue([])
	db.queryOne.mockResolvedValue(null)
})

describe('POST /api/subscriptions/subscribe', () => {
	it('rejects a missing or malformed email', async () => {
		expect((await app.request('/api/subscriptions/subscribe', json({}))).status).toBe(400)
		expect(
			(await app.request('/api/subscriptions/subscribe', json({ email: 'nope' }))).status,
		).toBe(400)
		expect(email.sendOTPEmail).not.toHaveBeenCalled()
	})

	it('refuses an address that is already verified', async () => {
		db.queryOne.mockResolvedValueOnce({ verified: true })
		const res = await app.request('/api/subscriptions/subscribe', json({ email: 'a@b.co' }))
		expect(res.status).toBe(409)
	})

	it('stores a fresh code and emails it to the normalized address', async () => {
		const res = await app.request(
			'/api/subscriptions/subscribe',
			json({ email: 'Someone@Example.COM' }),
		)
		expect(res.status).toBe(200)

		const insert = db.query.mock.calls.find(([sql]) =>
			String(sql).startsWith('INSERT INTO otp_codes'),
		)
		expect(insert?.[1]?.[0]).toBe('someone@example.com')
		const code = insert?.[1]?.[1]
		expect(code).toMatch(/^\d{6}$/)
		expect(email.sendOTPEmail).toHaveBeenCalledWith(undefined, 'someone@example.com', code)
	})

	it('answers 503 when no database is bound', async () => {
		const res = await app.request('/api/subscriptions/subscribe', json({ email: 'a@b.co' }), {})
		expect(res.status).toBe(503)
	})
})

describe('POST /api/subscriptions/verify', () => {
	it('rejects an unknown or expired code', async () => {
		const res = await app.request(
			'/api/subscriptions/verify',
			json({ email: 'a@b.co', code: '123456' }),
		)
		expect(res.status).toBe(400)
		expect(email.sendWelcomeEmail).not.toHaveBeenCalled()
	})

	it('marks the code used, upserts the subscriber and returns the token', async () => {
		db.queryOne
			.mockResolvedValueOnce({ id: 'otp-1' })
			.mockImplementationOnce(async (_sql, params) => ({
				token: params[4],
			}))

		const res = await app.request(
			'/api/subscriptions/verify',
			json({ email: 'A@B.co', code: '123456', name: ' Mina ' }),
		)
		expect(res.status).toBe(200)
		const body = (await res.json()) as { token: string }
		expect(body.token).toMatch(/^[A-Za-z0-9]{32}$/)
		expect(db.query).toHaveBeenCalledWith('UPDATE otp_codes SET used = TRUE WHERE id = $1', [
			'otp-1',
		])
		expect(email.sendWelcomeEmail).toHaveBeenCalledWith(undefined, 'Mina', 'a@b.co', body.token)
	})
})

describe('/api/subscriptions/unsubscribe', () => {
	it('redirects one-click links back to the site with the outcome', async () => {
		db.query.mockResolvedValueOnce([{ id: 's-1' }])
		const res = await app.request('/api/subscriptions/unsubscribe?token=abc')
		expect(res.status).toBe(302)
		expect(res.headers.get('location')).toBe('https://coptic.io/?unsubscribed=true')

		const missing = await app.request('/api/subscriptions/unsubscribe?token=zzz')
		expect(missing.headers.get('location')).toBe('https://coptic.io/?unsubscribed=not_found')
	})

	it('accepts the token in a POST body', async () => {
		db.query.mockResolvedValueOnce([{ id: 's-1' }])
		const res = await app.request('/api/subscriptions/unsubscribe', json({ token: 'abc' }))
		expect(res.status).toBe(200)
		expect(db.query).toHaveBeenCalledWith('DELETE FROM subscribers WHERE token = $1 RETURNING id', [
			'abc',
		])
	})
})

describe('/api/subscriptions/preferences', () => {
	it('requires a token', async () => {
		expect((await app.request('/api/subscriptions/preferences')).status).toBe(400)
	})

	it('returns preferences in camelCase', async () => {
		db.queryOne.mockResolvedValueOnce({
			email: 'a@b.co',
			name: 'Mina',
			patron_saint: 'St. Mark',
			daily_readings: true,
			feast_reminders: false,
		})
		const res = await app.request('/api/subscriptions/preferences', {
			headers: { 'x-subscriber-token': 'abc' },
		})
		expect(await res.json()).toEqual({
			email: 'a@b.co',
			name: 'Mina',
			patronSaint: 'St. Mark',
			dailyReadings: true,
			feastReminders: false,
		})
	})

	it('validates the update payload', async () => {
		const res = await app.request('/api/subscriptions/preferences?token=abc', {
			...json({ dailyReadings: 'yes', feastReminders: true }),
			method: 'PUT',
		})
		expect(res.status).toBe(400)
	})
})

describe('POST /api/subscriptions/webhooks/ses', () => {
	it('removes bounced addresses', async () => {
		const res = await app.request(
			'/api/subscriptions/webhooks/ses',
			json({
				Type: 'Notification',
				TopicArn: 'arn:aws:sns:us-east-1:1:ses',
				Message: JSON.stringify({
					notificationType: 'Bounce',
					bounce: { bouncedRecipients: [{ emailAddress: 'Gone@Example.com' }] },
				}),
			}),
		)
		expect(res.status).toBe(200)
		expect(db.query).toHaveBeenCalledWith('DELETE FROM subscribers WHERE email = $1', [
			'gone@example.com',
		])
	})

	it('still answers 200 on a malformed body so SNS does not retry', async () => {
		const res = await app.request('/api/subscriptions/webhooks/ses', {
			method: 'POST',
			body: 'not json',
		})
		expect(res.status).toBe(200)
	})
})
