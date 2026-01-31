import { type CopticDate, gregorianToCoptic, isInMoveableFast } from '@coptic/core'
import { addDays, format, isAfter } from 'date-fns'
import { getStaticCelebrationsForCopticDay } from '../utils/calculations/getStaticCelebrations'

type FastingResult = {
	isFasting: boolean
	fastType: string | null
	description: string | null
}

const NO_FASTING: FastingResult = { isFasting: false, fastType: null, description: null }

/**
 * Get fasting info using pre-computed Coptic date (avoids redundant conversion)
 */
export const getFastingForCopticDate = (date: Date, copticDate: CopticDate): FastingResult => {
	// Check for moveable fasting periods first
	const moveableFast = isInMoveableFast(date)
	if (moveableFast) {
		return {
			isFasting: true,
			fastType: moveableFast.type,
			description: moveableFast.name,
		}
	}

	// Check for static fasting days using pre-computed Coptic date
	const celebrationsForDay = getStaticCelebrationsForCopticDay(copticDate.month, copticDate.day)
	if (!celebrationsForDay) return NO_FASTING

	const firstFast = celebrationsForDay.find((c) => c.type.toLowerCase().includes('fast'))
	if (!firstFast) return NO_FASTING

	return {
		isFasting: true,
		fastType: firstFast.type,
		description: firstFast.name,
	}
}

/**
 * Get fasting info for a Gregorian date (convenience wrapper)
 */
export const getFastingForDate = (date: Date): FastingResult => {
	const copticDate = gregorianToCoptic(date)
	return getFastingForCopticDate(date, copticDate)
}

export const getFastingCalendar = (year: number) => {
	const fastingDays = []
	const startDate = new Date(year, 0, 1)
	const endDate = new Date(year, 11, 31)

	let currentDate = startDate
	while (!isAfter(currentDate, endDate)) {
		// Compute Coptic date once per day
		const copticDate = gregorianToCoptic(currentDate)

		// Check for moveable fasting periods first
		const moveableFast = isInMoveableFast(currentDate)
		if (moveableFast) {
			fastingDays.push({
				date: format(currentDate, 'yyyy-MM-dd'),
				copticDate,
				fastType: moveableFast.type,
				description: moveableFast.name,
			})
			currentDate = addDays(currentDate, 1)
			continue
		}

		// Check for static fasting days using pre-computed Coptic date
		const celebrationsForDay = getStaticCelebrationsForCopticDay(copticDate.month, copticDate.day)

		if (celebrationsForDay) {
			const firstFast = celebrationsForDay.find((c) => c.type.toLowerCase().includes('fast'))
			if (firstFast) {
				fastingDays.push({
					date: format(currentDate, 'yyyy-MM-dd'),
					copticDate,
					fastType: firstFast.type,
					description: firstFast.name,
				})
			}
		}

		currentDate = addDays(currentDate, 1)
	}

	return fastingDays
}
