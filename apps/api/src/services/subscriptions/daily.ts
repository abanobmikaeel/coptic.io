import type { Bindings } from '../../env'
import type { Db } from './db'
import { sendEmail, siteUrl, subscriberLinks } from './email'
import { type DailyReadingSummary, dailyEmailHtml } from './templates'

interface DailySubscriber {
	id: string
	email: string
	name: string | null
	token: string
}

export interface DailySendResult {
	sent: number
	failed: number
	total: number
}

// `/api/readings` returns `reference: { VPsalm: 'Psalms 65:4-5', ... }`, keyed by
// service slot in liturgical order. Slots missing on a given day are skipped.
const READING_TITLES: Array<[key: string, title: string]> = [
	['VPsalm', 'Vespers Psalm'],
	['VGospel', 'Vespers Gospel'],
	['MPsalm', 'Matins Psalm'],
	['MGospel', 'Matins Gospel'],
	['Pauline', 'Pauline Epistle'],
	['Catholic', 'Catholic Epistle'],
	['Acts', 'Acts'],
	['LPsalm', 'Liturgy Psalm'],
	['LGospel', 'Liturgy Gospel'],
]

export const summarizeReadings = (reference: Record<string, unknown>): DailyReadingSummary[] =>
	READING_TITLES.flatMap(([key, title]) => {
		const passage = reference[key]
		return typeof passage === 'string' && passage ? [{ title, passage }] : []
	})

/** Fetches a path from this API (in-process in the Worker, so no extra round trip). */
export type ApiFetcher = (path: string) => Promise<Response>

/**
 * Sends today's readings to every verified subscriber who opted in. Runs from the
 * Worker's cron trigger. One failed address is logged and skipped, not fatal.
 */
export async function sendDailyReadings(
	env: Bindings | undefined,
	db: Db,
	fetchApi: ApiFetcher,
): Promise<DailySendResult> {
	const subscribers = await db.query<DailySubscriber>(
		`SELECT id, email, name, token
     FROM subscribers
     WHERE verified = TRUE AND daily_readings = TRUE AND unsubscribed_at IS NULL`,
	)
	if (subscribers.length === 0) return { sent: 0, failed: 0, total: 0 }

	const [calendarRes, readingsRes] = await Promise.all([
		fetchApi('/api/calendar'),
		fetchApi('/api/readings'),
	])
	if (!calendarRes.ok || !readingsRes.ok) {
		throw new Error(`Could not load today's readings (${calendarRes.status}/${readingsRes.status})`)
	}
	const calendar = (await calendarRes.json()) as { dateString?: string }
	const { reference } = (await readingsRes.json()) as { reference?: Record<string, unknown> }
	const readings = summarizeReadings(reference ?? {})
	const copticDate = calendar.dateString || 'Today'

	let sent = 0
	let failed = 0
	for (const subscriber of subscribers) {
		const { preferencesUrl, unsubscribeUrl } = subscriberLinks(env, subscriber.token)
		try {
			await sendEmail(env, {
				to: subscriber.email,
				subject: `☦ ${copticDate} - Daily Readings`,
				html: dailyEmailHtml({
					greeting: subscriber.name ? `Dear ${subscriber.name}` : 'Dear friend',
					copticDate,
					readings,
					readingsUrl: `${siteUrl(env)}/readings`,
					preferencesUrl,
					unsubscribeUrl,
				}),
			})
			sent++
		} catch (err) {
			console.error(`Failed to send daily readings to subscriber ${subscriber.id}:`, err)
			failed++
		}
	}

	return { sent, failed, total: subscribers.length }
}
