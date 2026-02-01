import {
	type AgpeyaHourId,
	type AgpeyaHourData,
	type AgpeyaMidnightHour,
	type AgpeyaWatch,
	type MidnightWatchId,
	getAgpeyaHourData,
	getAgpeyaHourIds,
	isMidnightHour,
} from '@coptic/data/en'
import {
	resolveAgpeyaPsalms,
	resolveAgpeyaGospel,
	type ResolvedPsalm,
	type ResolvedGospel,
} from './psalm-resolver'
import type { BibleTranslation } from '../types'

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
} from '@coptic/data/en'

// Resolved hour with populated psalms and gospel (returned to frontend)
export interface ResolvedAgpeyaHour {
	id: string
	name: string
	englishName: string
	traditionalTime: string
	introduction?: string
	opening: { title?: string; content: string[]; inline?: boolean }
	thanksgiving?: { title?: string; content: string[]; inline?: boolean }
	introductoryPsalm?: ResolvedPsalm // Psalm 50 (51)
	psalmsIntro?: string // "From the Psalms of our father David..."
	psalms: ResolvedPsalm[]
	alleluia?: { content: string[]; inline?: boolean }
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

/**
 * Resolve a standard hour's psalm and gospel references
 */
function resolveHour(
	hourData: AgpeyaHourData,
	translation: BibleTranslation = 'en'
): ResolvedAgpeyaHour {
	// Resolve introductory psalm (Psalm 50/51)
	const introductoryPsalm = hourData.introductoryPsalm
		? resolveAgpeyaPsalms([hourData.introductoryPsalm], translation)[0]
		: undefined

	const psalms = resolveAgpeyaPsalms(hourData.psalmRefs || [], translation)
	const gospel = resolveAgpeyaGospel(hourData.gospelRef, translation)

	return {
		id: hourData.id,
		name: hourData.name,
		englishName: hourData.englishName,
		traditionalTime: hourData.traditionalTime,
		introduction: hourData.introduction,
		opening: hourData.opening,
		thanksgiving: hourData.thanksgiving,
		introductoryPsalm,
		psalmsIntro: hourData.psalmsIntro,
		psalms,
		alleluia: hourData.alleluia,
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
	translation: BibleTranslation = 'en'
): ResolvedAgpeyaWatch {
	const psalms = resolveAgpeyaPsalms(watch.psalmRefs || [], translation)
	const gospel = watch.gospelRef
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
	translation: BibleTranslation = 'en'
): ResolvedMidnightHour {
	// Resolve introductory psalm (Psalm 50/51)
	const introductoryPsalm = midnightData.introductoryPsalm
		? resolveAgpeyaPsalms([midnightData.introductoryPsalm], translation)[0]
		: undefined

	const watches = midnightData.watches.map((watch) =>
		resolveWatch(watch, translation)
	)

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
export function getAgpeyaHour(
	hourId: AgpeyaHourId,
	translation: BibleTranslation = 'en'
): ResolvedAgpeyaHour | ResolvedMidnightHour | null {
	const hourData = getAgpeyaHourData(hourId)
	if (!hourData) return null

	if (isMidnightHour(hourData)) {
		return resolveMidnightHour(hourData, translation)
	}

	return resolveHour(hourData as AgpeyaHourData, translation)
}

/**
 * Get a specific watch from midnight prayer
 */
export function getMidnightWatch(
	watchId: MidnightWatchId,
	translation: BibleTranslation = 'en'
): ResolvedAgpeyaWatch | null {
	const midnightData = getAgpeyaHourData('midnight') as AgpeyaMidnightHour
	if (!midnightData) return null

	const watchIndex = parseInt(watchId, 10) - 1
	const watch = midnightData.watches[watchIndex]
	if (!watch) return null

	return resolveWatch(watch, translation)
}

/**
 * Get all Agpeya hours with resolved content
 */
export function getAllHours(
	translation: BibleTranslation = 'en'
): (ResolvedAgpeyaHour | ResolvedMidnightHour)[] {
	const hourIds = getAgpeyaHourIds()
	const resolved: (ResolvedAgpeyaHour | ResolvedMidnightHour)[] = []

	for (const hourId of hourIds) {
		const hour = getAgpeyaHour(hourId, translation)
		if (hour) {
			resolved.push(hour)
		}
	}

	return resolved
}

export function getHourIds(): AgpeyaHourId[] {
	return getAgpeyaHourIds()
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
