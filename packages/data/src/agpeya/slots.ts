/**
 * The published shape of `/api/agpeya`: one named slot per part of the rite
 * (`opening`, `psalms`, `gospelRef`, `litanies`, `conclusion`…), projected from
 * the ordered hour that `compose` builds from the data files.
 *
 * The data is stored as an ordered list of sections; this is the contract the
 * API serves from it. Changing a type or a field here changes the public API
 * response, so extend it additively. Sections that have no slot of their own
 * (an hour's or a watch's ending) are carried in order rather than folded into
 * slots, which is what keeps shared prayers from overwriting each other.
 */
import type { LiturgicalContent } from '../content/types'
import type {
	AgpeyaGospelSection,
	AgpeyaHourService,
	AgpeyaProseSection,
	AgpeyaPsalmSection,
	AgpeyaResolvedGroup,
	AgpeyaSection,
	AgpeyaSectionKind,
	AgpeyaVerse,
} from './types'
import { isResolvedGroup } from './types'

export interface AgpeyaPrayerSection {
	id?: string
	title?: string
	content: string[]
	inline?: boolean
	rubric?: string
}

export interface AgpeyaPsalmRef {
	psalmNumber: number
	title?: string
	startVerse?: number
	endVerse?: number
	rubric?: string
	note?: string
}

export interface AgpeyaPsalm {
	reference: string
	title: string
	rubric?: string
	verses: AgpeyaVerse[]
}

export interface AgpeyaGospelRef {
	book: string
	chapter: number
	startVerse: number
	endVerse: number
	rubric?: string
}

export interface AgpeyaLitany {
	title?: string
	content: string[]
}

export interface AgpeyaWatch {
	id: string
	name: string
	theme: string
	opening?: AgpeyaPrayerSection
	psalmsIntro?: string
	psalmRefs: AgpeyaPsalmRef[]
	psalms?: AgpeyaPsalm[]
	gospelRef?: AgpeyaGospelRef
	// "Glory be to God forever" and "We worship You, O Christ…", after the gospel.
	gospelConclusion?: AgpeyaPrayerSection
	litanies?: AgpeyaLitany
	closing?: AgpeyaPrayerSection
	// What the watch prays after its litanies (Kyrie, Holy Holy Holy, the Lord's
	// Prayer), in order. These are shared prayers, so they carry their own kinds and
	// must not be folded into the watch's slots.
	conclusion?: AgpeyaMidnightTailSection[]
}

interface AgpeyaSlots {
	opening: AgpeyaPrayerSection
	hourIntro?: AgpeyaPrayerSection
	comeLetUsWorship?: AgpeyaPrayerSection
	thanksgiving?: AgpeyaPrayerSection
	introductoryPsalm?: AgpeyaPsalmRef
	psalmRefs: AgpeyaPsalmRef[]
	psalms?: AgpeyaPsalm[]
	gospelRef: AgpeyaGospelRef
	/** Terce's second reading. Stored since the split; still served by nothing. */
	gospelRef2?: AgpeyaGospelRef
	// "Glory be to God forever" and "We worship You, O Christ…", after the gospel.
	gospelConclusion?: AgpeyaPrayerSection
	litanies: AgpeyaLitany
	lordsPrayer?: AgpeyaPrayerSection
	thanksgivingAfter?: AgpeyaPrayerSection
	closing?: AgpeyaPrayerSection
	conclusion?: (AgpeyaPrayerSection & { id: string })[]
}

export interface AgpeyaHourData extends AgpeyaSlots {
	id: string
	name: string
	englishName: string
	traditionalTime: string
	introduction?: string
	psalmsIntro?: string
}

export interface AgpeyaMidnightHour {
	id: 'midnight'
	name: string
	englishName: string
	traditionalTime: string
	introduction?: string
	opening: AgpeyaPrayerSection
	thanksgiving?: AgpeyaPrayerSection
	introductoryPsalm?: AgpeyaPsalmRef
	watches: AgpeyaWatch[]
	closing?: AgpeyaPrayerSection
	// The shared closing sequence prayed after the third watch (Kyrie, Holy Holy Holy,
	// the Lord's Prayer, the midnight Gospel, the Creed, the Absolution, and the
	// Conclusion of Every Hour), in order. Carries whole sections — prose and gospel
	// alike — so the reader renders the tail exactly as authored.
	conclusion?: AgpeyaMidnightTailSection[]
}

