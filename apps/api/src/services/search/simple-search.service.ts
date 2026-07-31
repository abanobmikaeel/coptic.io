/**
 * Simple In-Memory Search Service
 *
 * A lightweight search implementation that works directly with the data.
 * This can be replaced with MeiliSearch or Elasticsearch in the future
 * by implementing the SearchService interface.
 */

import { type AgpeyaHourId, getAllAgpeyaHours, isMidnightHour } from '@coptic/data/en/agpeya'
import { getRawBible, warmTranslation } from '../../models/readings/bibleDataMapper'
import type { BibleBook, BibleType } from '../../types'
import { searchSynaxarium as searchSynaxariumService } from '../synaxarium.service'
import type {
	AgpeyaSearchResult,
	BibleSearchResult,
	SearchOptions,
	SearchResponse,
	SearchService,
	SynaxariumSearchResult,
} from './search.interface'

// Bible reference parsing regex
// Matches patterns like: "John 3:16", "Genesis 1", "1 John 2:3-5", "Ps 23"
const BIBLE_REF_PATTERN = /^(\d?\s*[a-zA-Z]+)\s*(\d+)(?::(\d+)(?:-(\d+))?)?$/i

// Book name aliases for common abbreviations
const BOOK_ALIASES: Record<string, string> = {
	gen: 'Genesis',
	ex: 'Exodus',
	exod: 'Exodus',
	lev: 'Leviticus',
	num: 'Numbers',
	deut: 'Deuteronomy',
	josh: 'Joshua',
	judg: 'Judges',
	ps: 'Psalms',
	psa: 'Psalms',
	psalm: 'Psalms',
	prov: 'Proverbs',
	eccl: 'Ecclesiastes',
	isa: 'Isaiah',
	jer: 'Jeremiah',
	lam: 'Lamentations',
	ezek: 'Ezekiel',
	dan: 'Daniel',
	hos: 'Hosea',
	matt: 'Matthew',
	mk: 'Mark',
	lk: 'Luke',
	jn: 'John',
	rom: 'Romans',
	cor: 'Corinthians',
	gal: 'Galatians',
	eph: 'Ephesians',
	phil: 'Philippians',
	col: 'Colossians',
	thess: 'Thessalonians',
	tim: 'Timothy',
	tit: 'Titus',
	heb: 'Hebrews',
	jas: 'James',
	pet: 'Peter',
	rev: 'Revelation',
}

// Agpeya hour aliases
const HOUR_ALIASES: Record<string, AgpeyaHourId> = {
	prime: 'prime',
	first: 'prime',
	morning: 'prime',
	'1st': 'prime',
	terce: 'terce',
	third: 'terce',
	'3rd': 'terce',
	sext: 'sext',
	sixth: 'sext',
	'6th': 'sext',
	noon: 'sext',
	none: 'none',
	ninth: 'none',
	'9th': 'none',
	vespers: 'vespers',
	evening: 'vespers',
	sunset: 'vespers',
	compline: 'compline',
	sleep: 'compline',
	night: 'compline',
	midnight: 'midnight',
	'12th': 'midnight',
}

/** One verse, flattened and pre-lowercased for full-text scanning. */
interface IndexedVerse {
	book: string
	chapter: number
	verse: number
	text: string
	lower: string
}

export class SimpleSearchService implements SearchService {
	private bible: BibleType | null = null
	private bookIndex: Map<string, BibleBook> = new Map()
	private bookNameLower: Map<string, string> = new Map()
	// Flat, pre-lowercased verse list. A query that matches little or nothing has
	// to walk every verse, and lowercasing all ~31k of them per request is the
	// expensive part; paying it once at startup keeps a miss off the CPU budget.
	private verseIndex: IndexedVerse[] = []
	private ready = false

	async initialize(): Promise<void> {
		await warmTranslation('en')
		this.bible = getRawBible('en')
		for (const book of this.bible.books) {
			this.bookIndex.set(book.name.toLowerCase(), book)
			this.bookNameLower.set(book.name.toLowerCase(), book.name)
			for (const chapter of book.chapters) {
				for (const verse of chapter.verses) {
					this.verseIndex.push({
						book: book.name,
						chapter: chapter.num,
						verse: verse.num,
						text: verse.text,
						lower: verse.text.toLowerCase(),
					})
				}
			}
		}
		this.ready = true
	}

