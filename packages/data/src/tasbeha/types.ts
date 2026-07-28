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

export interface TasbehaServiceData {
	id: 'sunday-midnight-praises'
	language: TasbehaLanguage
	name: string
	description: string
	rite: {
		cycle: TasbehaCycle
		dayTune: TasbehaDayTune
		weekdays: number[]
	}
	status: 'complete'
	sections: TasbehaSection[]
}
