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
	closing: AgpeyaPrayerSection
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
	closing: AgpeyaPrayerSection
}

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

const identity = (hour: AgpeyaHourService) => ({
	id: hour.id,
	name: hour.name,
	englishName: hour.englishName,
	traditionalTime: hour.traditionalTime,
	...(hour.introduction ? { introduction: hour.introduction } : {}),
})

export function toLegacyHour(hour: AgpeyaHourService): AgpeyaHourData | AgpeyaMidnightHour {
	if (hour.id === 'midnight') {
		const frame = toSlots(hour.parts.filter((p): p is AgpeyaSection => !isResolvedGroup(p)))
		return {
			...identity(hour),
			id: 'midnight',
			opening: frame.opening as AgpeyaPrayerSection,
			...(frame.thanksgiving ? { thanksgiving: frame.thanksgiving } : {}),
			...(frame.introductoryPsalm ? { introductoryPsalm: frame.introductoryPsalm } : {}),
			watches: hour.parts.filter(isResolvedGroup).map((group) => {
				const slots = toSlots(group.sections)
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
				} satisfies AgpeyaWatch
			}),
			closing: frame.closing as AgpeyaPrayerSection,
		}
	}

	return {
		...identity(hour),
		...(hour.psalmsIntro ? { psalmsIntro: hour.psalmsIntro } : {}),
		...toSlots(hour.parts as AgpeyaSection[]),
	} as AgpeyaHourData
}
