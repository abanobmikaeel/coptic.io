import {
	getAllSeasonsForYear,
	getFastingPeriodsForYear,
	getLiturgicalDescription,
	getLiturgicalName,
	getLiturgicalSeasonForDate,
	isInFastingPeriod,
	toDateKey,
} from '@coptic/core'
import type { FastingPeriods, SeasonResponse, SeasonYear } from '../schemas'

/** The liturgical season a date falls in, or Ordinary Time outside the major seasons. */
export const getSeasonForDate = (date: Date, lang = 'en'): SeasonResponse => {
	const season = getLiturgicalSeasonForDate(date)
	if (!season) {
		return {
			date: toDateKey(date),
			season: getLiturgicalName('Ordinary Time', lang),
			description: getLiturgicalDescription(
				'Ordinary Time',
				'Regular liturgical time outside major seasons',
				lang,
			),
			isFasting: false,
		}
	}
	return {
		date: toDateKey(date),
		season: getLiturgicalName(season.name, lang),
		description: getLiturgicalDescription(season.name, season.description, lang),
		startDate: toDateKey(season.startDate),
		endDate: toDateKey(season.endDate),
		isFasting: isInFastingPeriod(date),
		type: season.type,
	}
}

export const getSeasonsForYear = (year: number): SeasonYear => ({
	year,
	seasons: getAllSeasonsForYear(year).map((s) => ({
		name: s.name,
		description: s.description,
		startDate: toDateKey(s.startDate),
		endDate: toDateKey(s.endDate),
		isFasting: s.isFasting,
		type: s.type,
	})),
})

export const getFastingPeriods = (year: number): FastingPeriods => ({
	year,
	fastingPeriods: getFastingPeriodsForYear(year).map((f) => ({
		name: f.name,
		description: f.description,
		startDate: toDateKey(f.startDate),
		endDate: toDateKey(f.endDate),
		type: f.type,
	})),
})
