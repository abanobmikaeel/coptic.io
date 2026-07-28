import {
	getAgpeyaHourData as getArAgpeyaHourData,
	getAgpeyaHourIds as getArAgpeyaHourIds,
} from '@coptic/data/ar/agpeya'
import {
	type AgpeyaHourData,
	type AgpeyaHourId,
	type AgpeyaMidnightHour,
	type AgpeyaWatch,
	type MidnightWatchId,
	getAgpeyaHourData as getEnAgpeyaHourData,
	getAgpeyaHourIds as getEnAgpeyaHourIds,
	isMidnightHour,
} from '@coptic/data/en/agpeya'
import {
	getAgpeyaHourData as getEsAgpeyaHourData,
	getAgpeyaHourIds as getEsAgpeyaHourIds,
} from '@coptic/data/es/agpeya'
import type { BibleTranslation } from '../types'
import {
	type ResolvedGospel,
	type ResolvedPsalm,
	resolveAgpeyaGospel,
	resolveAgpeyaPsalms,
} from './psalm-resolver'

export type {
	AgpeyaHour,
	AgpeyaHourId,
	AgpeyaVerse,
	AgpeyaPsalm,
	AgpeyaGospel,
	AgpeyaPrayerSection,
	AgpeyaLitany,
	AgpeyaMidnightHour,
	AgpeyaWatch,
	MidnightWatchId,
} from '@coptic/data/en/agpeya'

// Resolved hour with populated psalms and gospel (returned to frontend)
export interface ResolvedAgpeyaHour {
	id: string
	name: string
	englishName: string
	traditionalTime: string
	introduction?: string
	opening: { title?: string; content: string[]; inline?: boolean }
	hourIntro?: { title?: string; content: string[]; inline?: boolean }
	comeLetUsWorship?: { title?: string; content: string[]; inline?: boolean }
	thanksgiving?: { title?: string; content: string[]; inline?: boolean }
	introductoryPsalm?: ResolvedPsalm // Psalm 50 (51)
	psalmsIntro?: string // "From the Psalms of our father David..."
	psalms: ResolvedPsalm[]
	gospel: ResolvedGospel
	litanies: { title?: string; content: string[] }
	lordsPrayer?: { title?: string; content: string[]; inline?: boolean }
	thanksgivingAfter?: { title?: string; content: string[]; inline?: boolean }
	closing: { title?: string; content: string[]; inline?: boolean }
}

// Resolved watch with populated psalms and gospel
export interface ResolvedAgpeyaWatch {
	id: string
	name: string
	theme: string
	opening?: { content: string[]; inline?: boolean }
	psalmsIntro?: string
	psalms: ResolvedPsalm[]
	gospel?: ResolvedGospel
	litanies?: { content: string[] }
	closing?: { content: string[]; inline?: boolean }
}

// Resolved midnight hour with watches
export interface ResolvedMidnightHour {
	id: 'midnight'
	name: string
	englishName: string
	traditionalTime: string
	introduction?: string
	opening: { content: string[]; inline?: boolean }
	thanksgiving?: { title?: string; content: string[]; inline?: boolean }
	introductoryPsalm?: ResolvedPsalm // Psalm 50 (51)
	watches: ResolvedAgpeyaWatch[]
	closing: { content: string[]; inline?: boolean }
}

// Which psalm text to serve. 'septuagint' (default) prefers the psalms embedded
// in the Agpeya data — the Septuagint-based liturgical psalter with the
// traditional Agpeya phrase divisions. Each language comes from a printed or
// published Agpeya edition rather than a generic Bible substitution; see the
// data-package import scripts and source notes for provenance.
// 'bible' always resolves the hour's psalm references against the Bible
// translation instead (Masoretic-style versification), for readers who want
// the wording of their own Bible.
export type PsalmSource = 'septuagint' | 'bible'

/**
 * Resolve a standard hour's psalm and gospel references
 */
