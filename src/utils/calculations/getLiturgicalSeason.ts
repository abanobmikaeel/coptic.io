import easterDate from './getEaster'
import { getMoveableFeastsForYear } from './getMoveableFeasts'
import { addDays, normalizeDate } from '../dateUtils'

export interface LiturgicalSeason {
	name: string
	description: string
	startDate: Date
	endDate: Date
	isFasting: boolean
	type: 'moveable' | 'fixed'
}

/**
 * Get all liturgical seasons for a given Gregorian year
 */
export const getAllSeasonsForYear = (gregorianYear: number): LiturgicalSeason[] => {
	const easter = easterDate(gregorianYear)
	const easterDateObj = new Date(easter.year, easter.month - 1, easter.day)
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

	// Also add previous year's Nativity Fast in case we're in early January
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
 * Get the current liturgical season for a specific date
 */
export const getLiturgicalSeasonForDate = (date: Date): LiturgicalSeason | null => {
	const normalizedDate = normalizeDate(date)
	const year = date.getFullYear()

	// Get seasons from current year and adjacent years to handle year boundaries
	const allSeasons = [
		...getAllSeasonsForYear(year - 1),
		...getAllSeasonsForYear(year),
		...getAllSeasonsForYear(year + 1),
	]

	// Find all seasons that contain this date
	const matchingSeasons = allSeasons.filter((season) => {
		const normalizedStart = normalizeDate(season.startDate)
		const normalizedEnd = normalizeDate(season.endDate)
		return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd
	})

	if (matchingSeasons.length === 0) {
		return null
	}

	// Priority order: Holy Week > Great Lent > other fasts > other seasons
	const priority: Record<string, number> = {
		'Holy Week': 1,
		'Great Lent': 2,
		'Fast of Nineveh': 3,
		"Apostles' Fast": 4,
		'Nativity Fast': 5,
		'Paschal Season': 6,
	}

	// Sort by priority and return the highest priority season
	matchingSeasons.sort((a, b) => {
		const priorityA = priority[a.name] || 999
		const priorityB = priority[b.name] || 999
		return priorityA - priorityB
	})

	return matchingSeasons[0]
}

/**
 * Check if a date is in a fasting period
 */
export const isInFastingPeriod = (date: Date): boolean => {
	const season = getLiturgicalSeasonForDate(date)
	return season?.isFasting || false
}

/**
 * Get all fasting periods for a year
 */
export const getFastingPeriodsForYear = (
	gregorianYear: number
): LiturgicalSeason[] => {
	return getAllSeasonsForYear(gregorianYear).filter((season) => season.isFasting)
}