/** A section of midnight's ending: a prose prayer or the midnight Gospel. */
export type AgpeyaMidnightTailSection =
	| (Omit<AgpeyaProseSection, 'content'> & { content: string[] })
	| AgpeyaGospelSection

export const isMidnightHour = (
	hour: AgpeyaHourData | AgpeyaMidnightHour,
): hour is AgpeyaMidnightHour => hour.id === 'midnight' && 'watches' in hour

// ── section → slot ───────────────────────────────────────────────────────────

const PROSE_SLOT: Partial<Record<AgpeyaSectionKind, keyof AgpeyaSlots>> = {
	opening: 'opening',
	'hour-intro': 'hourIntro',
	'come-let-us-worship': 'comeLetUsWorship',
	thanksgiving: 'thanksgiving',
	'gospel-conclusion': 'gospelConclusion',
	litany: 'litanies',
	'lords-prayer': 'lordsPrayer',
	'thanksgiving-after': 'thanksgivingAfter',
	closing: 'closing',
}

// The slot fields serve every line as a plain string, as they always have: a
// response goes out as its Coptic line followed by its translation.
const plainLines = (content: LiturgicalContent[]): string[] =>
	content.flatMap((line) => {
		if (typeof line === 'string') return [line]
		return line.isResponse && line.coptic ? [line.coptic, line.text] : [line.text]
	})

const prayer = (section: AgpeyaProseSection): AgpeyaPrayerSection => ({
	...(section.title ? { title: section.title } : {}),
	content: plainLines(section.content),
	...(section.inline ? { inline: true } : {}),
	...(section.rubric ? { rubric: section.rubric } : {}),
})

const psalmRef = (section: AgpeyaPsalmSection): AgpeyaPsalmRef => ({
	psalmNumber: section.psalmNumber,
	...(section.title ? { title: section.title } : {}),
	...(section.startVerse != null ? { startVerse: section.startVerse } : {}),
	...(section.endVerse != null ? { endVerse: section.endVerse } : {}),
	...(section.rubric ? { rubric: section.rubric } : {}),
	...(section.note ? { note: section.note } : {}),
})

// The old files stored `reference` and `title` on every embedded psalm, both
// always equal to the reference's own title, so they are derived here rather
// than carried through the split.
const psalm = (section: AgpeyaPsalmSection): AgpeyaPsalm => ({
	reference: section.title ?? `Psalm ${section.psalmNumber}`,
	title: section.title ?? `Psalm ${section.psalmNumber}`,
	verses: section.verses ?? [],
})

const gospelRef = (section: AgpeyaGospelSection): AgpeyaGospelRef => ({
	book: section.book,
	chapter: section.chapter,
	startVerse: section.startVerse,
	endVerse: section.endVerse,
	...(section.rubric ? { rubric: section.rubric } : {}),
})

/** Fold a run of sections back into the named slots. */
function toSlots(sections: AgpeyaSection[]): Partial<AgpeyaSlots> {
	const slots: Partial<AgpeyaSlots> = {}
	const psalmRefs: AgpeyaPsalmRef[] = []
	const psalms: AgpeyaPsalm[] = []
	const gospels: AgpeyaGospelRef[] = []

	for (const section of sections) {
		if (section.kind === 'gospel') {
			gospels.push(gospelRef(section))
		} else if (section.kind === 'intro-psalm') {
			slots.introductoryPsalm = psalmRef(section)
		} else if (section.kind === 'psalm') {
			psalmRefs.push(psalmRef(section))
			if (section.verses) psalms.push(psalm(section))
		} else if ('content' in section) {
			const slot = PROSE_SLOT[section.kind]
			if (slot) Object.assign(slots, { [slot]: prayer(section) })
		}
	}

	return {
		...slots,
		psalmRefs,
		...(psalms.length ? { psalms } : {}),
		...(gospels[0] ? { gospelRef: gospels[0] } : {}),
		...(gospels[1] ? { gospelRef2: gospels[1] } : {}),
	}
}

