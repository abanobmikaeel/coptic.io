import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'
import fromGregorian from '../utils/copticDate'

export const getFastingForDate = (date: Date) => {
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

	return {
		isFasting: true,
		fastType: fastingCelebrations[0].type,
		description: fastingCelebrations[0].name,
	}
}

export const getFastingCalendar = (year: number) => {
	const fastingDays = []
	const startDate = new Date(year, 0, 1)
	const endDate = new Date(year, 11, 31)

	for (
		let currentDate = new Date(startDate);
		currentDate <= endDate;
		currentDate.setDate(currentDate.getDate() + 1)
	) {
		const celebrationsForDay = getStaticCelebrationsForDay(currentDate)

		if (celebrationsForDay) {
			const fastingCelebrations = celebrationsForDay.filter((celeb) =>
				celeb.type.toLowerCase().includes('fast')
			)

			if (fastingCelebrations.length > 0) {
				fastingDays.push({
					date: currentDate.toISOString().split('T')[0],
					copticDate: fromGregorian(currentDate),
					fastType: fastingCelebrations[0].type,
					description: fastingCelebrations[0].name,
				})
			}
		}
	}

	return fastingDays
}
