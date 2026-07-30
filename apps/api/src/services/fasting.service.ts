import {
	type CopticDate,
	getFastingForDate as coreGetFastingForDate,
	gregorianToCoptic,
} from '@coptic/core'
import { getStaticCelebrationsForCopticDay } from '../utils/calculations/getStaticCelebrations'
import { getYearView } from './yearView.service'

type FastingResult = {
	isFasting: boolean
	fastType: string | null
	description: string | null
}

/**
 * Get fasting info using a pre-computed Coptic date (avoids redundant conversion).
 */
export const getFastingForCopticDate = (date: Date, copticDate: CopticDate): FastingResult => {
	const staticCelebrations = getStaticCelebrationsForCopticDay(copticDate.month, copticDate.day)
	return coreGetFastingForDate(date, staticCelebrations ?? undefined)
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

	for (const d of days) {
		const fasting = getFastingForCopticDate(d.date, d.copticDate)
		if (fasting.isFasting && fasting.fastType && fasting.description) {
			result.push({
				date: d.gregorianDate,
				copticDate: d.copticDate,
				fastType: fasting.fastType,
				description: fasting.description,
			})
		}
	}

	return result
}
