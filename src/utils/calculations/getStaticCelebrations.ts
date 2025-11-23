import { celebrations } from '../../resources/nonMoveableCelebrations.json'
import dayCelebrations from '../../resources/dayReadings.json'
import fromGregorian from '../copticDate'

export interface Celebration {
	id: number
	name: string
	type: string
	month?: string
	isMoveable: boolean
}

const getStaticCelebrationsForDay = (date: Date): Celebration[] | null => {
	const { month, day }: { month: number; day: number } = fromGregorian(date)
	const monthFound = dayCelebrations[month - 1]
	if (!monthFound) {
		throw new Error('Month not found')
	}
	const celebrationsFound = monthFound.daysWithCelebrations[day - 1]
	// handle multiple celebrations
	const celebrationData: Celebration[] = []
	if (celebrationsFound === 0) {
		return null
	}

	if (Array.isArray(celebrationsFound)) {
		celebrationsFound.forEach((celeb) => {
			const celebFound = celebrations.find((x) => x.id === celeb)
			if (celebFound) {
				celebrationData.push({ ...celebFound, isMoveable: false })
			}
		})
	} else {
		const celebFound = celebrations.find((x) => x.id === celebrationsFound)
		if (celebFound) {
			celebrationData.push({ ...celebFound, isMoveable: false })
		}
	}
	return celebrationData
}

export { getStaticCelebrationsForDay }
