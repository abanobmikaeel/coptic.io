import { celebrations } from '../../resources/nonMoveableCelebrations.json'
import dayCelebrations from '../../resources/dayReadings.json'
import fromGregorian from '../copticDate'

const getStaticCelebrationsForDay = (date: Date) => {
	const { month, day }: { month: number; day: number } = fromGregorian(date)
	const monthFound = dayCelebrations[month - 1]
	if (!monthFound) {
		throw new Error('Month not found')
	}
	const celebrationsFound = monthFound.daysWithCelebrations[day - 1]
	// handle multiple celebrations
	const celebrationData = []
	if (Array.isArray(celebrationsFound)) {
		celebrationsFound.forEach((celeb) => {
			celebrationData.push(celebrations.find((x) => x.id === celeb))
		})
	} else {
		celebrationData.push(celebrations.find((x) => x.id === celebrationsFound))
	}
	return celebrationData
}

export { getStaticCelebrationsForDay }