	isReady(): boolean {
		return this.ready
	}

	getBackendName(): string {
		return 'simple-in-memory'
	}

	async search(options: SearchOptions): Promise<SearchResponse> {
		const { query, limit = 5, categories } = options
		const searchCategories = categories || ['bible', 'synaxarium', 'agpeya']

		const results: {
			bible: BibleSearchResult[]
			synaxarium: SynaxariumSearchResult[]
			agpeya: AgpeyaSearchResult[]
		} = {
			bible: [],
			synaxarium: [],
			agpeya: [],
		}

		// Run searches in parallel
		const [bible, synaxarium, agpeya] = await Promise.all([
			searchCategories.includes('bible') ? this.searchBible(query, limit) : Promise.resolve([]),
			searchCategories.includes('synaxarium')
				? this.searchSynaxarium(query, limit)
				: Promise.resolve([]),
			searchCategories.includes('agpeya') ? this.searchAgpeya(query, limit) : Promise.resolve([]),
		])

		results.bible = bible
		results.synaxarium = synaxarium
		results.agpeya = agpeya

		const totalCount = results.bible.length + results.synaxarium.length + results.agpeya.length

		return {
			results,
			query,
			totalCount,
		}
	}

	async searchBible(query: string, limit = 5): Promise<BibleSearchResult[]> {
		const results: BibleSearchResult[] = []
		const queryLower = query.toLowerCase().trim()

		if (!queryLower || !this.bible) return results

		// First, try to parse as a Bible reference (e.g., "John 3:16")
		const refMatch = queryLower.match(BIBLE_REF_PATTERN)
		if (refMatch) {
			const [, bookPart, chapterStr, verseStartStr] = refMatch
			if (!bookPart || !chapterStr) return results

			const chapter = parseInt(chapterStr, 10)
			const verseStart = verseStartStr ? parseInt(verseStartStr, 10) : undefined

			// Resolve book name from alias or direct match
			const bookName = this.resolveBookName(bookPart.trim())
			if (bookName) {
				const book = this.bookIndex.get(bookName.toLowerCase())
				if (book) {
					const chapterData = book.chapters.find((c) => c.num === chapter)
					if (chapterData) {
						if (verseStart !== undefined) {
							// Specific verse
							const verse = chapterData.verses.find((v) => v.num === verseStart)
							if (verse) {
								results.push({
									type: 'reference',
									book: book.name,
									chapter,
									verse: verseStart,
									text: verse.text,
									url: `/bible/${book.name.toLowerCase()}/${chapter}#${verseStart}`,
									score: 100,
								})
							}
						} else {
							// Whole chapter - show first verse as preview
							const firstVerse = chapterData.verses[0]
							if (firstVerse) {
								results.push({
									type: 'reference',
									book: book.name,
									chapter,
									text: `${firstVerse.text}...`,
									url: `/bible/${book.name.toLowerCase()}/${chapter}`,
									score: 95,
								})
							}
						}
					}
				}
			}
		}

		// If we found a reference match, return it prioritized
		if (results.length > 0) {
			return results.slice(0, limit)
		}

		// Otherwise, search by book name
		const bookMatches: BibleSearchResult[] = []
		for (const book of this.bible.books) {
			if (book.name.toLowerCase().includes(queryLower)) {
				bookMatches.push({
					type: 'reference',
					book: book.name,
					chapter: 1,
					text: `${book.chapters.length} chapters`,
					url: `/bible/${book.name.toLowerCase()}/1`,
					score: 80,
				})
			}
		}

		if (bookMatches.length > 0) {
			return bookMatches.slice(0, limit)
		}

		// Full-text search on verses. Stop once we have enough results.
		// Only search if query is at least 3 characters
		if (queryLower.length >= 3) {
			const textResults: BibleSearchResult[] = []

			for (const verse of this.verseIndex) {
				if (!verse.lower.includes(queryLower)) continue

				textResults.push({
					type: 'verse',
					book: verse.book,
					chapter: verse.chapter,
					verse: verse.verse,
					text: this.truncateText(verse.text, 100),
					url: `/bible/${verse.book.toLowerCase()}/${verse.chapter}#${verse.verse}`,
					score: 60,
				})

				if (textResults.length >= limit) break
			}

			return textResults
		}

		return results
	}

