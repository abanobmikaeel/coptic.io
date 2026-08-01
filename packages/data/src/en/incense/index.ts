import type {
	LiturgicalCondition,
	LiturgicalConditionalBlock,
	LiturgicalContent,
	LiturgicalSectionRole,
} from '../../content/types'
import incenseData from './incense.json'

export type IncenseSectionType = 'prayer' | 'psalm' | 'gospel' | 'litany' | 'creed' | 'daily-psalm'
export type IncenseServiceType = 'evening'

export type { ContentLine, ContentSpeaker } from '../../content/types'

// The Incense-prefixed names are kept as aliases of the shared primitives: nothing
// about a role, a line, or a condition is incense-specific, and the Liturgy and
// Tasbeha resolve against the same shapes.
export type IncenseSectionRole = LiturgicalSectionRole
export type IncenseContent = LiturgicalContent

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
export type IncenseCondition = LiturgicalCondition

export type IncenseConditionalBlock = LiturgicalConditionalBlock

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
