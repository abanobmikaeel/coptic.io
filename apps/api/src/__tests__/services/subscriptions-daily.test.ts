import { beforeEach, describe, expect, it, vi } from 'vitest'

const sendEmail = vi.hoisted(() => vi.fn())
vi.mock('../../services/subscriptions/email', async (importOriginal) => ({
	...(await importOriginal<typeof import('../../services/subscriptions/email')>()),
	sendEmail,
}))

const { sendDailyReadings, summarizeReadings } = await import('../../services/subscriptions/daily')

const db = { query: vi.fn(), queryOne: vi.fn(), close: vi.fn() }
const fetchApi = vi.fn(async (path: string) =>
	Response.json(
		path === '/api/calendar'
			? { dateString: 'Hatour 14, 1743' }
			: { reference: { MGospel: 'John 1:1-5', Pauline: 'Romans 8:1-4', id: 48 } },
	),
)

beforeEach(() => vi.clearAllMocks())

describe('sendDailyReadings', () => {
	it('does nothing when nobody is subscribed', async () => {
		db.query.mockResolvedValueOnce([])
		expect(await sendDailyReadings(undefined, db, fetchApi)).toEqual({
			sent: 0,
			failed: 0,
			total: 0,
		})
		expect(fetchApi).not.toHaveBeenCalled()
	})

	it('emails each subscriber and counts failures without stopping', async () => {
		db.query.mockResolvedValueOnce([
			{ id: '1', email: 'a@b.co', name: 'Mina', token: 't1' },
			{ id: '2', email: 'c@d.co', name: null, token: 't2' },
		])
		sendEmail.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('throttled'))

		expect(await sendDailyReadings(undefined, db, fetchApi)).toEqual({
			sent: 1,
			failed: 1,
			total: 2,
		})

		const first = sendEmail.mock.calls[0]?.[1]
		expect(first.to).toBe('a@b.co')
		expect(first.subject).toBe('☦ Hatour 14, 1743 - Daily Readings')
		expect(first.html).toContain('Dear Mina')
		expect(first.html).toContain('Matins Gospel')
		expect(first.html).toContain('John 1:1-5')
		expect(first.html).toContain('Pauline Epistle')
		expect(first.html).toContain('https://coptic.io/api/unsubscribe?token=t1')
		expect(sendEmail.mock.calls[1]?.[1].html).toContain('Dear friend')
	})

	it('fails loudly when the readings cannot be loaded', async () => {
		db.query.mockResolvedValueOnce([{ id: '1', email: 'a@b.co', name: null, token: 't1' }])
		fetchApi.mockResolvedValueOnce(new Response('', { status: 500 }))
		await expect(sendDailyReadings(undefined, db, fetchApi)).rejects.toThrow(/readings/)
		expect(sendEmail).not.toHaveBeenCalled()
	})

	it('summarizes the readings response in liturgical order', () => {
		expect(
			summarizeReadings({ LGospel: 'Luke 16:1-12', VPsalm: 'Psalms 65:4-5', Acts: '', id: 48 }),
		).toEqual([
			{ title: 'Vespers Psalm', passage: 'Psalms 65:4-5' },
			{ title: 'Liturgy Gospel', passage: 'Luke 16:1-12' },
		])
	})
})