function resolveHour(
	hourData: AgpeyaHourData,
	translation: BibleTranslation = 'en',
	psalmSource: PsalmSource = 'septuagint',
): ResolvedAgpeyaHour {
	// Resolve introductory psalm (Psalm 50/51)
	const introductoryPsalm =
		psalmSource === 'septuagint' && hourData.introductoryPsalmText
			? (hourData.introductoryPsalmText as unknown as ResolvedPsalm)
			: hourData.introductoryPsalm
				? resolveAgpeyaPsalms([hourData.introductoryPsalm], translation)[0]
				: undefined

	const psalms =
		psalmSource === 'septuagint' && hourData.psalms?.length
			? (hourData.psalms as unknown as ResolvedPsalm[])
			: resolveAgpeyaPsalms(hourData.psalmRefs || [], translation)

	const gospel =
		psalmSource === 'septuagint' && hourData.gospel
			? (hourData.gospel as unknown as ResolvedGospel)
			: resolveAgpeyaGospel(hourData.gospelRef, translation)

	return {
		id: hourData.id,
		name: hourData.name,
		englishName: hourData.englishName,
		traditionalTime: hourData.traditionalTime,
		introduction: hourData.introduction,
		opening: hourData.opening,
		hourIntro: hourData.hourIntro,
		comeLetUsWorship: hourData.comeLetUsWorship,
		thanksgiving: hourData.thanksgiving,
		introductoryPsalm,
		psalmsIntro: hourData.psalmsIntro,
		psalms,
		gospel: gospel || { reference: '', verses: [] },
		litanies: hourData.litanies,
		lordsPrayer: hourData.lordsPrayer,
		thanksgivingAfter: hourData.thanksgivingAfter,
		closing: hourData.closing,
	}
}

/**
 * Resolve a single watch's psalm and gospel references
 */
function resolveWatch(
	watch: AgpeyaWatch,
	translation: BibleTranslation = 'en',
	psalmSource: PsalmSource = 'septuagint',
): ResolvedAgpeyaWatch {
	const psalms =
		psalmSource === 'septuagint' && watch.psalms?.length
			? (watch.psalms as unknown as ResolvedPsalm[])
			: resolveAgpeyaPsalms(watch.psalmRefs || [], translation)
	const gospel =
		psalmSource === 'septuagint' && watch.gospel
			? (watch.gospel as unknown as ResolvedGospel)
			: watch.gospelRef
				? resolveAgpeyaGospel(watch.gospelRef, translation)
				: undefined

	return {
		id: watch.id,
		name: watch.name,
		theme: watch.theme,
		opening: watch.opening,
		psalmsIntro: watch.psalmsIntro,
		psalms,
		gospel: gospel || undefined,
		litanies: watch.litanies,
		closing: watch.closing,
	}
}

/**
 * Resolve midnight hour with all watches
 */
function resolveMidnightHour(
	midnightData: AgpeyaMidnightHour,
	translation: BibleTranslation = 'en',
	psalmSource: PsalmSource = 'septuagint',
): ResolvedMidnightHour {
	// Resolve introductory psalm (Psalm 50/51)
	const introductoryPsalm =
		psalmSource === 'septuagint' && midnightData.introductoryPsalmText
			? (midnightData.introductoryPsalmText as unknown as ResolvedPsalm)
			: midnightData.introductoryPsalm
				? resolveAgpeyaPsalms([midnightData.introductoryPsalm], translation)[0]
				: undefined

	const watches = midnightData.watches.map((watch) => resolveWatch(watch, translation, psalmSource))

	return {
		id: 'midnight',
		name: midnightData.name,
		englishName: midnightData.englishName,
		traditionalTime: midnightData.traditionalTime,
		introduction: midnightData.introduction,
		opening: midnightData.opening,
		thanksgiving: midnightData.thanksgiving,
		introductoryPsalm,
		watches,
		closing: midnightData.closing,
	}
}

