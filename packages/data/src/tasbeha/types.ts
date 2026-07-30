export type TasbehaLanguage = 'en' | 'ar' | 'cop'
export type TasbehaCycle = 'annual' | 'kiahk' | 'great-lent' | 'holy-fifty' | 'feast'
export type TasbehaDayTune = 'adam' | 'watos'

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
	status: 'complete'
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
	status: 'complete'
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
