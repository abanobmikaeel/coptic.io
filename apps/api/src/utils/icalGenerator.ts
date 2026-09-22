import { getAllSeasonsForYear, getMoveableFeastsForYear } from '@coptic/core'
import { getYearView } from '../services/yearView.service'

// Days already covered by a liturgical season, so the feed does not announce them twice.
// Good Friday is not a standalone occasion - it falls inside Holy Week, which is announced.
const SEASON_COVERED_FASTS = new Set([
	'Fast of Nineveh',
	'Great Lent',
	"Apostles' Fast",
	'Good Friday',
])

/**
 * Format date for iCal (YYYYMMDD format)
 */
const formatICalDate = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}${month}${day}`
}

/**
 * Format datetime for iCal (YYYYMMDDTHHmmssZ format)
 */
const formatICalDateTime = (date: Date): string => {
	return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
}

// RFC 5545 3.3.11: backslash, semicolon and comma are not TSAFE-CHARs and must be escaped;
// newlines become the literal two-character sequence \n.
const ICAL_TEXT_ESCAPES: Record<string, string> = {
	'\\': '\\\\',
	';': '\\;',
	',': '\\,',
}

/**
 * Escape special characters in iCal text (single regex pass)
 */
const escapeICalText = (text: string): string => {
	return text.replace(/\r\n|[\\;,\n\r]/g, (char) => ICAL_TEXT_ESCAPES[char] ?? '\\n')
}

const MAX_LINE_OCTETS = 75
const encoder = new TextEncoder()
const decoder = new TextDecoder()

/**
 * Fold a content line to at most 75 octets per RFC 5545 3.1. Continuation lines are
 * prefixed with a single space, which counts toward their own octet budget, and a
 * multi-byte UTF-8 sequence is never split across a fold.
 */
const foldICalLine = (line: string): string => {
	const bytes = encoder.encode(line)
	if (bytes.length <= MAX_LINE_OCTETS) return line

	const chunks: string[] = []
	let start = 0
	let limit = MAX_LINE_OCTETS

	while (start < bytes.length) {
		let end = Math.min(start + limit, bytes.length)
		// 0b10xxxxxx marks a UTF-8 continuation byte; back off so it stays with its lead byte.
		while (end > start && end < bytes.length && (bytes[end]! & 0xc0) === 0x80) end--
		chunks.push(decoder.decode(bytes.subarray(start, end)))
		start = end
		limit = MAX_LINE_OCTETS - 1
	}

	return chunks.join('\r\n ')
}

/**
 * Fold every content line and terminate the document with CRLF
 */
const serializeICal = (lines: string[]): string => {
	return `${lines.map(foldICalLine).join('\r\n')}\r\n`
}

const slugify = (value: string): string =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')

/**
 * Generate a unique ID for an event. Both halves are slugified so the UID carries no spaces
 * or trailing punctuation from a category like "Fasting Period" or a parenthesised feast name.
 */
const generateEventId = (type: string, date: Date, name: string): string => {
	return `${slugify(type)}-${formatICalDate(date)}-${slugify(name)}@coptic.io`
}

// Shared timestamp for all events in a single generation run (avoid repeated Date allocations)
let cachedDtstamp = ''

/**
 * Push VEVENT lines to array (avoids string concatenation)
 */
const pushEvent = (
	lines: string[],
	summary: string,
	date: Date,
	description?: string,
	eventType?: string,
	endDate?: Date,
): void => {
	lines.push(
		'BEGIN:VEVENT',
		`UID:${generateEventId(eventType || 'event', date, summary)}`,
		`DTSTAMP:${cachedDtstamp}`,
		`DTSTART;VALUE=DATE:${formatICalDate(date)}`,
		`SUMMARY:${escapeICalText(summary)}`,
	)

	// RFC 5545 3.8.2.2: DTEND is exclusive for DATE values, so a span ends the day after its
	// last day. A single-day event carries no DTEND at all.
	if (endDate && endDate.getTime() > date.getTime()) {
		lines.push(`DTEND;VALUE=DATE:${formatICalDate(addDays(endDate, 1))}`)
	}

	if (description) {
		lines.push(`DESCRIPTION:${escapeICalText(description)}`)
	}

	if (eventType) {
		lines.push(`CATEGORIES:${escapeICalText(eventType)}`)
	}

	lines.push('END:VEVENT')
}

type CelebrationRun = {
	name: string
	type: string
	start: Date
	end: Date
}

const addDays = (date: Date, days: number): Date => {
	const next = new Date(date)
	next.setDate(next.getDate() + days)
	return next
}

/**
 * Group each celebration into runs of consecutive days across the whole requested range.
 *
 * The source data authors a season - Nayrouz across Tout 1-16, the three Paramoun days - by
 * repeating the same celebration on every day it covers. A run is therefore one liturgical
 * occurrence, not one event per day. Runs are detected across the full range rather than per
 * year so a fast spanning 31 December is not re-announced on 1 January.
 */
const getCelebrationRuns = (startYear: number, endYear: number): CelebrationRun[] => {
	const runs: CelebrationRun[] = []
	const open = new Map<string, CelebrationRun>()

	// A run already under way on the first day started before this range, where its event
	// already lives; track it so it does not reopen, but do not announce it again here.
	const carriedIn = new Set(
		(getYearView(startYear - 1).at(-1)?.celebrations ?? []).map((c) => c.name),
	)
	let onFirstDay = true

	for (let year = startYear; year <= endYear; year++) {
		for (const day of getYearView(year)) {
			const todays = new Map(
				(day.celebrations ?? []).filter((c) => c?.name).map((c) => [c.name, c]),
			)

			for (const name of open.keys()) {
				if (!todays.has(name)) open.delete(name)
			}

			for (const [name, celebration] of todays) {
				const existing = open.get(name)
				if (existing) {
					existing.end = day.date
					continue
				}

				const run: CelebrationRun = {
					name,
					type: celebration.type,
					start: day.date,
					end: day.date,
				}
				open.set(name, run)
				if (!(onFirstDay && carriedIn.has(name))) runs.push(run)
			}

			onFirstDay = false
		}
	}

	return runs
}

const ICAL_HEADER = [
	'BEGIN:VCALENDAR',
	'VERSION:2.0',
	'PRODID:-//Coptic.IO//Coptic Orthodox Calendar//EN',
	'CALSCALE:GREGORIAN',
	'METHOD:PUBLISH',
	'X-WR-CALNAME:Coptic Orthodox Calendar',
	'X-WR-TIMEZONE:UTC',
] as const

const ICAL_FOOTER = ['REFRESH-INTERVAL;VALUE=DURATION:P1D', 'X-PUBLISHED-TTL:PT1H'] as const

const pushYearEvents = (lines: string[], year: number): void => {
	// Add moveable feasts (exclude fasts covered by seasons)
	const moveableFeasts = getMoveableFeastsForYear(year)
	for (const feast of moveableFeasts) {
		if (!SEASON_COVERED_FASTS.has(feast.name)) {
			pushEvent(lines, feast.name, feast.date, feast.name, 'Feast')
		}
	}

	// Add liturgical seasons (begins marker only)
	const seasons = getAllSeasonsForYear(year)
	for (const season of seasons) {
		const startDate = new Date(season.startDate)
		if (startDate.getFullYear() === year) {
			const category = season.isFasting ? 'Fasting Period' : 'Liturgical Season'
			pushEvent(lines, `${season.name} begins`, startDate, season.description, category)
		}
	}
}

/**
 * Emit one event per celebration run. A fast reads as a band across the days it covers plus a
 * marker for the day it opens; a feast is a single dated event on the day the run starts.
 */
const pushCelebrationEvents = (lines: string[], startYear: number, endYear: number): void => {
	for (const run of getCelebrationRuns(startYear, endYear)) {
		if (run.type !== 'fast') {
			const category = run.type === 'commemoration' ? 'Commemoration' : 'Feast'
			pushEvent(lines, run.name, run.start, run.name, category)
			continue
		}

		pushEvent(lines, run.name, run.start, run.name, 'Fasting Period', run.end)

		// A fast the data authors on a single day is already its own marker; only a fast that
		// spans days needs a separate event announcing the day it opens.
		if (run.end.getTime() > run.start.getTime()) {
			pushEvent(lines, `${run.name} begins`, run.start, run.name, 'Fasting Period')
		}
	}
}

/**
 * Generate full iCal calendar for a year
 */
export const generateYearCalendar = (year: number): string => {
	cachedDtstamp = formatICalDateTime(new Date())
	const lines: string[] = [
		...ICAL_HEADER,
		`X-WR-CALDESC:Coptic Orthodox liturgical calendar for ${year}`,
		...ICAL_FOOTER,
	]
	pushYearEvents(lines, year)
	pushCelebrationEvents(lines, year, year)
	lines.push('END:VCALENDAR')
	return serializeICal(lines)
}

/**
 * Generate multi-year iCal calendar (for subscriptions)
 */
export const generateMultiYearCalendar = (startYear: number, endYear: number): string => {
	cachedDtstamp = formatICalDateTime(new Date())
	const lines: string[] = [
		...ICAL_HEADER,
		`X-WR-CALDESC:Coptic Orthodox liturgical calendar ${startYear}-${endYear}`,
		...ICAL_FOOTER,
	]
	for (let year = startYear; year <= endYear; year++) {
		pushYearEvents(lines, year)
	}
	pushCelebrationEvents(lines, startYear, endYear)
	lines.push('END:VCALENDAR')
	return serializeICal(lines)
}
