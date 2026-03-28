import { query } from '@/lib/db'
import {
	type DailyEmailData,
	type DailyReadingEntry,
	dailyReadingsEmailHtml,
	dailyReadingsEmailText,
} from '@/lib/email/templates'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { type NextRequest, NextResponse } from 'next/server'

const ses = new SESClient({
	region: process.env.AWS_REGION ?? 'us-east-1',
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
})

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://coptic.io'
const API_URL = process.env.API_URL ?? 'https://api.coptic.io'
const FROM_EMAIL = process.env.SES_FROM_EMAIL ?? 'noreply@coptic.io'

interface Subscriber {
	id: string
	email: string
	name: string | null
	token: string
}

// ---- API response types -----------------------------------------------------

interface ApiVerse {
	text: string
	num: number
}

interface ApiChapter {
	chapterNum: number
	verses: ApiVerse[]
}

interface ApiReading {
	bookName: string
	chapters: ApiChapter[]
}

interface ReadingsApiResponse {
	VPsalm?: ApiReading[] | null
	VGospel?: ApiReading[] | null
	MPsalm?: ApiReading[] | null
	MGospel?: ApiReading[] | null
	Pauline?: ApiReading[] | null
	Catholic?: ApiReading[] | null
	Acts?: ApiReading[] | null
	LPsalm?: ApiReading[] | null
	LGospel?: ApiReading[] | null
	Synaxarium?: Array<{ name?: string }>
	season?: string | null
	seasonDay?: string | null
	celebrations?: Array<{ name: string }>
	fullDate?: { dateString: string }
}

interface FastingApiResponse {
	isFasting: boolean
	fastType: string | null
	description: string | null
}

// ---- Formatting helpers -----------------------------------------------------

function formatRef(readings: ApiReading[]): string {
	return readings
		.map((r) => {
			const first = r.chapters[0]
			if (!first) return r.bookName
			const last = r.chapters[r.chapters.length - 1]
			const startVerse = first.verses[0]?.num
			const endVerse = last?.verses[last.verses.length - 1]?.num

			if (r.chapters.length === 1) {
				if (startVerse !== undefined && endVerse !== undefined && startVerse !== endVerse) {
					return `${r.bookName} ${first.chapterNum}:${startVerse}\u2013${endVerse}`
				}
				if (startVerse !== undefined) return `${r.bookName} ${first.chapterNum}:${startVerse}`
				return `${r.bookName} ${first.chapterNum}`
			}

			const lastChNum = last?.chapterNum
			if (startVerse !== undefined && endVerse !== undefined) {
				return `${r.bookName} ${first.chapterNum}:${startVerse}\u2013${lastChNum}:${endVerse}`
			}
			return `${r.bookName} ${first.chapterNum}\u2013${lastChNum}`
		})
		.join('; ')
}

function getFirstVerse(readings: ApiReading[]): string | undefined {
	const text = readings[0]?.chapters[0]?.verses[0]?.text
	if (!text) return undefined
	return text.length > 120 ? `${text.slice(0, 120).trim()}\u2026` : text
}

function toEntry(
	label: string,
	readings: ApiReading[] | null | undefined,
): DailyReadingEntry | null {
	if (!readings || readings.length === 0) return null
	return { label, reference: formatRef(readings), firstVerse: getFirstVerse(readings) }
}

// ---- Route ------------------------------------------------------------------

export async function POST(request: NextRequest) {
	const authHeader = request.headers.get('authorization')
	const expectedSecret = process.env.CRON_SECRET
	if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const subscribers = await query<Subscriber>(
			`SELECT id, email, name, token FROM subscribers
       WHERE verified = TRUE AND daily_readings = TRUE AND unsubscribed_at IS NULL`,
		)

		if (subscribers.length === 0) {
			return NextResponse.json({ message: 'No subscribers to send to', sent: 0 })
		}

		// Fetch today's data in parallel
		const [readingsRes, fastingRes] = await Promise.all([
			fetch(`${API_URL}/api/readings?detailed=true`),
			fetch(`${API_URL}/api/fasting`),
		])

		if (!readingsRes.ok) throw new Error(`Readings API failed: ${readingsRes.status}`)
		if (!fastingRes.ok) throw new Error(`Fasting API failed: ${fastingRes.status}`)

		const apiReadings = (await readingsRes.json()) as ReadingsApiResponse
		const apiFasting = (await fastingRes.json()) as FastingApiResponse

		// Format Gregorian date
		const now = new Date()
		const gregorianDate = now.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		})

		// Build reading entries by service
		const vespers = [
			toEntry('Psalm', apiReadings.VPsalm),
			toEntry('Gospel', apiReadings.VGospel),
		].filter((e): e is DailyReadingEntry => e !== null)

		const matins = [
			toEntry('Psalm', apiReadings.MPsalm),
			toEntry('Gospel', apiReadings.MGospel),
		].filter((e): e is DailyReadingEntry => e !== null)

		const liturgy = [
			toEntry('Pauline', apiReadings.Pauline),
			toEntry('Catholic', apiReadings.Catholic),
			toEntry('Acts', apiReadings.Acts),
			toEntry('Psalm', apiReadings.LPsalm),
			toEntry('Gospel', apiReadings.LGospel),
		].filter((e): e is DailyReadingEntry => e !== null)

		const synaxariumNames = (apiReadings.Synaxarium ?? [])
			.map((s) => s.name)
			.filter((n): n is string => !!n)

		const celebrations = (apiReadings.celebrations ?? []).map((c) => c.name)

		const emailData: DailyEmailData = {
			gregorianDate,
			copticDate: apiReadings.fullDate?.dateString ?? gregorianDate,
			season: apiReadings.season,
			seasonDay: apiReadings.seasonDay,
			isFasting: apiFasting.isFasting,
			fastType: apiFasting.fastType,
			celebrations,
			vespers,
			matins,
			liturgy,
			synaxariumNames,
		}

		const readingsUrl = `${BASE_URL}/readings`

		let sent = 0
		let failed = 0

		for (const subscriber of subscribers) {
			const greeting = subscriber.name ? `Dear ${subscriber.name}` : 'Dear friend'
			const preferencesUrl = `${BASE_URL}/preferences?token=${subscriber.token}`
			const unsubscribeUrl = `${BASE_URL}/api/unsubscribe?token=${subscriber.token}`
			const subject = `${emailData.copticDate} \u2014 Daily Readings`

			try {
				await ses.send(
					new SendEmailCommand({
						Source: FROM_EMAIL,
						Destination: { ToAddresses: [subscriber.email] },
						Message: {
							Subject: { Data: subject },
							Body: {
								Html: {
									Data: dailyReadingsEmailHtml(
										greeting,
										emailData,
										readingsUrl,
										preferencesUrl,
										unsubscribeUrl,
									),
								},
								Text: {
									Data: dailyReadingsEmailText(greeting, emailData, readingsUrl, unsubscribeUrl),
								},
							},
						},
					}),
				)
				sent++
			} catch (err) {
				console.error(`Failed to send to ${subscriber.email}:`, err)
				failed++
			}
		}

		return NextResponse.json({
			message: 'Daily emails sent',
			sent,
			failed,
			total: subscribers.length,
		})
	} catch (error) {
		console.error('Send daily error:', error)
		return NextResponse.json({ error: 'Failed to send daily emails' }, { status: 500 })
	}
}

export async function GET(request: NextRequest) {
	return POST(request)
}
