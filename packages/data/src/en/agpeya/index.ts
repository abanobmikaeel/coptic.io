import agpeyaData from './agpeya.json'
import commonPrayers from './common.json'

export type AgpeyaHourId =
	| 'prime'
	| 'terce'
	| 'sext'
	| 'none'
	| 'vespers'
	| 'compline'
	| 'midnight'

export type MidnightWatchId = '1' | '2' | '3'

export interface AgpeyaVerse {
	num: number
	text: string
}

// Psalm reference - points to Bible data instead of embedding text
export interface AgpeyaPsalmRef {
	psalmNumber: number // LXX numbering
	title?: string
	startVerse?: number
	endVerse?: number
	rubric?: string
	note?: string
}

// Resolved psalm with full text (returned from API)
export interface AgpeyaPsalm {
	reference: string
	title: string
	rubric?: string
	verses: AgpeyaVerse[]
}

// Gospel reference - points to Bible data
export interface AgpeyaGospelRef {
	book: string
	chapter: number
	startVerse: number
	endVerse: number
	rubric?: string
}

// Resolved gospel with full text (returned from API)
export interface AgpeyaGospel {
	reference: string
	rubric?: string
	verses: AgpeyaVerse[]
}

export interface AgpeyaPrayerSection {
	id?: string
	title?: string
	content: string[]
	inline?: boolean
	rubric?: string
}

export interface AgpeyaLitany {
	title?: string
	content: string[]
}

// Watch structure for midnight prayers
export interface AgpeyaWatch {
	id: string
	name: string
	theme: string
	opening?: AgpeyaPrayerSection
	psalmsIntro?: string
	psalmRefs: AgpeyaPsalmRef[]
	psalms?: AgpeyaPsalm[] // Populated at runtime by API
	gospelRef?: AgpeyaGospelRef
	gospel?: AgpeyaGospel // Populated at runtime by API
	litanies?: AgpeyaLitany
	closing?: AgpeyaPrayerSection
}

// Midnight hour with watches
export interface AgpeyaMidnightHour {
	id: 'midnight'
	name: string
	englishName: string
	traditionalTime: string
	introduction?: string
	opening: AgpeyaPrayerSection
	thanksgiving?: AgpeyaPrayerSection
	introductoryPsalm?: AgpeyaPsalmRef
	watches: AgpeyaWatch[]
	closing: AgpeyaPrayerSection
}

// Standard hour format (stored in JSON)
export interface AgpeyaHourData {
	id: string
	name: string
	englishName: string
	traditionalTime: string
	introduction?: string
	opening: AgpeyaPrayerSection
	thanksgiving?: AgpeyaPrayerSection
	introductoryPsalm?: AgpeyaPsalmRef // Psalm 50 (51) - prayed at every hour
	psalmsIntro?: string // "From the Psalms of our father David..."
	psalmRefs: AgpeyaPsalmRef[] // References to psalms
	psalms?: AgpeyaPsalm[] // Populated at runtime by API
	gospelRef: AgpeyaGospelRef
	gospel?: AgpeyaGospel // Populated at runtime by API
	litanies: AgpeyaLitany
	lordsPrayer?: AgpeyaPrayerSection
	thanksgivingAfter?: AgpeyaPrayerSection
	closing: AgpeyaPrayerSection
}

// Legacy format for backward compatibility (with embedded verses)
export interface AgpeyaHour {
	id: string
	name: string
	englishName: string
	traditionalTime: string
	introduction?: string
	opening: AgpeyaPrayerSection
	thanksgiving?: AgpeyaPrayerSection
	psalms: AgpeyaPsalm[]
	gospel: AgpeyaGospel
	litanies: AgpeyaLitany
	lordsPrayer?: AgpeyaPrayerSection
	thanksgivingAfter?: AgpeyaPrayerSection
	closing: AgpeyaPrayerSection
}

// Data structure with references (stored)
export interface AgpeyaDataStored {
	common: Record<string, AgpeyaPrayerSection>
	hours: Record<Exclude<AgpeyaHourId, 'midnight'>, AgpeyaHourData>
	midnight: AgpeyaMidnightHour
}

// Legacy data structure (for backward compatibility)
export interface AgpeyaData {
	hours: Record<AgpeyaHourId, AgpeyaHour | AgpeyaMidnightHour>
}

// Type guard for midnight hour
export function isMidnightHour(
	hour: AgpeyaHour | AgpeyaHourData | AgpeyaMidnightHour
): hour is AgpeyaMidnightHour {
	return hour.id === 'midnight' && 'watches' in hour
}

const data = agpeyaData as unknown as AgpeyaDataStored

export function getAgpeyaHourData(hourId: AgpeyaHourId): AgpeyaHourData | AgpeyaMidnightHour | null {
	if (hourId === 'midnight') {
		return data.midnight
	}
	return data.hours[hourId] || null
}

export function getAgpeyaHour(hourId: AgpeyaHourId): AgpeyaHour | null {
	// Legacy function - returns hour with embedded psalms
	// Note: This will need the API to resolve psalm references
	const hourData = getAgpeyaHourData(hourId)
	if (!hourData) return null
	// Cast for backward compatibility - API will populate psalms
	return hourData as unknown as AgpeyaHour
}

export function getAllAgpeyaHours(): (AgpeyaHourData | AgpeyaMidnightHour)[] {
	const hours = Object.values(data.hours) as AgpeyaHourData[]
	return [...hours, data.midnight]
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
