import type { ServiceLanguage } from '../content/types'

export type TasbehaLanguage = ServiceLanguage
export type TasbehaCycle = 'annual' | 'kiahk' | 'great-lent' | 'holy-fifty' | 'feast'
export type TasbehaDayTune = 'adam' | 'watos'
/** `partial` when a service does not yet hold the whole rite. */
export type TasbehaStatus = 'complete' | 'partial'

export type TasbehaSectionKind =
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

export interface TasbehaSource {
	name: 'Tasbeha.org'
	url: string
	pageId: number
	accessedAt: string
	corroboratingUrls?: string[]
}

export interface TasbehaSection {
	id: string
	title: string
	/** Explicit when a source has no localized structural title. */
	titleLanguage?: TasbehaLanguage
	kind: TasbehaSectionKind
	content: string[]
	source: TasbehaSource
	availability?: 'resurrection-through-hathor'
	/** The source has no text for this section in this language; `content` is empty. */
	contentUnavailable?: true
}

/**
 * One service per day of the week. Saturday is a Vespers Praise rather than a
 * Midnight Praise: it is prayed on Saturday evening and omits the four canticles
 * and the morning doxology.
 */
export type TasbehaServiceId =
	| 'sunday-midnight-praises'
	| 'monday-midnight-praises'
	| 'tuesday-midnight-praises'
	| 'wednesday-midnight-praises'
	| 'thursday-midnight-praises'
	| 'friday-midnight-praises'
	| 'saturday-vespers-praises'

export interface TasbehaRite {
	cycle: TasbehaCycle
	dayTune: TasbehaDayTune
	weekdays: number[]
}

/**
 * A service with every section resolved — what consumers read. Composed at load
 * time from a day file plus `common.json`; see the per-language `tasbeha/index.ts`.
 */
export interface TasbehaServiceData {
	id: TasbehaServiceId
	language: TasbehaLanguage
	name: string
	description: string
	rite: TasbehaRite
	status: TasbehaStatus
	sections: TasbehaSection[]
}

/**
 * The generated shape of `{day}.json`. Most of the annual Psalmody is shared
 * between days, so a day file stores only the sections proper to it and refers to
 * the rest by id. `order` is the full rite in sequence, which also makes the
 * service readable without expanding it.
 */
export interface TasbehaServiceFile {
	id: TasbehaServiceId
	language: TasbehaLanguage
	name: string
	description: string
	rite: TasbehaRite
	status: TasbehaStatus
	/** Section ids in prayed order, resolved against `sections` then `common.json`. */
	order: string[]
	/** Sections prayed by this service alone. */
	sections: TasbehaSection[]
}

/** The generated shape of `common.json`: sections prayed by more than one service. */
export interface TasbehaCommonFile {
	language: TasbehaLanguage
	sections: Record<string, TasbehaSection>
}

/** A Kiahk hymn added to an annual service, beside a section of that service. */
export interface TasbehaKiahkAddition {
	section: string
	/** `Date.getDay()` weekdays it is prayed on. */
	weekdays: number[]
	before?: string
	after?: string
}

/** The generated shape of `kiahk.json`: what Kiahk adds to the annual Psalmody. */
export interface TasbehaKiahkFile {
	language: TasbehaLanguage
	status: 'partial'
	nameSuffix: string
	description: string
	/** The Saturday Vespers Praises; `exposition` stands for the week's Exposition. */
	saturdayOrder: string[]
	/** The Exposition of each of Kiahk's four weeks, in order. */
	expositions: string[]
	additions: TasbehaKiahkAddition[]
	sections: Record<string, TasbehaSection>
}
