/**
 * Psalm Reference Resolver
 *
 * Resolves psalm references using LXX (Septuagint) numbering to actual Bible text.
 * The Coptic Church uses LXX numbering, but most English Bibles use Masoretic numbering.
 *
 * LXX to Masoretic Mapping:
 * - Psalms 1-8: Same number
 * - Psalms 9-146: Add 1 for Masoretic (LXX 50 = Masoretic 51)
 * - Psalms 147-150: Same (approximately)
 */

import { getChapterByBookName } from '../models/readings/bibleDataMapper'
import type { BibleTranslation, BibleVerse } from '../types'

export interface PsalmReference {
	psalmNumber: number // LXX numbering
	title?: string
	startVerse?: number
	endVerse?: number
}

export interface ResolvedPsalm {
	title: string
	reference: string
	verses: BibleVerse[]
}

export interface GospelReference {
	book: string
	chapter: number
	startVerse: number
	endVerse: number
	rubric?: string
}

export interface ResolvedGospel {
	reference: string
	rubric?: string
	verses: BibleVerse[]
}

/**
 * Convert LXX psalm number to Masoretic (standard Bible) psalm number
 */
export function lxxToMasoretic(lxxPsalm: number): number {
	// For most practical purposes in the Agpeya:
	// Psalms 1-8: Same
	// Psalms 9-146: Add 1
	// Psalms 147-150: Same (approximately)

	if (lxxPsalm <= 8) {
		return lxxPsalm
	}

	if (lxxPsalm >= 9 && lxxPsalm <= 146) {
		return lxxPsalm + 1
	}

	return lxxPsalm
}

/**
 * Convert Masoretic psalm number to LXX
 */
export function masoreticToLxx(masoreticPsalm: number): number {
	if (masoreticPsalm <= 8) {
		return masoreticPsalm
	}

	if (masoreticPsalm >= 10 && masoreticPsalm <= 147) {
		return masoreticPsalm - 1
	}

	return masoreticPsalm
}

/**
 * Get verses from a Bible chapter with optional range
 */
function getVersesFromChapter(
	bookName: string,
	chapterNum: number,
	startVerse?: number,
	endVerse?: number,
	translation: BibleTranslation = 'en'
): BibleVerse[] {
	const chapter = getChapterByBookName(bookName, chapterNum, translation)
	if (!chapter) {
		return []
	}

	let verses = chapter.verses

	if (startVerse !== undefined) {
		verses = verses.filter((v) => v.num >= startVerse)
	}

	if (endVerse !== undefined) {
		verses = verses.filter((v) => v.num <= endVerse)
	}

	return verses
}

/**
 * Resolve a single psalm reference to its verses
 */
export function resolvePsalm(
	ref: PsalmReference,
	translation: BibleTranslation = 'en'
): ResolvedPsalm | null {
	const masoreticNum = lxxToMasoretic(ref.psalmNumber)

	const verses = getVersesFromChapter(
		'Psalms',
		masoreticNum,
		ref.startVerse,
		ref.endVerse,
		translation
	)

	if (verses.length === 0) {
		console.warn(
			`No verses found for Psalm ${ref.psalmNumber} (LXX) / ${masoreticNum} (Masoretic)`
		)
		return null
	}

	// Build reference string
	let reference = `Psalm ${ref.psalmNumber}`
	if (ref.startVerse !== undefined && ref.endVerse !== undefined) {
		reference = `Psalm ${ref.psalmNumber}:${ref.startVerse}-${ref.endVerse}`
	} else if (ref.startVerse !== undefined) {
		reference = `Psalm ${ref.psalmNumber}:${ref.startVerse}-end`
	}

	return {
		title: ref.title || `Psalm ${ref.psalmNumber}`,
		reference,
		verses,
	}
}

/**
 * Resolve multiple psalm references
 */
export function resolvePsalms(
	refs: PsalmReference[],
	translation: BibleTranslation = 'en'
): ResolvedPsalm[] {
	const results: ResolvedPsalm[] = []

	for (const ref of refs) {
		const resolved = resolvePsalm(ref, translation)
		if (resolved) {
			results.push(resolved)
		}
	}

	return results
}

/**
 * Resolve a gospel reference to its verses
 */
export function resolveGospel(
	ref: GospelReference,
	translation: BibleTranslation = 'en'
): ResolvedGospel | null {
	const verses = getVersesFromChapter(
		ref.book,
		ref.chapter,
		ref.startVerse,
		ref.endVerse,
		translation
	)

	if (verses.length === 0) {
		console.warn(
			`No verses found for ${ref.book} ${ref.chapter}:${ref.startVerse}-${ref.endVerse}`
		)
		return null
	}

	const reference = `${ref.book} ${ref.chapter}:${ref.startVerse}-${ref.endVerse}`

	return {
		reference,
		rubric: ref.rubric,
		verses,
	}
}

/**
 * Get psalm definition for use in Agpeya data
 * This is the format stored in agpeya.json
 */
export interface AgpeyaPsalmRef {
	psalmNumber: number
	title?: string
	startVerse?: number
	endVerse?: number
}

export interface AgpeyaGospelRef {
	book: string
	chapter: number
	startVerse: number
	endVerse: number
	rubric?: string
}

/**
 * Resolve Agpeya psalm references to full psalm data
 */
export function resolveAgpeyaPsalms(
	refs: AgpeyaPsalmRef[],
	translation: BibleTranslation = 'en'
): ResolvedPsalm[] {
	return resolvePsalms(
		refs.map((ref) => ({
			psalmNumber: ref.psalmNumber,
			title: ref.title || `Psalm ${ref.psalmNumber}`,
			startVerse: ref.startVerse,
			endVerse: ref.endVerse,
		})),
		translation
	)
}

/**
 * Resolve Agpeya gospel reference to full gospel data
 */
export function resolveAgpeyaGospel(
	ref: AgpeyaGospelRef,
	translation: BibleTranslation = 'en'
): ResolvedGospel | null {
	return resolveGospel(ref, translation)
}
