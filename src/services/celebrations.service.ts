import { celebrations } from '../resources/nonMoveableCelebrations.json'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'
import {
	getMoveableFeastsForDate,
	getMoveableFeastsForYear,
} from '../utils/calculations/getMoveableFeasts'
import fromGregorian from '../utils/copticDate'

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

export const getUpcomingCelebrations = (days: number = 30) => {
	const upcoming = []
	const today = new Date()

	for (let i = 0; i < days; i++) {
		const currentDate = new Date(today)
		currentDate.setDate(today.getDate() + i)

		const celebrationsForDay = getStaticCelebrationsForDay(currentDate)

		if (celebrationsForDay && celebrationsForDay.length > 0) {
			const dateString = currentDate.toISOString().split('T')[0]
			if (!dateString) {
				continue
			}

			upcoming.push({
				date: dateString,
				copticDate: fromGregorian(currentDate),
				celebrations: celebrationsForDay,
			})
		}
	}

	return upcoming
}
