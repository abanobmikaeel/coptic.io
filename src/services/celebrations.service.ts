import { celebrations } from '../resources/nonMoveableCelebrations.json'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'
import fromGregorian from '../utils/copticDate'

export const getAllCelebrations = () => {
	return celebrations
}

export const getCelebrationsForDate = (date: Date) => {
	return getStaticCelebrationsForDay(date)
}

export const getUpcomingCelebrations = (days: number = 30) => {
	const upcoming = []
	const today = new Date()

	for (let i = 0; i < days; i++) {
		const currentDate = new Date(today)
		currentDate.setDate(today.getDate() + i)

		const celebrationsForDay = getStaticCelebrationsForDay(currentDate)

		if (celebrationsForDay && celebrationsForDay.length > 0) {
			upcoming.push({
				date: currentDate.toISOString().split('T')[0],
				copticDate: fromGregorian(currentDate),
				celebrations: celebrationsForDay,
			})
		}
	}

	return upcoming
}
