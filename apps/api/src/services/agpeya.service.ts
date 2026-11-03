import {
	getAgpeyaHourData as getArAgpeyaHourData,
	getAgpeyaHourIds as getArAgpeyaHourIds,
	getAgpeyaHour as getArAgpeyaHourParts,
} from '@coptic/data/ar/agpeya'
import {
	type AgpeyaHourData,
	type AgpeyaHourId,
	type AgpeyaMidnightHour as AgpeyaMidnightHourData,
	type AgpeyaMidnightTailSection,
	type AgpeyaWatch as AgpeyaWatchData,
	type MidnightWatchId,
	getAgpeyaHourData as getEnAgpeyaHourData,
	getAgpeyaHourIds as getEnAgpeyaHourIds,
	getAgpeyaHour as getEnAgpeyaHourParts,
	isMidnightHour,
} from '@coptic/data/en/agpeya'
import type { AgpeyaHour, AgpeyaMidnightHour, AgpeyaMidnightTail, AgpeyaWatch } from '../schemas'
import type { BibleTranslation } from '../types'
import { type PsalmSource, toServedSections } from './agpeya-sections'
import { type ResolvedPsalm, resolveAgpeyaGospel, resolveAgpeyaPsalms } from './psalm-resolver'

export type { MidnightWatchId } from '@coptic/data/en/agpeya'
export type { PsalmSource }

/**
 * Resolve a standard hour's psalm and gospel references
 */
function resolveHour(
	hourData: AgpeyaHourData,
	translation: BibleTranslation = 'en',
	psalmSource: PsalmSource = 'septuagint',
): Omit<AgpeyaHour, 'sections'> {
	// Resolve introductory psalm (Psalm 50/51)
	const introductoryPsalm = hourData.introductoryPsalm
		? resolveAgpeyaPsalms([hourData.introductoryPsalm], translation)[0]
		: undefined

	const psalms =
		psalmSource === 'septuagint' && hourData.psalms?.length
			? (hourData.psalms as unknown as ResolvedPsalm[])
			: resolveAgpeyaPsalms(hourData.psalmRefs || [], translation)

	const gospel = resolveAgpeyaGospel(hourData.gospelRef, translation)

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
		gospelConclusion: hourData.gospelConclusion,
		litanies: hourData.litanies,
		lordsPrayer: hourData.lordsPrayer,
		thanksgivingAfter: hourData.thanksgivingAfter,
		closing: hourData.closing,
		conclusion: hourData.conclusion,
	}
}

/**
 * Resolve a single watch's psalm and gospel references
 */
function resolveWatch(
	watch: AgpeyaWatchData,
	translation: BibleTranslation = 'en',
	psalmSource: PsalmSource = 'septuagint',
): AgpeyaWatch {
	const psalms =
		psalmSource === 'septuagint' && watch.psalms?.length
			? (watch.psalms as unknown as ResolvedPsalm[])
			: resolveAgpeyaPsalms(watch.psalmRefs || [], translation)
	const gospel = watch.gospelRef ? resolveAgpeyaGospel(watch.gospelRef, translation) : undefined

	return {
		id: watch.id,
		name: watch.name,
		theme: watch.theme,
		opening: watch.opening,
		psalmsIntro: watch.psalmsIntro,
		psalms,
		gospel: gospel || undefined,
		gospelConclusion: watch.gospelConclusion,
		litanies: watch.litanies,
		closing: watch.closing,
		conclusion: resolveTail(watch.conclusion, translation),
	}
}

// A midnight ending (after a watch, or after the last one) is authored in order:
// gospels resolve their text in the requested translation, prose passes through.
// A gospel whose text this translation lacks is left out of that language.
function resolveTail(
	sections: AgpeyaMidnightTailSection[] | undefined,
	translation: BibleTranslation,
): AgpeyaMidnightTail[] | undefined {
	return sections?.flatMap((section): AgpeyaMidnightTail[] => {
		if (section.kind !== 'gospel') return [section]
		const gospel = resolveAgpeyaGospel(section, translation)
		return gospel ? [{ id: section.id, kind: 'gospel', title: section.title, ...gospel }] : []
	})
}

/**
 * Resolve midnight hour with all watches
 */
function resolveMidnightHour(
	midnightData: AgpeyaMidnightHourData,
	translation: BibleTranslation = 'en',
	psalmSource: PsalmSource = 'septuagint',
): Omit<AgpeyaMidnightHour, 'sections'> {
	// Resolve introductory psalm (Psalm 50/51)
	const introductoryPsalm = midnightData.introductoryPsalm
		? resolveAgpeyaPsalms([midnightData.introductoryPsalm], translation)[0]
		: undefined

	const watches = midnightData.watches.map((watch) => resolveWatch(watch, translation, psalmSource))
	const conclusion = resolveTail(midnightData.conclusion, translation)

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
		...(midnightData.closing ? { closing: midnightData.closing } : {}),
		conclusion,
	}
}

/**
 * Get a specific Agpeya hour with resolved psalm and gospel text
 */
// Embedded psalms are text in the hour data's own language, and Coptic/Spanish
// requests reuse the English hour data — for those, always resolve psalms from
// the requested Bible translation instead of leaking English text.
const effectivePsalmSource = (
	translation: BibleTranslation,
	psalmSource: PsalmSource,
): PsalmSource => (translation === 'en' || translation === 'ar' ? psalmSource : 'bible')

export function getAgpeyaHour(
	hourId: AgpeyaHourId,
	translation: BibleTranslation = 'en',
	psalmSource: PsalmSource = 'septuagint',
	{ sections: withSections = false }: { sections?: boolean } = {},
): AgpeyaHour | AgpeyaMidnightHour | null {
	const getData = translation === 'ar' ? getArAgpeyaHourData : getEnAgpeyaHourData
	const hourData = getData(hourId)
	if (!hourData) return null

	const source = effectivePsalmSource(translation, psalmSource)
	const getParts = translation === 'ar' ? getArAgpeyaHourParts : getEnAgpeyaHourParts
	const parts = withSections ? getParts(hourId) : null
	const sections = parts ? { sections: toServedSections(parts, translation, source) } : {}
	if (isMidnightHour(hourData)) {
		return { ...resolveMidnightHour(hourData, translation, source), ...sections }
	}

	return { ...resolveHour(hourData as AgpeyaHourData, translation, source), ...sections }
}

/**
 * Get a specific watch from midnight prayer
 */
export function getMidnightWatch(
	watchId: MidnightWatchId,
	translation: BibleTranslation = 'en',
	psalmSource: PsalmSource = 'septuagint',
): AgpeyaWatch | null {
	const getData = translation === 'ar' ? getArAgpeyaHourData : getEnAgpeyaHourData
	const midnightData = getData('midnight') as AgpeyaMidnightHourData
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
): (AgpeyaHour | AgpeyaMidnightHour)[] {
	const getIds = translation === 'ar' ? getArAgpeyaHourIds : getEnAgpeyaHourIds
	const hourIds = getIds()
	const resolved: (AgpeyaHour | AgpeyaMidnightHour)[] = []

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

// Content languages the Agpeya can render. English and Arabic have full prayer
// prose; Coptic is offered as scripture-only columns (psalms/gospel). Spanish has
// scripture but no prose, so it is intentionally excluded rather than silently
// falling back to English prayers.
const AGPEYA_PROSE_LANGS: BibleTranslation[] = ['en', 'ar']
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
