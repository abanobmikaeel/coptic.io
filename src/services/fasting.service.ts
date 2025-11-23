import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'
import { isInMoveableFast } from '../utils/calculations/getMoveableFeasts'
import fromGregorian from '../utils/copticDate'
import { format, addDays, isAfter } from 'date-fns'

export const getFastingForDate = (date: Date) => {
	// Check for moveable fasting periods first
	const moveableFast = isInMoveableFast(date)
	if (moveableFast) {
		return {
			isFasting: true,
			fastType: moveableFast.type,
			description: moveableFast.name,
		}
	}

	// Check for static fasting days
	const celebrationsForDay = getStaticCelebrationsForDay(date)

	if (!celebrationsForDay) {
		return {
			isFasting: false,
			fastType: null,
			description: null,
		}
	}

	const fastingCelebrations = celebrationsForDay.filter((celeb) =>
		celeb.type.toLowerCase().includes('fast')
	)

	if (fastingCelebrations.length === 0) {
		return {
			isFasting: false,
			fastType: null,
			description: null,
		}
	}

	const firstFast = fastingCelebrations[0]
	if (!firstFast) {
		return {
			isFasting: false,
			fastType: null,
			description: null,
		}
	}

	return {
		isFasting: true,
		fastType: firstFast.type,
		description: firstFast.name,
	}
}

export const getFastingCalendar = (year: number) => {
	const fastingDays = []
	const startDate = new Date(year, 0, 1)
	const endDate = new Date(year, 11, 31)

	let currentDate = startDate
	while (!isAfter(currentDate, endDate)) {
		// Check for moveable fasting periods first
		const moveableFast = isInMoveableFast(currentDate)
		if (moveableFast) {
			fastingDays.push({
				date: format(currentDate, 'yyyy-MM-dd'),
				copticDate: fromGregorian(currentDate),
				fastType: moveableFast.type,
				description: moveableFast.name,
			})
			currentDate = addDays(currentDate, 1)
			continue
		}

		// Check for static fasting days
		const celebrationsForDay = getStaticCelebrationsForDay(currentDate)

		if (celebrationsForDay) {
			const fastingCelebrations = celebrationsForDay.filter((celeb) =>
				celeb.type.toLowerCase().includes('fast')
			)

			const firstFast = fastingCelebrations[0]
			if (firstFast) {
				fastingDays.push({
					date: format(currentDate, 'yyyy-MM-dd'),
					copticDate: fromGregorian(currentDate),
					fastType: firstFast.type,
					description: firstFast.name,
				})
			}
		}

		currentDate = addDays(currentDate, 1)
	}

	return fastingDays
}
