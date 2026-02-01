import agpeyaData from './agpeya.json'

export type AgpeyaHourId =
	| 'prime'
	| 'terce'
	| 'sext'
	| 'none'
	| 'vespers'
	| 'compline'
	| 'midnight'

export interface AgpeyaVerse {
	num: number
	text: string
}

export interface AgpeyaPsalm {
	reference: string
	title: string
	rubric?: string
	verses: AgpeyaVerse[]
}

export interface AgpeyaGospel {
	reference: string
	rubric?: string
	verses: AgpeyaVerse[]
}

export interface AgpeyaPrayerSection {
	title?: string
	content: string[]
	inline?: boolean
}

export interface AgpeyaLitany {
	title?: string
	content: string[]
}

// New structured hour format
export interface AgpeyaHour {
	id: string
	name: string
	englishName: string
	traditionalTime: string
	introduction?: string
	opening: AgpeyaPrayerSection
	thanksgiving?: AgpeyaPrayerSection
	psalms: AgpeyaPsalm[]
	alleluia?: AgpeyaPrayerSection
	gospel: AgpeyaGospel
	litanies: AgpeyaLitany
	lordsPrayer?: AgpeyaPrayerSection
	thanksgivingAfter?: AgpeyaPrayerSection
	closing: AgpeyaPrayerSection
}

export interface AgpeyaData {
	hours: Record<AgpeyaHourId, AgpeyaHour>
}

const data = agpeyaData as AgpeyaData

export function getAgpeyaHour(hourId: AgpeyaHourId): AgpeyaHour | null {
	return data.hours[hourId] || null
}

export function getAllAgpeyaHours(): AgpeyaHour[] {
	return Object.values(data.hours)
}

export function getAgpeyaHourIds(): AgpeyaHourId[] {
	return Object.keys(data.hours) as AgpeyaHourId[]
}

export { agpeyaData }
