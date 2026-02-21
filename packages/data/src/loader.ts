import type { LentDevotionalReading, SynaxariumEntry } from '@coptic/core'
import type { SupportedLanguage, SynaxariumSource } from './index'

export type RawSynaxariumData = Record<string, SynaxariumEntry[]>

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

export interface RawBibleData {
	books: BibleBookData[]
}

export const loadSynaxarium = async (
	language: SupportedLanguage,
	_source: SynaxariumSource = 'canonical',
): Promise<RawSynaxariumData> => {
	switch (language) {
		case 'ar':
			return (await import('./ar/synaxarium/canonical.json')).default as RawSynaxariumData
		default:
			return (await import('./en/synaxarium/canonical.json')).default as RawSynaxariumData
	}
}

export const loadBible = async (language: SupportedLanguage): Promise<RawBibleData> => {
	switch (language) {
		case 'en':
			return (await import('./en/bible/books.json')).default as RawBibleData
		case 'ar':
			return (await import('./ar/bible/books.json')).default as RawBibleData
		case 'es':
			return (await import('./es/bible/books.json')).default as RawBibleData
		case 'cop':
			return (await import('./coptic/canonical.json')).default as unknown as RawBibleData // combines Bohairic + Sahidic fallbacks
		default:
			return (await import('./en/bible/books.json')).default as RawBibleData
	}
}

export const getSynaxariumForDate = async (
	dateKey: string,
	language: SupportedLanguage = 'en',
	source: SynaxariumSource = 'canonical',
): Promise<SynaxariumEntry[]> => {
	const synaxarium = await loadSynaxarium(language, source)
	return synaxarium[dateKey] ?? []
}

export const searchSynaxarium = async (
	query: string,
	language: SupportedLanguage = 'en',
	limit = 50,
): Promise<{ date: string; entry: SynaxariumEntry }[]> => {
	const synaxarium = await loadSynaxarium(language)
	const queryLower = query.toLowerCase()
	const matches: { date: string; entry: SynaxariumEntry }[] = []

	for (const [date, entries] of Object.entries(synaxarium)) {
		for (const entry of entries) {
			if (!entry.name?.toLowerCase().includes(queryLower)) continue
			matches.push({ date, entry })
			if (matches.length >= limit) return matches
		}
	}

	return matches
}

export const loadLentDevotional = async (): Promise<LentDevotionalReading[]> => {
	return (await import('./en/lent/devotional.json')).default as LentDevotionalReading[]
}
