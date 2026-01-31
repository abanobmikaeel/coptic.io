import { getMoveableFeastsForYear } from '../calendar/moveable'
import { getEasterDate } from '../calendar/pascha'
import { addDays, toMidnight } from '../utils/date'

/**
 * A liturgical season in the Coptic calendar
 */
export interface LiturgicalSeason {
	/** Name of the season */
	name: string
	/** Description of the season */
	description: string
	/** Start date of the season */
	startDate: Date
	/** End date of the season */
	endDate: Date
	/** Whether fasting is observed during this season */
	isFasting: boolean
	/** Whether the season dates are moveable (based on Easter) */
	type: 'moveable' | 'fixed'
}

/**
 * Get all liturgical seasons for a given Gregorian year
 *
 * This includes both moveable seasons (based on Easter) and fixed seasons.
 *
 * @param gregorianYear - The year to get seasons for
 * @returns Array of liturgical seasons
 */
export const getAllSeasonsForYear = (gregorianYear: number): LiturgicalSeason[] => {
	const easterDateObj = getEasterDate(gregorianYear)
	const moveableFeasts = getMoveableFeastsForYear(gregorianYear)

	const seasons: LiturgicalSeason[] = []

	// Fast of Nineveh (3 days) - moveable
	const nineveh = moveableFeasts.find((f) => f.name === 'Fast of Nineveh')
	if (nineveh) {
		seasons.push({
			name: 'Fast of Nineveh',
			description: 'Three-day fast commemorating the repentance of Nineveh',
			startDate: nineveh.date,
			endDate: addDays(nineveh.date, 2),
			isFasting: true,
			type: 'moveable',
		})
	}

	// Great Lent (55 days including preparation week) - moveable
	const greatLent = moveableFeasts.find((f) => f.name === 'Great Lent')
	if (greatLent) {
		seasons.push({
			name: 'Great Lent',
			description: 'The Great Fast of 55 days preparing for Easter',
			startDate: greatLent.date,
			endDate: addDays(easterDateObj, -1), // Day before Easter
			isFasting: true,
			type: 'moveable',
		})
	}

	// Holy Week (part of Great Lent but distinct) - moveable
	const palmSunday = moveableFeasts.find((f) => f.name === 'Palm Sunday')
	if (palmSunday) {
		seasons.push({
			name: 'Holy Week',
			description: 'The week of the passion of Christ',
			startDate: palmSunday.date,
			endDate: addDays(easterDateObj, -1), // Day before Easter (Holy Saturday)
			isFasting: true,
			type: 'moveable',
		})
	}

	// Paschal/Easter Season (50 days from Easter to Pentecost) - moveable
	const pentecost = moveableFeasts.find((f) => f.name === 'Pentecost')
	if (pentecost) {
		seasons.push({
			name: 'Paschal Season',
			description: 'The 50 days of joy from Easter to Pentecost',
			startDate: easterDateObj,
			endDate: pentecost.date,
			isFasting: false,
			type: 'moveable',
		})
	}

	// Apostles' Fast - moveable start, fixed end (July 12)
	const apostlesFast = moveableFeasts.find((f) => f.name === "Apostles' Fast")
	if (apostlesFast) {
		seasons.push({
			name: "Apostles' Fast",
			description: 'Fast from Pentecost to the Feast of the Apostles',
			startDate: apostlesFast.date,
			endDate: new Date(gregorianYear, 6, 12), // July 12
			isFasting: true,
			type: 'moveable',
		})
	}

	// Nativity Fast (Advent) - November 25 to January 6 - fixed
	const nativityStart = new Date(gregorianYear, 10, 25) // November 25
	const nativityEnd = new Date(gregorianYear + 1, 0, 6) // January 6 of next year
	seasons.push({
		name: 'Nativity Fast',
		description: 'The 43-day fast preparing for Christmas',
		startDate: nativityStart,
		endDate: nativityEnd,
		isFasting: true,
		type: 'fixed',
	})

	// Also add previous year's Nativity Fast for early January dates
	const prevNativityStart = new Date(gregorianYear - 1, 10, 25)
	const prevNativityEnd = new Date(gregorianYear, 0, 6)
	seasons.push({
		name: 'Nativity Fast',
		description: 'The 43-day fast preparing for Christmas',
		startDate: prevNativityStart,
		endDate: prevNativityEnd,
		isFasting: true,
		type: 'fixed',
	})

	return seasons
}

/**
 * Priority order for overlapping seasons
 */
const SEASON_PRIORITY: Record<string, number> = {
	'Holy Week': 1,
	'Great Lent': 2,
	'Fast of Nineveh': 3,
	"Apostles' Fast": 4,
	'Nativity Fast': 5,
	'Paschal Season': 6,
}

/**
 * Internal season with pre-computed timestamps for fast comparisons
 */
interface CachedSeason {
	season: LiturgicalSeason
	startTs: number
	endTs: number
	priority: number
}

// Cache for seasons with pre-computed timestamps, keyed by year
const seasonsCache = new Map<number, CachedSeason[]>()

/**
 * Get cached seasons with pre-computed timestamps for a year
 */
const getCachedSeasonsForYear = (year: number): CachedSeason[] => {
	let cached = seasonsCache.get(year)
	if (!cached) {
		const seasons = getAllSeasonsForYear(year)
		cached = seasons.map((season) => ({
			season,
			startTs: toMidnight(season.startDate),
			endTs: toMidnight(season.endDate),
			priority: SEASON_PRIORITY[season.name] ?? 999,
		}))
		seasonsCache.set(year, cached)
	}
	return cached
}

/**
 * Get the current liturgical season for a specific date
 *
 * If multiple seasons overlap, returns the highest priority one.
 *
 * @param date - The date to check
 * @returns The current liturgical season or null if not in a special season
 */
export const getLiturgicalSeasonForDate = (date: Date): LiturgicalSeason | null => {
	const dateTs = toMidnight(date)
	const year = date.getFullYear()

	// Get seasons from current year and adjacent years to handle year boundaries
	const prevYear = getCachedSeasonsForYear(year - 1)
	const currYear = getCachedSeasonsForYear(year)
	const nextYear = getCachedSeasonsForYear(year + 1)

	// Find the highest priority matching season
	let bestMatch: CachedSeason | null = null

	for (const cached of prevYear) {
		if (dateTs >= cached.startTs && dateTs <= cached.endTs) {
			if (!bestMatch || cached.priority < bestMatch.priority) {
				bestMatch = cached
			}
		}
	}

	for (const cached of currYear) {
		if (dateTs >= cached.startTs && dateTs <= cached.endTs) {
			if (!bestMatch || cached.priority < bestMatch.priority) {
				bestMatch = cached
			}
		}
	}

	for (const cached of nextYear) {
		if (dateTs >= cached.startTs && dateTs <= cached.endTs) {
			if (!bestMatch || cached.priority < bestMatch.priority) {
				bestMatch = cached
			}
		}
	}

	return bestMatch?.season ?? null
}

/**
 * Check if a date is in a fasting period
 *
 * @param date - The date to check
 * @returns true if the date is in a fasting period
 */
export const isInFastingPeriod = (date: Date): boolean => {
	const season = getLiturgicalSeasonForDate(date)
	return season?.isFasting ?? false
}

/**
 * Get all fasting periods for a year
 *
 * @param gregorianYear - The year to get fasting periods for
 * @returns Array of fasting seasons
 */
export const getFastingPeriodsForYear = (gregorianYear: number): LiturgicalSeason[] => {
	return getAllSeasonsForYear(gregorianYear).filter((season) => season.isFasting)
}
