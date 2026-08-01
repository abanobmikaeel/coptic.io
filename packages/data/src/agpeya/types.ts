export type AgpeyaLanguage = 'en' | 'ar'

export type AgpeyaHourId = 'prime' | 'terce' | 'sext' | 'none' | 'vespers' | 'compline' | 'midnight'

export type MidnightWatchId = '1' | '2' | '3'

export interface AgpeyaVerse {
	num: number
	text: string
}

/**
 * What part of the rite a section is. The Agpeya's fixed hours mean most kinds
 * appear once per hour, which is why the older schema could get away with a
 * named field each; `psalm` and `gospel` are the ones that repeat.
 */
export type AgpeyaSectionKind =
	| 'opening'
	| 'hour-intro'
	| 'come-let-us-worship'
	| 'thanksgiving'
	| 'intro-psalm'
	| 'psalm'
	| 'gospel'
	| 'litany'
	| 'lords-prayer'
	| 'thanksgiving-after'
	| 'closing'

interface AgpeyaSectionBase {
	id: string
	kind: AgpeyaSectionKind
	title?: string
	rubric?: string
}

/** Prose prayed as written — openings, litanies, absolutions, closings. */
export interface AgpeyaProseSection extends AgpeyaSectionBase {
	kind: Exclude<AgpeyaSectionKind, 'psalm' | 'intro-psalm' | 'gospel'>
	content: string[]
	/** Render continuously with its neighbours instead of as its own slide. */
	inline?: boolean
}

/**
 * A psalm the hour prays. `psalmNumber` is LXX and always present so the API can
 * resolve the reader's own Bible translation instead; `verses` carries the
 * embedded liturgical psalter (Septuagint text with the traditional Agpeya
 * phrase divisions), which is served by default wherever it exists.
 *
 * The older schema kept these apart as positional `psalmRefs[i]` / `psalms[i]`
 * arrays, so a psalm's reference and its text could silently drift out of step.
 */
export interface AgpeyaPsalmSection extends AgpeyaSectionBase {
	kind: 'psalm' | 'intro-psalm'
	psalmNumber: number
	startVerse?: number
	endVerse?: number
	note?: string
	verses?: AgpeyaVerse[]
}

export interface AgpeyaGospelSection extends AgpeyaSectionBase {
	kind: 'gospel'
	book: string
	chapter: number
	startVerse: number
	endVerse: number
}

export type AgpeyaSection = AgpeyaProseSection | AgpeyaPsalmSection | AgpeyaGospelSection

/**
 * A run of sections prayed as a named unit — only the midnight hour's three
 * watches. Keeping them nested in `order` rather than flattening behind heading
 * sections is what lets `/api/agpeya/midnight/watch/2` stay addressable.
 */
export interface AgpeyaOrderGroup {
	group: string
	name: string
	theme?: string
	psalmsIntro?: string
	order: string[]
}

/** One step of an hour: a section id, or a named group of them. */
export type AgpeyaOrderEntry = string | AgpeyaOrderGroup

export const isOrderGroup = (entry: AgpeyaOrderEntry): entry is AgpeyaOrderGroup =>
	typeof entry !== 'string'

/**
 * The stored shape of `{hour}.json`. An hour holds only the sections proper to
 * it and names the rest by id, so a prayer prayed at every hour — the opening
 * invocation, the thanksgiving — exists once in `common.json` and cannot drift
 * between hours or between languages.
 */
export interface AgpeyaHourFile {
	id: AgpeyaHourId
	language: AgpeyaLanguage
	name: string
	englishName: string
	traditionalTime: string
	/** Catechetical note on why the hour is prayed; rides as the opening's rubric. */
	introduction?: string
	/** "From the Psalms of our father David…"; rides as the first psalm's rubric. */
	psalmsIntro?: string
	/** The hour in sequence, resolved against `sections` then `common.json`. */
	order: AgpeyaOrderEntry[]
	/** Sections prayed by this hour alone. */
	sections: AgpeyaSection[]
}

/** The stored shape of `common.json`: sections prayed at more than one hour. */
export interface AgpeyaCommonFile {
	language: AgpeyaLanguage
	sections: Record<string, AgpeyaSection>
}

/** A group with its sections resolved. */
export interface AgpeyaResolvedGroup {
	group: string
	name: string
	theme?: string
	psalmsIntro?: string
	sections: AgpeyaSection[]
}

export type AgpeyaPart = AgpeyaSection | AgpeyaResolvedGroup

export const isResolvedGroup = (part: AgpeyaPart): part is AgpeyaResolvedGroup => 'group' in part

/**
 * An hour with every section resolved in sequence — what consumers read.
 * Composed at load time from an hour file plus `common.json`; see the
 * per-language `agpeya/index.ts`.
 */
export interface AgpeyaHourService {
	id: AgpeyaHourId
	language: AgpeyaLanguage
	name: string
	englishName: string
	traditionalTime: string
	introduction?: string
	psalmsIntro?: string
	parts: AgpeyaPart[]
}
