// Types for Agpeya prayer data

export interface AgpeyaVerse {
	num: number
	text: string
}

export interface AgpeyaPsalm {
	title: string
	reference: string
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

// Watch data for midnight prayers
export interface AgpeyaWatchData {
	id: string
	name: string
	theme: string
	opening?: AgpeyaPrayerSection
	psalms: AgpeyaPsalm[]
	gospel?: AgpeyaGospel
	litanies?: AgpeyaLitany
	closing?: AgpeyaPrayerSection
}

// Standard hour data
export interface AgpeyaHourData {
	id: string
	name: string
	englishName: string
	traditionalTime: string
	introduction?: string
	opening: AgpeyaPrayerSection
	thanksgiving?: AgpeyaPrayerSection
	introductoryPsalm?: AgpeyaPsalm
	psalmsIntro?: string
	psalms: AgpeyaPsalm[]
	gospel: AgpeyaGospel
	litanies: AgpeyaLitany
	lordsPrayer?: AgpeyaPrayerSection
	thanksgivingAfter?: AgpeyaPrayerSection
	closing: AgpeyaPrayerSection
}

// Midnight hour data with watches
export interface AgpeyaMidnightData {
	id: 'midnight'
	name: string
	englishName: string
	traditionalTime: string
	introduction?: string
	opening: AgpeyaPrayerSection
	thanksgiving?: AgpeyaPrayerSection
	introductoryPsalm?: AgpeyaPsalm
	watches: AgpeyaWatchData[]
	closing: AgpeyaPrayerSection
}

// Type guard for midnight data
export function isMidnightData(
	data: AgpeyaHourData | AgpeyaMidnightData,
): data is AgpeyaMidnightData {
	return data.id === 'midnight' && 'watches' in data
}

// Section IDs for navigation
export type SectionId =
	| 'introduction'
	| 'thanksgiving'
	| 'introductory-psalm'
	| 'psalms'
	| 'gospel'
	| 'litanies'
	| 'lords-prayer'
	| 'closing'

// Theme styles for sub-components
export interface ThemeStyles {
	bg: string
	text: string
	textHeading: string
	muted: string
	accent: string
	border: string
	cardBg: string
}
