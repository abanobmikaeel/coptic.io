import agpeyaData from './agpeya.json'
import commonPrayers from './common.json'

// Re-export all types from the English module so consumers import from one place.
export type {
	AgpeyaHourId,
	MidnightWatchId,
	AgpeyaVerse,
	AgpeyaPsalmRef,
	AgpeyaPsalm,
	AgpeyaGospelRef,
	AgpeyaGospel,
	AgpeyaPrayerSection,
	AgpeyaLitany,
	AgpeyaWatch,
	AgpeyaMidnightHour,
	AgpeyaHourData,
	AgpeyaHour,
	AgpeyaDataStored,
	AgpeyaData,
} from '../../en/agpeya'

export {
	isMidnightHour,
} from '../../en/agpeya'

const data = agpeyaData as unknown as import('../../en/agpeya').AgpeyaDataStored

export function getAgpeyaHourData(
	hourId: import('../../en/agpeya').AgpeyaHourId,
): import('../../en/agpeya').AgpeyaHourData | import('../../en/agpeya').AgpeyaMidnightHour | null {
	if (hourId === 'midnight') {
		return data.midnight
	}
	return data.hours[hourId] || null
}

export function getAgpeyaHour(hourId: import('../../en/agpeya').AgpeyaHourId): import('../../en/agpeya').AgpeyaHour | null {
	const hourData = getAgpeyaHourData(hourId)
	if (!hourData) return null
	return hourData as unknown as import('../../en/agpeya').AgpeyaHour
}

export function getAllAgpeyaHours(): (import('../../en/agpeya').AgpeyaHourData | import('../../en/agpeya').AgpeyaMidnightHour)[] {
	const hours = Object.values(data.hours) as import('../../en/agpeya').AgpeyaHourData[]
	return [...hours, data.midnight]
}

export function getAgpeyaHourIds(): import('../../en/agpeya').AgpeyaHourId[] {
	return [...Object.keys(data.hours), 'midnight'] as import('../../en/agpeya').AgpeyaHourId[]
}

export function getCommonPrayer(prayerId: string): import('../../en/agpeya').AgpeyaPrayerSection | null {
	return (commonPrayers as Record<string, import('../../en/agpeya').AgpeyaPrayerSection>)[prayerId] || null
}

export function getAllCommonPrayers(): Record<string, import('../../en/agpeya').AgpeyaPrayerSection> {
	return commonPrayers as Record<string, import('../../en/agpeya').AgpeyaPrayerSection>
}

export { agpeyaData, commonPrayers }
