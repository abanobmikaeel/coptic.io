import { type CopticDate, gregorianToCoptic, isInMoveableFast } from '@coptic/core'
import { getStaticCelebrationsForCopticDay } from '../utils/calculations/getStaticCelebrations'
import { getYearView } from './yearView.service'

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
	const days = getYearView(year)
	const result: Array<{
		date: string
		copticDate: (typeof days)[0]['copticDate']
		fastType: string
		description: string
	}> = []

	// One pass implementation to reduce the looping
	for (const d of days) {
		if (d.moveableFast) {
			result.push({
				date: d.gregorianDate,
				copticDate: d.copticDate,
				fastType: d.moveableFast.type,
				description: d.moveableFast.name,
			})
		} else {
			const fast = d.celebrations?.find((c) => c.type.toLowerCase().includes('fast'))
			if (fast) {
				result.push({
					date: d.gregorianDate,
					copticDate: d.copticDate,
					fastType: fast.type,
					description: fast.name,
				})
			}
		}
	}

	return result
}
