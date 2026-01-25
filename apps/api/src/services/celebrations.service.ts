import { getMoveableFeastsForDate, getMoveableFeastsForYear, gregorianToCoptic } from '@coptic/core'
import { addDays, format } from 'date-fns'
import { celebrations } from '../resources/nonMoveableCelebrations.json'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'

export const getAllCelebrations = () => {
	// Combine static celebrations with moveable feasts for current year
	const currentYear = new Date().getFullYear()
	const moveableFeasts = getMoveableFeastsForYear(currentYear)

	// Convert moveable feasts to celebration format
	const moveableCelebrations = moveableFeasts.map((feast) => ({
		id: feast.id,
		name: feast.name,
		type: feast.type,
		isMoveable: true,
	}))

	return [...celebrations, ...moveableCelebrations]
}

export const getCelebrationsForDate = (date: Date) => {
	const staticCelebrations = getStaticCelebrationsForDay(date) || []
	const moveableCelebrations = getMoveableFeastsForDate(date)

	// Convert moveable feasts to celebration format
	const moveableAsCelebrations = moveableCelebrations.map((feast) => ({
		id: feast.id,
		name: feast.name,
		type: feast.type,
		isMoveable: true,
	}))

	const allCelebrations = [...staticCelebrations, ...moveableAsCelebrations]
	return allCelebrations.length > 0 ? allCelebrations : null
}

export const getUpcomingCelebrations = (days = 30) => {
	const upcoming = []
	const today = new Date()

	for (let i = 0; i < days; i++) {
		const currentDate = addDays(today, i)

		const celebrationsForDay = getStaticCelebrationsForDay(currentDate)

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
