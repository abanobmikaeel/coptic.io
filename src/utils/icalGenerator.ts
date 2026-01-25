import { getAllSeasonsForYear } from './calculations/getLiturgicalSeason'
import { getMoveableFeastsForYear } from './calculations/getMoveableFeasts'
import { getStaticCelebrationsForDay } from './calculations/getStaticCelebrations'

interface Celebration {
	name: string
	story?: string
}

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
 * Escape special characters in iCal text
 * Only escape backslashes, semicolons, and newlines (commas don't need escaping in SUMMARY)
 */
const escapeICalText = (text: string): string => {
	return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

/**
 * Generate a unique ID for an event
 */
const generateEventId = (type: string, date: Date, name: string): string => {
	const dateStr = formatICalDate(date)
	const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
	return `${type}-${dateStr}-${nameSlug}@coptic.io`
}

/**
 * Generate iCal VEVENT component
 */
const generateEvent = (
	summary: string,
	date: Date,
	description?: string,
	eventType?: string,
): string => {
	const uid = generateEventId(eventType || 'event', date, summary)
	const dtstart = formatICalDate(date)
	const dtstamp = formatICalDateTime(new Date())

	let event = 'BEGIN:VEVENT\r\n'
	event += `UID:${uid}\r\n`
	event += `DTSTAMP:${dtstamp}\r\n`
	event += `DTSTART;VALUE=DATE:${dtstart}\r\n`
	event += `SUMMARY:${escapeICalText(summary)}\r\n`

	if (description) {
		event += `DESCRIPTION:${escapeICalText(description)}\r\n`
	}

	if (eventType) {
		event += `CATEGORIES:${escapeICalText(eventType)}\r\n`
	}

	event += 'END:VEVENT\r\n'

	return event
}

/**
 * Generate full iCal calendar for a year
 */
export const generateYearCalendar = (year: number): string => {
	let ical = 'BEGIN:VCALENDAR\r\n'
	ical += 'VERSION:2.0\r\n'
	ical += 'PRODID:-//Coptic.IO//Coptic Orthodox Calendar//EN\r\n'
	ical += 'CALSCALE:GREGORIAN\r\n'
	ical += 'METHOD:PUBLISH\r\n'
	ical += 'X-WR-CALNAME:Coptic Orthodox Calendar\r\n'
	ical += 'X-WR-TIMEZONE:UTC\r\n'
	ical += `X-WR-CALDESC:Coptic Orthodox liturgical calendar for ${year}\r\n`
	ical += 'REFRESH-INTERVAL;VALUE=DURATION:P1D\r\n' // Refresh daily
	ical += 'X-PUBLISHED-TTL:PT1H\r\n' // Cache for 1 hour

	// Add moveable feasts
	const moveableFeasts = getMoveableFeastsForYear(year)
	moveableFeasts.forEach((feast) => {
		ical += generateEvent(feast.name, feast.date, `${feast.name} - ${feast.type}`, 'Moveable Feast')
	})

	// Add liturgical seasons (only those that start within the year)
	const seasons = getAllSeasonsForYear(year)
	seasons.forEach((season) => {
		const startDate = new Date(season.startDate)
		// Only include seasons that start in the requested year
		if (startDate.getFullYear() === year) {
			ical += generateEvent(
				`${season.name} begins`,
				startDate,
				season.description,
				season.isFasting ? 'Fasting Period' : 'Liturgical Season',
			)
		}
	})

	// Add static celebrations throughout the year
	// Skip daily fast events since we already have "begins" events from seasons
	const startDate = new Date(year, 0, 1)
	const endDate = new Date(year, 11, 31)
	const fastNames = new Set(['Advent Fast', 'Nativity Fast', 'Kiahk'])

	for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
		const celebrations = getStaticCelebrationsForDay(new Date(date))

		if (celebrations && Array.isArray(celebrations)) {
			celebrations.forEach((celebration: Celebration) => {
				if (celebration?.name && !fastNames.has(celebration.name)) {
					ical += generateEvent(celebration.name, new Date(date), celebration.story || '', 'Feast')
				}
			})
		}
	}

	ical += 'END:VCALENDAR\r\n'

	return ical
}

/**
 * Generate multi-year iCal calendar (for subscriptions)
 */
export const generateMultiYearCalendar = (startYear: number, endYear: number): string => {
	let ical = 'BEGIN:VCALENDAR\r\n'
	ical += 'VERSION:2.0\r\n'
	ical += 'PRODID:-//Coptic.IO//Coptic Orthodox Calendar//EN\r\n'
	ical += 'CALSCALE:GREGORIAN\r\n'
	ical += 'METHOD:PUBLISH\r\n'
	ical += 'X-WR-CALNAME:Coptic Orthodox Calendar\r\n'
	ical += 'X-WR-TIMEZONE:UTC\r\n'
	ical += `X-WR-CALDESC:Coptic Orthodox liturgical calendar ${startYear}-${endYear}\r\n`
	ical += 'REFRESH-INTERVAL;VALUE=DURATION:P1D\r\n' // Refresh daily
	ical += 'X-PUBLISHED-TTL:PT1H\r\n' // Cache for 1 hour

	// Generate events for each year
	for (let year = startYear; year <= endYear; year++) {
		// Add moveable feasts
		const moveableFeasts = getMoveableFeastsForYear(year)
		moveableFeasts.forEach((feast) => {
			ical += generateEvent(
				feast.name,
				feast.date,
				`${feast.name} - ${feast.type}`,
				'Moveable Feast',
			)
		})

		// Add liturgical seasons (only those that start within the year)
		const seasons = getAllSeasonsForYear(year)
		seasons.forEach((season) => {
			const startDate = new Date(season.startDate)
			// Only include seasons that start in the requested year
			if (startDate.getFullYear() === year) {
				ical += generateEvent(
					`${season.name} begins`,
					startDate,
					season.description,
					season.isFasting ? 'Fasting Period' : 'Liturgical Season',
				)
			}
		})

		// Add static celebrations
		// Skip daily fast events since we already have "begins" events from seasons
		const startDate = new Date(year, 0, 1)
		const endDate = new Date(year, 11, 31)
		const fastNames = new Set(['Advent Fast', 'Nativity Fast', 'Kiahk'])

		for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
			const celebrations = getStaticCelebrationsForDay(new Date(date))

			if (celebrations && Array.isArray(celebrations)) {
				celebrations.forEach((celebration: Celebration) => {
					if (celebration?.name && !fastNames.has(celebration.name)) {
						ical += generateEvent(
							celebration.name,
							new Date(date),
							celebration.story || '',
							'Feast',
						)
					}
				})
			}
		}
	}

	ical += 'END:VCALENDAR\r\n'

	return ical
}
