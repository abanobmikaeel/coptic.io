import {
	type CopticDate,
	getLiturgicalSeasonForDate,
	gregorianToCoptic,
	isInMoveableFast,
	isWeeklyFastingDay,
} from '@coptic/core'
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
	if (celebrationsForDay) {
		const firstFast = celebrationsForDay.find((c) => c.type.toLowerCase().includes('fast'))
		if (firstFast) {
			return {
				isFasting: true,
				fastType: firstFast.type,
				description: firstFast.name,
			}
		}
		// Feast day with no fast — weekly fast is suspended
		return NO_FASTING
	}

	// Weekly Wednesday/Friday fast — except during the Paschal season (50 days after Easter)
	const season = getLiturgicalSeasonForDate(date)
	const isPaschal = season?.name === 'Paschal Season'
	if (!isPaschal && isWeeklyFastingDay(date)) {
		const dayOfWeek = date.getDay()
		return {
			isFasting: true,
			fastType: 'fast',
			description: dayOfWeek === 3 ? 'Wednesday Fast' : 'Friday Fast',
		}
	}

	return NO_FASTING
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
		if (d.moveableFast) {
			result.push({
				date: d.gregorianDate,
				copticDate: d.copticDate,
				fastType: d.moveableFast.type,
				description: d.moveableFast.name,
			})
			continue
		}

		if (d.celebrations) {
			const fast = d.celebrations.find((c) => c.type.toLowerCase().includes('fast'))
			if (fast) {
				result.push({
					date: d.gregorianDate,
					copticDate: d.copticDate,
					fastType: fast.type,
					description: fast.name,
				})
			}
			// Any celebration (feast or fast) suppresses the weekly fast
			continue
		}

		// Weekly Wednesday/Friday fast — except during the Paschal season
		const date = new Date(d.gregorianDate)
		if (isWeeklyFastingDay(date)) {
			const season = getLiturgicalSeasonForDate(date)
			if (season?.name !== 'Paschal Season') {
				result.push({
					date: d.gregorianDate,
					copticDate: d.copticDate,
					fastType: 'fast',
					description: date.getDay() === 3 ? 'Wednesday Fast' : 'Friday Fast',
				})
			}
		}
	}

	return result
}
