import { bench, describe } from 'vitest'
import { synaxariumCanonical, synaxariumIndex } from '../en'

// Type definitions
interface SynaxariumEntry {
	url?: string
	name?: string
	text?: string
}

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

// Cast to typed versions
const canonical = synaxariumCanonical as Record<string, SynaxariumEntry[]>
const index = synaxariumIndex as SynaxariumIndexType

// Test data
const testKeys = [
	'1 Tout', // First day of Coptic year
	'15 Toba', // Mid-month
	'29 Kiahk', // Nativity
	'1 Nasie', // Small month
]

const searchTerms = {
	common: 'mary',
	saint: 'saint george',
	apostle: 'paul',
	martyr: 'martyr',
	rare: 'theophilus',
	multiWord: 'saint mary virgin',
}

describe('Synaxarium Canonical Lookup', () => {
	bench('Direct key lookup - single', () => {
		canonical['15 Toba']
	})

	bench('Direct key lookup - 4 keys', () => {
		for (const key of testKeys) {
			canonical[key]
		}
	})

	bench('Direct key lookup - all 390 days', () => {
		for (const key of Object.keys(canonical)) {
			canonical[key]
		}
	})

	bench('Lookup + count entries', () => {
		const entries = canonical['15 Toba']
		entries?.length
	})

	bench('Lookup + iterate entries', () => {
		const entries = canonical['15 Toba']
		if (entries) {
			for (const entry of entries) {
				entry.name
			}
		}
	})
})

describe('Synaxarium Index Access', () => {
	bench('Access entries array', () => {
		index.entries.length
	})

	bench('Access single entry by index', () => {
		index.entries[100]
	})

	bench('Access wordIndex keys', () => {
		Object.keys(index.wordIndex).length
	})

	bench('Word lookup - common word', () => {
		index.wordIndex.mary
	})

	bench('Word lookup - resolve indices to entries', () => {
		const indices = index.wordIndex.mary
		if (indices) {
			indices.map((i) => index.entries[i])
		}
	})
})

describe('Synaxarium Search Simulation', () => {
	// Simulate the search algorithm from synaxarium.service.ts

	const getEntriesForWord = (word: string): IndexedEntry[] => {
		const indices = index.wordIndex[word]
		if (!indices) return []
		return indices.map((i) => index.entries[i]).filter((e): e is IndexedEntry => !!e)
	}

	const searchByWord = (term: string): IndexedEntry[] => {
		const searchLower = term.toLowerCase().trim()
		const searchWords = searchLower.split(/\s+/).filter((w) => w.length >= 3)

		if (searchWords.length === 0) return []

		const wordMatches = searchWords
			.map((word) => {
				const cleaned = word.replace(/[^a-z]/g, '')
				if (cleaned.length < 3) return undefined
				const entries = getEntriesForWord(cleaned)
				return entries.length > 0 ? entries : undefined
			})
			.filter((matches): matches is IndexedEntry[] => !!matches)

		if (wordMatches.length !== searchWords.length) {
			// Fallback to substring
			return index.entries.filter((e) => e.nameLower.includes(searchLower))
		}

		// Intersect results
		return wordMatches.reduce((acc, matches) => {
			const matchSet = new Set(matches)
			return acc.filter((entry) => matchSet.has(entry))
		})
	}

	const searchBySubstring = (term: string): IndexedEntry[] => {
		const searchLower = term.toLowerCase()
		return index.entries.filter((e) => e.nameLower.includes(searchLower))
	}

	bench('Word index search - "mary"', () => {
		searchByWord(searchTerms.common)
	})

	bench('Word index search - "saint george"', () => {
		searchByWord(searchTerms.saint)
	})

	bench('Word index search - "saint mary virgin"', () => {
		searchByWord(searchTerms.multiWord)
	})

	bench('Substring search - "mary" (fallback)', () => {
		searchBySubstring(searchTerms.common)
	})

	bench('Substring search - full scan', () => {
		searchBySubstring('xyz')
	})
})

describe('Memory/Size Metrics', () => {
	bench('JSON.stringify canonical (size check)', () => {
		JSON.stringify(canonical).length
	})

	bench('JSON.stringify index (size check)', () => {
		JSON.stringify(index).length
	})

	bench('Count total synaxarium entries', () => {
		let count = 0
		for (const entries of Object.values(canonical)) {
			count += entries.length
		}
		void count
	})

	bench('Count unique words in index', () => {
		Object.keys(index.wordIndex).length
	})
})

describe('Real-world Scenarios', () => {
	bench('Daily lookup: get entries for date', () => {
		// Simulates getSynaxariumForDate
		const key = '15 Toba'
		const entries = canonical[key]
		if (entries) {
			// Strip text field (common operation)
			entries.map(({ text: _text, ...rest }) => rest)
		}
	})

	bench('Search with limit (top 10)', () => {
		const results = []
		const indices = index.wordIndex.mary
		if (indices) {
			for (let i = 0; i < Math.min(10, indices.length); i++) {
				results.push(index.entries[indices[i]])
			}
		}
	})

	bench('Autocomplete: prefix search simulation', () => {
		// Find all words starting with "mar"
		const prefix = 'mar'
		Object.keys(index.wordIndex).filter((w) => w.startsWith(prefix))
	})
})
