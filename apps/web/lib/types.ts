import type { ApiResponse } from '@coptic/client'

// Bible Translation Types
export type BibleTranslation = 'en' | 'ar'

// API response types, from the API's OpenAPI spec. Regenerate them with
// `pnpm gen:api-types` rather than editing them here.
type Celebrations = NonNullable<ApiResponse<'/api/celebrations/{date}'>>

export type CopticDate = ApiResponse<'/api/calendar/{date}'>
export type CalendarData = CopticDate
export type SeasonData = ApiResponse<'/api/season/{date}'>
export type Celebration = Celebrations[number]
export type UpcomingCelebration = ApiResponse<'/api/celebrations/upcoming/list'>[number]
export type FastingInfo = ApiResponse<'/api/fasting/{date}'>
export type CalendarMonth = ApiResponse<'/api/calendar/month/{year}/{month}'>
export type CalendarDay = CalendarMonth['days'][number]
export type CopticMonthInfo = CalendarMonth['copticMonths'][number]
export type SynaxariumEntry = ApiResponse<'/api/synaxarium/{date}'>[number]
export type SynaxariumSearchResult = ApiResponse<'/api/synaxarium/search/query'>[number]
export type ReadingsData = ApiResponse<'/api/readings/{date}'>
export type Reading = NonNullable<ReadingsData['LGospel']>[number]
export type Chapter = Reading['chapters'][number]
export type Verse = Chapter['verses'][number]

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

// Incense / Vespers Types
export type IncenseSectionRole = 'all' | 'priest' | 'deacon' | 'congregation'
export type IncenseSectionType =
	| 'prayer'
	| 'psalm'
	| 'gospel'
	| 'litany'
	| 'creed'
	| 'daily-psalm'
	// The Liturgy's Pauline, Catholic and Praxis readings. These carry `reference`
	// and `verses` like the other scripture sections, so they need no separate
	// rendering — align.ts keys off content-vs-verses, not off the type.
	| 'epistle'

export interface IncenseContentLine {
	speaker?: 'Priest' | 'Deacon' | 'People'
	text: string
	isRubric?: boolean
	// A congregational response (Doxa, Ke-nin): `text` translated, `coptic` in Coptic script.
	isResponse?: boolean
	coptic?: string
}

export interface IncenseSection {
	id: string
	type: IncenseSectionType
	role: IncenseSectionRole
	title: string
	titleLanguage?: 'en' | 'ar' | 'cop'
	/** The source has no text for this section in this language. */
	contentUnavailable?: boolean
	rubric?: string
	// Offered as an extra (Matins litanies, out-of-season nature litanies) — hidden from
	// the service flow by default, listed under "Additional prayers" in the section list.
	optional?: boolean
	content?: (string | IncenseContentLine)[]
	reference?: string
	verses?: Verse[]
	kind?:
		| 'opening'
		| 'canticle'
		| 'lobsh'
		| 'psali'
		| 'commemoration'
		| 'doxology'
		| 'theotokia'
		| 'gospel'
		| 'difnar'
		| 'exposition'
		| 'litany'
		| 'conclusion'
}

export interface IncenseService {
	type: string
	name: string
	date?: string
	copticDate?: CopticDate
	id?: string
	description?: string
	status?: 'partial' | 'complete'
	rite?: {
		cycle: string
		dayTune: 'adam' | 'watos'
		weekdays: number[]
	}
	sections: IncenseSection[]
}

// API Response Types
export interface ApiError {
	error: string
}

export interface ApiSuccess {
	message: string
}