	async searchSynaxarium(query: string, limit = 5): Promise<SynaxariumSearchResult[]> {
		const queryLower = query.toLowerCase().trim()
		if (!queryLower) return []

		// Use existing synaxarium search service
		const rawResults = searchSynaxariumService(query, limit)

		return rawResults.map((result) => ({
			type: 'saint' as const,
			name: result.entry?.name || 'Unknown',
			date: result.date,
			copticDate: result.copticDate?.dateString || result.date,
			url: `/synaxarium/${encodeURIComponent(result.date)}`,
			score: 70,
		}))
	}

	async searchAgpeya(query: string, limit = 5): Promise<AgpeyaSearchResult[]> {
		const results: AgpeyaSearchResult[] = []
		const queryLower = query.toLowerCase().trim()

		if (!queryLower) return results

		// Check for direct hour alias match
		const aliasMatch = HOUR_ALIASES[queryLower]
		if (aliasMatch) {
			const hours = getAllAgpeyaHours()
			const hour = hours.find((h) => h.id === aliasMatch)
			if (hour) {
				results.push({
					type: 'hour',
					id: hour.id,
					name: hour.name,
					englishName: hour.englishName,
					traditionalTime: hour.traditionalTime,
					url: `/agpeya?hour=${hour.id}`,
					score: 100,
				})
			}
		}

		// Search all hours by name
		const hours = getAllAgpeyaHours()
		for (const hour of hours) {
			// Skip if already added via alias
			if (results.some((r) => r.id === hour.id)) continue

			const nameMatch =
				hour.name.toLowerCase().includes(queryLower) ||
				hour.englishName.toLowerCase().includes(queryLower)

			if (nameMatch) {
				results.push({
					type: 'hour',
					id: hour.id,
					name: hour.name,
					englishName: hour.englishName,
					traditionalTime: hour.traditionalTime,
					url: `/agpeya?hour=${hour.id}`,
					score: 80,
				})
			}

			// For midnight, also check watches
			if (isMidnightHour(hour)) {
				for (const watch of hour.watches) {
					if (
						watch.name.toLowerCase().includes(queryLower) ||
						watch.theme.toLowerCase().includes(queryLower)
					) {
						results.push({
							type: 'prayer',
							id: `midnight-watch-${watch.id}`,
							name: watch.name,
							englishName: watch.theme,
							url: `/agpeya?hour=midnight&watch=${watch.id}`,
							score: 70,
						})
					}
				}
			}
		}

		// Sort by score and limit
		return results.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, limit)
	}

	private resolveBookName(input: string): string | null {
		const trimmed = input.trim().toLowerCase()
		const normalized = trimmed.replace(/\s+/g, '')
		const leadingNumberMatch = trimmed.match(/^(\d)\s*/)
		const prefix = leadingNumberMatch?.[1]
		const withoutPrefix = prefix ? normalized.slice(1) : normalized

		// Check aliases first (longest alias first to avoid "ps" matching "psalm")
		const aliases = Object.entries(BOOK_ALIASES).sort((a, b) => b[0].length - a[0].length)
		for (const [alias, fullName] of aliases) {
			if (withoutPrefix === alias || withoutPrefix.startsWith(alias)) {
				return prefix ? `${prefix} ${fullName}` : fullName
			}
		}

		// Check direct book name match (with and without leading number)
		const bookName = this.bookNameLower.get(normalized)
		if (bookName) return bookName
		if (prefix) {
			const bookNameNoNum = this.bookNameLower.get(
				`${prefix} ${withoutPrefix.replace(/\d/g, '').trim()}`,
			)
			if (bookNameNoNum) return bookNameNoNum
		}

		// Partial match against normalized names
		for (const [lowerName, originalName] of this.bookNameLower.entries()) {
			const normalizedLower = lowerName.replace(/\s+/g, '')
			if (normalizedLower.startsWith(normalized)) return originalName
			if (prefix && normalizedLower.startsWith(withoutPrefix)) return `${prefix} ${originalName}`
		}

		return null
	}

	private truncateText(text: string, maxLength: number): string {
		if (text.length <= maxLength) return text
		return `${text.slice(0, maxLength).trim()}...`
	}
}

// Default instance
let searchServiceInstance: SimpleSearchService | null = null

export function getSearchService(): SimpleSearchService {
	if (!searchServiceInstance) {
		searchServiceInstance = new SimpleSearchService()
	}
	return searchServiceInstance
}
