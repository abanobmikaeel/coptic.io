/**
 * Pre-generates the synaxarium search index at build/deploy time.
 * Run with: pnpm tsx scripts/build-synaxarium-index.ts
 *
 * This avoids runtime indexing cost by baking the word index into a JSON file.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

interface SynaxariumIndex {
	entries: IndexedEntry[]
	wordIndex: Record<string, number[]> // word -> entry indices
	generatedAt: string
}

const INPUT_PATH = resolve(__dirname, '../src/en/synaxarium/canonical.json')
const OUTPUT_PATH = resolve(__dirname, '../src/en/synaxarium/indexed.json')

function buildIndex(): SynaxariumIndex {
	console.log('Reading synaxarium data...')
	const raw = readFileSync(INPUT_PATH, 'utf-8')
	const synaxarium: Record<string, SynaxariumEntry[]> = JSON.parse(raw)

	const entries: IndexedEntry[] = []
	const wordIndex: Record<string, number[]> = {}

	console.log('Building index...')
	for (const [key, dayEntries] of Object.entries(synaxarium)) {
		const parts = key.split(' ')
		const day = Number.parseInt(parts[0] || '0', 10)
		const monthString = parts.slice(1).join(' ')

		for (const entry of dayEntries) {
			if (!entry.name) continue

			const indexed: IndexedEntry = {
				key,
				day,
				monthString,
				url: entry.url,
				name: entry.name,
				nameLower: entry.name.toLowerCase(),
			}

			const entryIndex = entries.length
			entries.push(indexed)

			// Index each word (3+ chars)
			const words = entry.name.toLowerCase().split(/\s+/)
			for (const word of words) {
				const cleaned = word.replace(/[^a-z]/g, '')
				if (cleaned.length >= 3) {
					if (!wordIndex[cleaned]) {
						wordIndex[cleaned] = []
					}
					wordIndex[cleaned].push(entryIndex)
				}
			}
		}
	}

	console.log(`Indexed ${entries.length} entries with ${Object.keys(wordIndex).length} unique words`)

	return {
		entries,
		wordIndex,
		generatedAt: new Date().toISOString(),
	}
}

const index = buildIndex()
writeFileSync(OUTPUT_PATH, JSON.stringify(index))

const stats = {
	entries: index.entries.length,
	words: Object.keys(index.wordIndex).length,
	sizeKB: Math.round(JSON.stringify(index).length / 1024),
}

console.log(`\nWritten to: ${OUTPUT_PATH}`)
console.log(`Stats: ${stats.entries} entries, ${stats.words} words, ${stats.sizeKB}KB`)
