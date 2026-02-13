// Bible Translation Types
export type BibleTranslation = 'en' | 'ar'

// Calendar Types
export interface CopticDate {
	dateString: string
	day: number
	month: number
	year: number
	monthString: string
}

export interface CalendarData {
	dateString: string
	day: number
	month: number
	year: number
	monthString: string
	copticMonthName?: string
	copticDay?: number
	copticYear?: number
}

export interface SeasonData {
	season?: string
	description?: string
	isFasting?: boolean
}

export interface Celebration {
	id: number
	name: string
	type: string
	story?: string
}

export interface UpcomingCelebration {
	date: string
	copticDate: CopticDate
	celebrations: Celebration[]
}

export interface FastingInfo {
	isFasting: boolean
	fastType: string | null
	description: string | null
}

export interface CalendarDay {
	gregorianDate: string
	copticDate: CopticDate
	fasting: FastingInfo
}

export interface CopticMonthInfo {
	month: number
	monthString: string
	year: number
	startDay: number
}

export interface CalendarMonth {
	year: number
	month: number
	monthName: string
	days: CalendarDay[]
	copticMonths: CopticMonthInfo[]
}

// Subscriber Types
export interface Subscriber {
	id: string
	email: string
	verified: boolean
	name?: string | null
	patronSaint?: string | null
	dailyReadings?: boolean
	feastReminders?: boolean
	token?: string
}

export interface SubscriberPreferences {
	email: string
	name: string | null
	patronSaint: string | null
	dailyReadings: boolean
	feastReminders: boolean
}

// Readings Types
export interface Verse {
	text: string
	num: number
}

export interface Chapter {
	chapterNum: number
	verses: Verse[]
}

export interface Reading {
	bookName: string
	chapters: Chapter[]
}

export interface SynaxariumEntry {
	id?: string
	name: string
	url: string
	text?: string
}

export interface ReadingsData {
	VPsalm?: Reading[]
	VGospel?: Reading[]
	MPsalm?: Reading[]
	MGospel?: Reading[]
	Pauline?: Reading[]
	Catholic?: Reading[]
	Acts?: Reading[]
	LPsalm?: Reading[]
	LGospel?: Reading[]
	Synaxarium?: SynaxariumEntry[]
	fullDate?: CopticDate
}

// Synaxarium Search Types
export interface SynaxariumSearchResult {
	date: string
	copticDate: {
		dateString: string
		day: number
		monthString: string
	}
	entry: {
		url?: string
		name?: string
	}
}

// API Response Types
export interface ApiError {
	error: string
}

export interface ApiSuccess {
	message: string
}
