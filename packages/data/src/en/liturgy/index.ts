import type { ContentLine } from '../../content/types'
import liturgyData from './liturgy.json'

export type LiturgySectionType =
	| 'prayer'
	| 'litany'
	| 'creed'
	| 'gospel'
	| 'daily-psalm'
	| 'epistle'
export type LiturgySectionRole = 'all' | 'priest' | 'deacon' | 'congregation'
export type LiturgyRite = 'basil'
export type LiturgyLanguage = 'en' | 'ar' | 'cop'

export type { ContentLine, ContentSpeaker } from '../../content/types'

// Content can be a plain string (all speakers) or a structured line with speaker
export type LiturgyContent = string | ContentLine

interface LiturgySectionBase {
	id: string
	role: LiturgySectionRole
	title: string
	// Set when the title falls back to another language — e.g. sections without a
	// verified Coptic title render the English one, labeled so it isn't a silent
	// translation.
	titleLanguage?: LiturgyLanguage
	rubric?: string
}

export interface LiturgyPrayerSection extends LiturgySectionBase {
	type: 'prayer' | 'litany' | 'creed'
	content: LiturgyContent[]
}

// A daily epistle (Pauline / Catholic / Praxis), resolved from the Katameros at runtime.
export interface LiturgyEpistleSection extends LiturgySectionBase {
	type: 'epistle'
	reading: 'pauline' | 'catholic' | 'praxis'
}

export interface LiturgyGospelSection extends LiturgySectionBase {
	type: 'gospel'
}

export interface LiturgyDailyPsalmSection extends LiturgySectionBase {
	type: 'daily-psalm'
}

export type LiturgySectionData =
	| LiturgyPrayerSection
	| LiturgyEpistleSection
	| LiturgyGospelSection
	| LiturgyDailyPsalmSection

export interface LiturgyServiceData {
	id: string
	name: string
	description?: string
	sections: LiturgySectionData[]
}

const data = liturgyData as Record<LiturgyRite, LiturgyServiceData>

export function getLiturgyService(rite: LiturgyRite = 'basil'): LiturgyServiceData {
	return data[rite]
}
