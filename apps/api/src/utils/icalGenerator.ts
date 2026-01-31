import { getAllSeasonsForYear, getMoveableFeastsForYear } from '@coptic/core'
import { getStaticCelebrationsForDay } from './calculations/getStaticCelebrations'

// Celebrations that span multiple consecutive days - only show "begins" marker
const MULTI_DAY_CELEBRATIONS = new Set(['St. Mary Fast', 'Advent Fast', 'Nativity Fast', 'Kiahk'])

// Fasts already covered by liturgical seasons (avoid duplicates)
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

/**
 * Escape special characters in iCal text (single regex pass)
 */
const escapeICalText = (text: string): string => {
	return text.replace(/[\\;\n]/g, (char) => (char === '\\' ? '\\\\' : char === ';' ? '\\;' : '\\n'))
}

/**
 * Generate a unique ID for an event
 */
const generateEventId = (type: string, date: Date, name: string): string => {
	const dateStr = formatICalDate(date)
	const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
	return `${type}-${dateStr}-${nameSlug}@coptic.io`
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
): void => {
	lines.push(
		'BEGIN:VEVENT',
		`UID:${generateEventId(eventType || 'event', date, summary)}`,
		`DTSTAMP:${cachedDtstamp}`,
		`DTSTART;VALUE=DATE:${formatICalDate(date)}`,
		`SUMMARY:${escapeICalText(summary)}`,
	)

	if (description) {
		lines.push(`DESCRIPTION:${escapeICalText(description)}`)
	}

	if (eventType) {
		lines.push(`CATEGORIES:${escapeICalText(eventType)}`)
	}

	lines.push('END:VEVENT')
}

/**
 * Get static celebrations for a year, consolidating multi-day celebrations
 * into a single "begins" marker instead of repeated daily events.
 * No "ends" marker needed since the ending feast marks the end.
 */
const getConsolidatedCelebrations = (
	year: number,
): Array<{ name: string; date: Date; story?: string; marker?: 'begins' }> => {
	const result: Array<{ name: string; date: Date; story?: string; marker?: 'begins' }> = []
	const startDate = new Date(year, 0, 1)
	const endDate = new Date(year, 11, 31)

	// Track which multi-day celebrations we've already added a "begins" for
	const addedMultiDay = new Set<string>()
	let previousDayCelebrations = new Set<string>()

	for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
		const currentDate = new Date(date)
		const celebrations = getStaticCelebrationsForDay(currentDate)
		const todayCelebrations = new Set<string>()

		if (celebrations && Array.isArray(celebrations)) {
			for (const celebration of celebrations) {
				if (!celebration?.name) continue
				todayCelebrations.add(celebration.name)

				if (MULTI_DAY_CELEBRATIONS.has(celebration.name)) {
					// Multi-day celebration - only add "begins" on first day
					if (
						!previousDayCelebrations.has(celebration.name) &&
						!addedMultiDay.has(celebration.name)
					) {
						result.push({
							name: celebration.name,
							date: currentDate,
							story: celebration.story,
							marker: 'begins',
						})
						addedMultiDay.add(celebration.name)
					}
				} else {
					// Single-day celebration - add directly
					result.push({ name: celebration.name, date: currentDate, story: celebration.story })
				}
			}
		}

		// Reset tracking when a multi-day celebration ends (so it can begin again later in year)
		for (const name of previousDayCelebrations) {
			if (MULTI_DAY_CELEBRATIONS.has(name) && !todayCelebrations.has(name)) {
				addedMultiDay.delete(name)
			}
		}

		previousDayCelebrations = todayCelebrations
	}

	return result
}

/**
 * Generate full iCal calendar for a year
 */
export const generateYearCalendar = (year: number): string => {
	// Cache timestamp once for all events
	cachedDtstamp = formatICalDateTime(new Date())

	const lines: string[] = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Coptic.IO//Coptic Orthodox Calendar//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'X-WR-CALNAME:Coptic Orthodox Calendar',
		'X-WR-TIMEZONE:UTC',
		`X-WR-CALDESC:Coptic Orthodox liturgical calendar for ${year}`,
		'REFRESH-INTERVAL;VALUE=DURATION:P1D',
		'X-PUBLISHED-TTL:PT1H',
	]

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

	// Add static celebrations (consolidated for multi-day celebrations)
	const celebrations = getConsolidatedCelebrations(year)
	for (const celebration of celebrations) {
		const summary = celebration.marker
			? `${celebration.name} ${celebration.marker}`
			: celebration.name
		pushEvent(lines, summary, celebration.date, celebration.story || '', 'Feast')
	}

	lines.push('END:VCALENDAR')

	return `${lines.join('\r\n')}\r\n`
}

/**
 * Generate multi-year iCal calendar (for subscriptions)
 */
export const generateMultiYearCalendar = (startYear: number, endYear: number): string => {
	// Cache timestamp once for all events
	cachedDtstamp = formatICalDateTime(new Date())

	const lines: string[] = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Coptic.IO//Coptic Orthodox Calendar//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'X-WR-CALNAME:Coptic Orthodox Calendar',
		'X-WR-TIMEZONE:UTC',
		`X-WR-CALDESC:Coptic Orthodox liturgical calendar ${startYear}-${endYear}`,
		'REFRESH-INTERVAL;VALUE=DURATION:P1D',
		'X-PUBLISHED-TTL:PT1H',
	]

	// Generate events for each year
	for (let year = startYear; year <= endYear; year++) {
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

		// Add static celebrations (consolidated for multi-day celebrations)
		const celebrations = getConsolidatedCelebrations(year)
		for (const celebration of celebrations) {
			const summary = celebration.marker
				? `${celebration.name} ${celebration.marker}`
				: celebration.name
			pushEvent(lines, summary, celebration.date, celebration.story || '', 'Feast')
		}
	}

	lines.push('END:VCALENDAR')

	return `${lines.join('\r\n')}\r\n`
}
