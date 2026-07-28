import type {
	AgpeyaDataStored,
	AgpeyaHour,
	AgpeyaHourData,
	AgpeyaHourId,
	AgpeyaMidnightHour,
	AgpeyaPrayerSection,
} from '../../en/agpeya'
import agpeyaData from './agpeya.json'
import commonPrayers from './common.json'

export type {
	AgpeyaData,
	AgpeyaDataStored,
	AgpeyaGospel,
	AgpeyaGospelRef,
	AgpeyaHour,
	AgpeyaHourData,
	AgpeyaHourId,
	AgpeyaLitany,
	AgpeyaMidnightHour,
	AgpeyaPrayerSection,
	AgpeyaPsalm,
	AgpeyaPsalmRef,
	AgpeyaVerse,
	AgpeyaWatch,
	MidnightWatchId,
} from '../../en/agpeya'

export { isMidnightHour } from '../../en/agpeya'

const data = agpeyaData as unknown as AgpeyaDataStored

export function getAgpeyaHourData(
	hourId: AgpeyaHourId,
): AgpeyaHourData | AgpeyaMidnightHour | null {
	return hourId === 'midnight' ? data.midnight : data.hours[hourId] || null
}

export function getAgpeyaHour(hourId: AgpeyaHourId): AgpeyaHour | null {
	return getAgpeyaHourData(hourId) as AgpeyaHour | null
}

export function getAllAgpeyaHours(): (AgpeyaHourData | AgpeyaMidnightHour)[] {
	return [...Object.values(data.hours), data.midnight]
}

export function getAgpeyaHourIds(): AgpeyaHourId[] {
	return [...Object.keys(data.hours), 'midnight'] as AgpeyaHourId[]
}

export function getCommonPrayer(prayerId: string): AgpeyaPrayerSection | null {
	return (commonPrayers as Record<string, AgpeyaPrayerSection>)[prayerId] || null
}

export function getAllCommonPrayers(): Record<string, AgpeyaPrayerSection> {
	return commonPrayers as Record<string, AgpeyaPrayerSection>
}

export { agpeyaData, commonPrayers }
