import {
	getLiturgicalName,
	getMoveableFeastsForDate,
	getMoveableFeastsForYear,
	gregorianToCoptic,
} from '@coptic/core'
import { addDays, format } from 'date-fns'
import {
	getStaticCelebrationsForDay,
	staticCelebrations,
} from '../utils/calculations/getStaticCelebrations'

type MoveableFeast = ReturnType<typeof getMoveableFeastsForYear>[number]

// A moveable feast in the shape of a fixed celebration
const toCelebration = (feast: MoveableFeast) => ({
	id: feast.id,
	name: feast.name,
	type: feast.type,
	category: feast.category,
	isMoveable: true,
	...(feast.celebratedOnEve ? { celebratedOnEve: true } : {}),
})

export const getAllCelebrations = () => {
	// Combine static celebrations with moveable feasts for current year
	const currentYear = new Date().getFullYear()
	const moveableFeasts = getMoveableFeastsForYear(currentYear)

	return [...staticCelebrations, ...moveableFeasts.map(toCelebration)]
}

/**
 * The fixed and moveable celebrations of a day, names localized (English when a name
 * has no translation), or null when there are none.
 */
export const getCelebrationsForDate = (date: Date, lang = 'en') => {
	const celebrations = [
		...(getStaticCelebrationsForDay(date) ?? []),
		...getMoveableFeastsForDate(date).map(toCelebration),
	].map((celebration) => ({ ...celebration, name: getLiturgicalName(celebration.name, lang) }))
	return celebrations.length > 0 ? celebrations : null
}

export const getUpcomingCelebrations = (days = 30, lang = 'en') => {
	const upcoming = []
	const today = new Date()

	for (let i = 0; i < days; i++) {
		const currentDate = addDays(today, i)

		const celebrationsForDay = getCelebrationsForDate(currentDate, lang)

		if (celebrationsForDay && celebrationsForDay.length > 0) {
			upcoming.push({
				date: format(currentDate, 'yyyy-MM-dd'),
				copticDate: gregorianToCoptic(currentDate),
				celebrations: celebrationsForDay,
			})
		}
	}

	return upcoming
}
