/**
 * The hour shape the API and reader still consume: one named field per part of
 * the rite. It is now a projection of `order`, not the storage format.
 *
 * Everything here exists to keep `/api/agpeya` byte-compatible while the data
 * moves underneath it. Once the API and `agpeyaToService` walk `parts` directly,
 * this file and the slot types go away.
 */
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
export type AgpeyaMidnightTailSection = AgpeyaProseSection | AgpeyaGospelSection

export const isMidnightHour = (
	hour: AgpeyaHourData | AgpeyaMidnightHour,
): hour is AgpeyaMidnightHour => hour.id === 'midnight' && 'watches' in hour

// ── section → slot ───────────────────────────────────────────────────────────

const PROSE_SLOT: Partial<Record<AgpeyaSectionKind, keyof AgpeyaSlots>> = {
	opening: 'opening',
	'hour-intro': 'hourIntro',
	'come-let-us-worship': 'comeLetUsWorship',
	thanksgiving: 'thanksgiving',
	litany: 'litanies',
	'lords-prayer': 'lordsPrayer',
	'thanksgiving-after': 'thanksgivingAfter',
	closing: 'closing',
}

const prayer = (section: AgpeyaProseSection): AgpeyaPrayerSection => ({
	...(section.title ? { title: section.title } : {}),
	content: section.content,
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

function toConclusion(sections: AgpeyaSection[]): Pick<AgpeyaSlots, 'conclusion'> {
	const conclusion = sections
		.filter((s): s is AgpeyaProseSection => s.kind === 'conclusion')
		.map((s) => ({ id: s.id, ...prayer(s) }))
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
	if (section.kind === 'gospel' || 'content' in section) return section
	throw new Error(`Psalm "${section.id}" cannot be prayed in a midnight ending`)
}

// A watch's own parts run through its litanies; what follows is its ending, prayed
// in order. Folding the ending into slots would misplace shared prayers — the Lord's
// Prayer is authored as an `opening`, so it would replace the watch's opening.
function toWatch(group: AgpeyaResolvedGroup): AgpeyaWatch {
	const litanyAt = group.sections.findIndex((s) => s.kind === 'litany')
	const bodyEnd = litanyAt === -1 ? group.sections.length : litanyAt + 1
	const slots = toSlots(group.sections.slice(0, bodyEnd))
	const conclusion = group.sections.slice(bodyEnd).map(toTailSection)
	return {
		id: group.group,
		name: group.name,
		theme: group.theme ?? '',
		...(group.psalmsIntro ? { psalmsIntro: group.psalmsIntro } : {}),
		...(slots.opening ? { opening: slots.opening } : {}),
		psalmRefs: slots.psalmRefs ?? [],
		...(slots.psalms ? { psalms: slots.psalms } : {}),
		...(slots.gospelRef ? { gospelRef: slots.gospelRef } : {}),
		...(slots.litanies ? { litanies: slots.litanies } : {}),
		...(slots.closing ? { closing: slots.closing } : {}),
		...(conclusion.length ? { conclusion } : {}),
	}
}

export function toLegacyHour(hour: AgpeyaHourService): AgpeyaHourData | AgpeyaMidnightHour {
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

	return {
		...identity(hour),
		...(hour.psalmsIntro ? { psalmsIntro: hour.psalmsIntro } : {}),
		...toSlots(hour.parts as AgpeyaSection[]),
		...toConclusion(hour.parts as AgpeyaSection[]),
	} as AgpeyaHourData
}
