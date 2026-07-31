import { localizeReference } from '@coptic/data'
import type { BibleTranslation, BibleVerse, Reading } from '../types'

/**
 * Collapse the Katameros readings for one slot into a single citation and a flat
 * verse list — the shape every service that prints a reading needs.
 *
 * Shared by the Incense and Liturgy services, which resolve the same slots out of
 * the same lectionary and differ only in which ones they ask for.
 *
 * The citation is localized here rather than by each caller: the book names come
 * from the English lectionary, so an Arabic reader would otherwise be handed
 * "Ephesians 2:1-22" in the middle of an Arabic column.
 */
export function flattenReadings(
	readings: Reading[],
	translation: BibleTranslation = 'en',
): { reference: string; verses: BibleVerse[] } {
	const verses: BibleVerse[] = []
	const refs: string[] = []

	for (const reading of readings) {
		const first = reading.chapters[0]
		const last = reading.chapters[reading.chapters.length - 1]

		if (first && last) {
			const firstVerse = first.verses[0]?.num
			const lastVerse = last.verses[last.verses.length - 1]?.num

			if (firstVerse != null && lastVerse != null) {
				refs.push(
					reading.chapters.length === 1
						? `${reading.bookName} ${first.chapterNum}:${firstVerse}-${lastVerse}`
						: `${reading.bookName} ${first.chapterNum}:${firstVerse}-${last.chapterNum}:${lastVerse}`,
				)
			} else {
				refs.push(reading.bookName)
			}
		}

		for (const chapter of reading.chapters) {
			verses.push(...chapter.verses)
		}
	}

	const reference = refs.join('; ')
	// Coptic has no localized book names, so it reads the English citation.
	return { reference: localizeReference(reference, translation === 'ar' ? 'ar' : 'en'), verses }
}
