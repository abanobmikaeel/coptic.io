import incenseData from './incense.json'

export type IncenseSectionType = 'prayer' | 'psalm' | 'gospel' | 'litany' | 'creed' | 'daily-psalm'
export type IncenseSectionRole = 'all' | 'priest' | 'deacon' | 'congregation'
export type IncenseServiceType = 'evening'
export type ContentSpeaker = 'Priest' | 'Deacon' | 'People'

export interface ContentLine {
	speaker?: ContentSpeaker
	text: string
	isRubric?: boolean
}

// Content can be a plain string (all speakers) or a structured line with speaker
export type IncenseContent = string | ContentLine

export interface IncensePsalmRef {
	psalmNumber: number // LXX numbering
	startVerse?: number
	endVerse?: number
	rubric?: string
}

interface IncenseSectionBase {
	id: string
	role: IncenseSectionRole
	title: string
	rubric?: string
	// Not part of the day's service, but offered as an optional extra the user can add —
	// e.g. the Matins litanies (Sick/Travelers/Oblations) that some clergy include at
	// Vespers. Readers hide these by default and list them under "additional prayers".
	optional?: boolean
}

// A condition under which a block of content applies. Omitted fields are wildcards.
// Resolution is additive: every block whose condition matches the day's context is
// included, in order. Mutually-exclusive variants (e.g. the Adam vs Watos intro) are
// expressed as mutually-exclusive conditions, so exactly one matches.
export interface IncenseCondition {
	dayTune?: 'adam' | 'watos'
	// Agricultural season of the Litany for the Nature, resolved from the Coptic date:
	// waters (Paoni 12 – Paopi 9), plants (Paopi 10 – Tobi 10), fruits (Tobi 11 – Paoni 11)
	season?: 'waters' | 'plants' | 'fruits'
	// Weekday(s) of the liturgical day the service belongs to (0 = Sunday … 6 = Saturday).
	// e.g. the Lord's-Day blessing in the Short Blessing applies only on Sunday (0).
	weekday?: number | number[]
	commemoration?: string | string[] // e.g. 'apostles' | 'martyrs' | 'saints' (future)
	feast?: string | string[] // feast key (future)
}

export interface IncenseConditionalBlock {
	when?: IncenseCondition // no `when` ⇒ always included
	// Localized display title, used when the block is surfaced standalone — e.g. an
	// out-of-season nature litany offered as an optional extra ("Litany of the Waters").
	title?: string
	content: IncenseContent[]
}

export interface IncensePrayerSection extends IncenseSectionBase {
	type: 'prayer' | 'litany' | 'creed'
	// A section has either fixed `content` or conditional `blocks` (resolved by the API).
	content?: IncenseContent[]
	blocks?: IncenseConditionalBlock[]
}

export interface IncensePsalmSection extends IncenseSectionBase {
	type: 'psalm'
	psalmRef: IncensePsalmRef
}

export interface IncenseGospelSection extends IncenseSectionBase {
	type: 'gospel'
}

export interface IncenseDailyPsalmSection extends IncenseSectionBase {
	type: 'daily-psalm'
}

export type IncenseSectionData =
	| IncensePrayerSection
	| IncensePsalmSection
	| IncenseGospelSection
	| IncenseDailyPsalmSection

export interface IncenseServiceData {
	id: string
	name: string
	description?: string
	sections: IncenseSectionData[]
}

const data = incenseData as Record<IncenseServiceType, IncenseServiceData>

export function getIncenseService(serviceType: IncenseServiceType): IncenseServiceData {
	return data[serviceType]
}