/**
 * Get a specific Agpeya hour with resolved psalm and gospel text
 */
// Coptic has no prayer-book prose or embedded psalter, so it deliberately uses
// Bible resolution. English, Arabic, and Spanish each own a liturgical edition.
const effectivePsalmSource = (
	translation: BibleTranslation,
	psalmSource: PsalmSource,
): PsalmSource => (translation === 'cop' ? 'bible' : psalmSource)

const getDataLoader = (translation: BibleTranslation) =>
	translation === 'ar'
		? getArAgpeyaHourData
		: translation === 'es'
			? getEsAgpeyaHourData
			: getEnAgpeyaHourData

const getIdLoader = (translation: BibleTranslation) =>
	translation === 'ar'
		? getArAgpeyaHourIds
		: translation === 'es'
			? getEsAgpeyaHourIds
			: getEnAgpeyaHourIds

export function getAgpeyaHour(
	hourId: AgpeyaHourId,
	translation: BibleTranslation = 'en',
	psalmSource: PsalmSource = 'septuagint',
): ResolvedAgpeyaHour | ResolvedMidnightHour | null {
	const getData = getDataLoader(translation)
	const hourData = getData(hourId)
	if (!hourData) return null

	const source = effectivePsalmSource(translation, psalmSource)
	if (isMidnightHour(hourData)) {
		return resolveMidnightHour(hourData, translation, source)
	}

	return resolveHour(hourData as AgpeyaHourData, translation, source)
}

/**
 * Get a specific watch from midnight prayer
 */
export function getMidnightWatch(
	watchId: MidnightWatchId,
	translation: BibleTranslation = 'en',
	psalmSource: PsalmSource = 'septuagint',
): ResolvedAgpeyaWatch | null {
	const getData = getDataLoader(translation)
	const midnightData = getData('midnight') as AgpeyaMidnightHour
	if (!midnightData) return null

	const watchIndex = parseInt(watchId, 10) - 1
	const watch = midnightData.watches[watchIndex]
	if (!watch) return null

	return resolveWatch(watch, translation, effectivePsalmSource(translation, psalmSource))
}

/**
 * Get all Agpeya hours with resolved content
 */
export function getAllHours(
	translation: BibleTranslation = 'en',
	psalmSource: PsalmSource = 'septuagint',
): (ResolvedAgpeyaHour | ResolvedMidnightHour)[] {
	const getIds = getIdLoader(translation)
	const hourIds = getIds()
	const resolved: (ResolvedAgpeyaHour | ResolvedMidnightHour)[] = []

	for (const hourId of hourIds) {
		const hour = getAgpeyaHour(hourId, translation, psalmSource)
		if (hour) {
			resolved.push(hour)
		}
	}

	return resolved
}

export function getHourIds(): AgpeyaHourId[] {
	return getEnAgpeyaHourIds()
}

// English, Arabic, and Spanish have complete prayer-book prose. Coptic remains
// a scripture-only column until a sourced Coptic prose edition is imported.
const AGPEYA_PROSE_LANGS: BibleTranslation[] = ['en', 'ar', 'es']
const AGPEYA_SCRIPTURE_ONLY_LANGS: BibleTranslation[] = ['cop']

export function getAvailableTranslations(): BibleTranslation[] {
	return [...AGPEYA_PROSE_LANGS, ...AGPEYA_SCRIPTURE_ONLY_LANGS]
}

export function getCurrentHour(): AgpeyaHourId {
	const currentHour = new Date().getHours()

	// Map hours to prayer times
	if (currentHour >= 0 && currentHour < 6) return 'midnight'
	if (currentHour >= 6 && currentHour < 9) return 'prime'
	if (currentHour >= 9 && currentHour < 12) return 'terce'
	if (currentHour >= 12 && currentHour < 15) return 'sext'
	if (currentHour >= 15 && currentHour < 18) return 'none'
	if (currentHour >= 18 && currentHour < 21) return 'vespers'
	return 'compline'
}
