import type { SynaxariumEntry } from '@coptic/core'
import type { SupportedLanguage, SynaxariumSource } from './index'

/**
 * Raw synaxarium data (date key -> entries)
 */
export type RawSynaxariumData = Record<string, SynaxariumEntry[]>

/**
 * Bible book data
 */
export interface BibleBookData {
	name: string
	chapters: {
		num: number
		verses: {
			num: number
			text: string
		}[]
	}[]
}

/**
 * Raw Bible data
 */
export interface RawBibleData {
	books: BibleBookData[]
}

/**
 * Load synaxarium data for a specific language and source
 */
export const loadSynaxarium = async (
	_language: SupportedLanguage,
	_source: SynaxariumSource = 'canonical',
): Promise<RawSynaxariumData> => {
	const data = await import('./en/synaxarium/canonical.json')
	return data.default as RawSynaxariumData
}

/**
 * Load Bible data for a specific language
 */
export const loadBible = async (language: SupportedLanguage): Promise<RawBibleData> => {
	switch (language) {
		case 'en':
			return (await import('./en/bible/books.json')).default as RawBibleData
		case 'ar':
			return (await import('./ar/bible/books.json')).default as RawBibleData
		case 'es':
			return (await import('./es/bible/books.json')).default as RawBibleData
		default:
			// Fall back to English for unsupported languages
			return (await import('./en/bible/books.json')).default as RawBibleData
	}
}

/**
 * Get synaxarium entries for a specific Coptic date
 */
export const getSynaxariumForDate = async (
	dateKey: string,
	language: SupportedLanguage = 'en',
	source: SynaxariumSource = 'canonical',
): Promise<SynaxariumEntry[]> => {
	const data = await loadSynaxarium(language, source)
	return data[dateKey] ?? []
}

/**
 * Search synaxarium entries by name
 */
export const searchSynaxarium = async (
	query: string,
	language: SupportedLanguage = 'en',
	limit = 50,
): Promise<{ date: string; entry: SynaxariumEntry }[]> => {
	const data = await loadSynaxarium(language)
	const results: { date: string; entry: SynaxariumEntry }[] = []
	const queryLower = query.toLowerCase()

	for (const [date, entries] of Object.entries(data)) {
		for (const entry of entries) {
			if (entry.name?.toLowerCase().includes(queryLower)) {
				results.push({ date, entry })
				if (results.length >= limit) {
					return results
				}
			}
		}
	}

	return results
}