// An hour's (or a watch's) own parts run through its litanies; what follows is its
// ending, prayed in order. The ending repeats shared prayers (Kyrie, Holy Holy Holy,
// the Lord's Prayer), so folding it into the named slots would misplace them.
function splitAtLitany(sections: AgpeyaSection[]): {
	body: AgpeyaSection[]
	ending: AgpeyaSection[]
} {
	const litanyAt = sections.findIndex((s) => s.kind === 'litany')
	const bodyEnd = litanyAt === -1 ? sections.length : litanyAt + 1
	return { body: sections.slice(0, bodyEnd), ending: sections.slice(bodyEnd) }
}

// A daytime hour's ending is prose only; anything else there has no slot to render in.
function toConclusion(ending: AgpeyaSection[]): Pick<AgpeyaSlots, 'conclusion'> {
	const conclusion = ending.map((s) => {
		if (!('content' in s)) throw new Error(`"${s.id}" cannot be prayed in an hour's ending`)
		return { id: s.id, ...prayer(s) }
	})
	return conclusion.length ? { conclusion } : {}
}

const identity = (hour: AgpeyaHourService) => ({
	id: hour.id,
	name: hour.name,
	englishName: hour.englishName,
	traditionalTime: hour.traditionalTime,
	...(hour.introduction ? { introduction: hour.introduction } : {}),
})

// The API carries prose and gospels in an ending; a psalm authored there has
// nowhere to go, so fail loudly rather than drop it from the prayed order.
function toTailSection(section: AgpeyaSection): AgpeyaMidnightTailSection {
	if ('content' in section) return { ...section, content: plainLines(section.content) }
	if (section.kind === 'gospel') return section
	throw new Error(`Psalm "${section.id}" cannot be prayed in a midnight ending`)
}

function toWatch(group: AgpeyaResolvedGroup): AgpeyaWatch {
	const { body, ending } = splitAtLitany(group.sections)
	const slots = toSlots(body)
	const conclusion = ending.map(toTailSection)
	return {
		id: group.group,
		name: group.name,
		theme: group.theme ?? '',
		...(group.psalmsIntro ? { psalmsIntro: group.psalmsIntro } : {}),
		...(slots.opening ? { opening: slots.opening } : {}),
		psalmRefs: slots.psalmRefs ?? [],
		...(slots.psalms ? { psalms: slots.psalms } : {}),
		...(slots.gospelRef ? { gospelRef: slots.gospelRef } : {}),
		...(slots.gospelConclusion ? { gospelConclusion: slots.gospelConclusion } : {}),
		...(slots.litanies ? { litanies: slots.litanies } : {}),
		...(slots.closing ? { closing: slots.closing } : {}),
		...(conclusion.length ? { conclusion } : {}),
	}
}

export function toSlottedHour(hour: AgpeyaHourService): AgpeyaHourData | AgpeyaMidnightHour {
	if (hour.id === 'midnight') {
		const firstGroup = hour.parts.findIndex(isResolvedGroup)
		const lastGroup = hour.parts.length - 1 - [...hour.parts].reverse().findIndex(isResolvedGroup)
		const sectionsIn = (parts: AgpeyaHourService['parts']) =>
			parts.filter((p): p is AgpeyaSection => !isResolvedGroup(p))
		// Only what precedes the first watch fills the hour's leading slots (opening,
		// thanksgiving, Psalm 50) — the ending repeats shared prayers that would
		// otherwise overwrite them.
		const frame = toSlots(sectionsIn(hour.parts.slice(0, firstGroup)))
		// The shared ending, authored after the last watch, in order.
		const conclusion = sectionsIn(hour.parts.slice(lastGroup + 1)).map(toTailSection)
		return {
			...identity(hour),
			id: 'midnight',
			opening: frame.opening as AgpeyaPrayerSection,
			...(frame.thanksgiving ? { thanksgiving: frame.thanksgiving } : {}),
			...(frame.introductoryPsalm ? { introductoryPsalm: frame.introductoryPsalm } : {}),
			watches: hour.parts.filter(isResolvedGroup).map(toWatch),
			...(conclusion.length ? { conclusion } : {}),
		}
	}

	const { body, ending } = splitAtLitany(hour.parts as AgpeyaSection[])
	return {
		...identity(hour),
		...(hour.psalmsIntro ? { psalmsIntro: hour.psalmsIntro } : {}),
		...toSlots(body),
		...toConclusion(ending),
	} as AgpeyaHourData
}
