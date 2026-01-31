import { gregorianToCoptic } from '@coptic/core'
import dayCelebrations from '../../resources/dayReadings.json'
import { celebrations } from '../../resources/nonMoveableCelebrations.json'

export interface Celebration {
	id: number
	name: string
	type: string
	month?: string
	isMoveable: boolean
}

// Map for O(1) lookups
const celebrationsById = new Map(celebrations.map((c) => [c.id, c]))

/**
 * Get static celebrations for a Coptic day (avoids redundant date conversion)
 */
const getStaticCelebrationsForCopticDay = (month: number, day: number): Celebration[] | null => {
	const monthFound = dayCelebrations[month - 1]
	if (!monthFound) {
		throw new Error('Month not found')
	}
	const celebrationsFound = monthFound.daysWithCelebrations[day - 1]
	if (celebrationsFound === 0) {
		return null
	}

	const celebrationData: Celebration[] = []
	const ids = Array.isArray(celebrationsFound) ? celebrationsFound : [celebrationsFound]

	for (const id of ids) {
		if (typeof id !== 'number') continue
		const celebFound = celebrationsById.get(id)
		if (celebFound) {
			celebrationData.push({ ...celebFound, isMoveable: false })
		}
	}

	return celebrationData
}

/**
 * Get static celebrations for a Gregorian date (convenience wrapper)
 */
const getStaticCelebrationsForDay = (date: Date): Celebration[] | null => {
	const { month, day } = gregorianToCoptic(date)
	return getStaticCelebrationsForCopticDay(month, day)
}

export { getStaticCelebrationsForDay, getStaticCelebrationsForCopticDay }
