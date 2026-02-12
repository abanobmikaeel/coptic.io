import { type SynaxariumEntry, type SynaxariumSearchResult, gregorianToCoptic } from '@coptic/core'
import { synaxariumCanonical as synaxariumAr } from '@coptic/data/ar'
import { synaxariumCanonical, synaxariumIndex } from '@coptic/data/en'
import { decodeHtmlEntities } from '../utils/textUtils'

type SynaxariumLanguage = 'en' | 'ar'

// Decode HTML entities in a synaxarium entry
function decodeEntry(entry: SynaxariumEntry, includeText = true): SynaxariumEntry {
	// Destructure to separate text from other properties
	const { text, ...rest } = entry
	const decoded: SynaxariumEntry = {
		...rest,
		name: decodeHtmlEntities(entry.name) || entry.name,
	}
	// Only include text if explicitly requested
	if (includeText && text !== undefined) {
		decoded.text = decodeHtmlEntities(text)
	}
	return decoded
}

// Get synaxarium data by language
const getSynaxariumData = (lang: SynaxariumLanguage = 'en'): Record<string, SynaxariumEntry[]> => {
	switch (lang) {
		case 'ar':
			return synaxariumAr as Record<string, SynaxariumEntry[]>
		default:
			return synaxariumCanonical as Record<string, SynaxariumEntry[]>
	}
}

// Type for the pre-built index from @coptic/data
interface IndexedEntry {
	key: string
	day: number
	monthString: string
	url?: string
	name: string
	nameLower: string
}

interface SynaxariumIndexType {
	entries: IndexedEntry[]
	wordIndex: Record<string, number[]>
	generatedAt: string
}

// Use pre-built index from @coptic/data (generated at deploy time)
const indexData = synaxariumIndex as SynaxariumIndexType
const allEntries = indexData.entries
const wordIndex = indexData.wordIndex // Use directly - no conversion needed

// Resolve indices to entries (called lazily during search)
const getEntriesForWord = (word: string): IndexedEntry[] => {
	const indices = wordIndex[word]
	if (!indices) return []
	return indices.map((i) => allEntries[i]).filter((e): e is IndexedEntry => !!e)
}

export const getSynaxariumForDate = (
	date: Date,
	includeText = false,
	lang: SynaxariumLanguage = 'en',
): SynaxariumEntry[] | null => {
	const copticDate = gregorianToCoptic(date)
	const synaxariumKey = `${copticDate.day} ${copticDate.monthString}`
	const data = getSynaxariumData(lang)
	const synaxarium = data[synaxariumKey]

	if (!synaxarium) {
		return null
	}

	return synaxarium.map((entry) => decodeEntry(entry, includeText))
}

export const getSynaxariumByCopticDate = (
	copticDateKey: string,
	includeText = false,
	lang: SynaxariumLanguage = 'en',
): SynaxariumEntry[] | null => {
	const data = getSynaxariumData(lang)
	const synaxarium = data[copticDateKey]

	if (!synaxarium) {
		return null
	}

	return synaxarium.map((entry) => decodeEntry(entry, includeText))
}

export const searchSynaxarium = (searchTerm: string, limit = 50): SynaxariumSearchResult[] => {
	const searchLower = searchTerm.toLowerCase().trim()
	if (!searchLower) return []

	// Try word-based index lookup first (O(1) per word)
	const searchWords = searchLower.split(/\s+/).filter((w) => w.length >= 3)
	let candidates: IndexedEntry[]

	if (searchWords.length > 0) {
		// Find entries that match all search words (lazy resolution from indices)
		const wordMatches = searchWords
			.map((word) => {
				const cleaned = word.replace(/[^a-z]/g, '')
				if (cleaned.length < 3) return undefined
				const entries = getEntriesForWord(cleaned)
				return entries.length > 0 ? entries : undefined
			})
			.filter((matches): matches is IndexedEntry[] => !!matches)

		if (wordMatches.length === searchWords.length) {
			// Intersect results - entries must match all words
			candidates = wordMatches.reduce((acc, matches) => {
				const matchSet = new Set(matches)
				return acc.filter((entry) => matchSet.has(entry))
			})
		} else {
			// Fallback to substring search if word not in index
			candidates = allEntries.filter((e) => e.nameLower.includes(searchLower))
		}
	} else {
		// Short search term - use substring matching
		candidates = allEntries.filter((e) => e.nameLower.includes(searchLower))
	}

	// Convert to results (limit applied)
	const results: SynaxariumSearchResult[] = []
	for (const indexed of candidates) {
		if (results.length >= limit) break

		results.push({
			date: indexed.key,
			copticDate: {
				dateString: indexed.key,
				day: indexed.day,
				monthString: indexed.monthString,
			},
			entry: {
				url: indexed.url,
				name: indexed.name,
			},
		})
	}

	return results
}
