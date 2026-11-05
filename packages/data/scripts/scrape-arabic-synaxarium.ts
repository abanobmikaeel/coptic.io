/**
 * Scrape the Arabic Synaxarium from CopticChurch.net, one page per Coptic day:
 * https://copticchurch.net/synaxarium/ar/{month}_{day}
 *
 *   bun scripts/scrape-arabic-synaxarium.ts             Rewrite canonical.json
 *   bun scripts/scrape-arabic-synaxarium.ts --only=2_13 Replace one day, keeping the rest
 *
 * A full run drops the `id` that links each entry to its English counterpart, so
 * correct a single day with --only and name its ids in ENGLISH_IDS.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { type ScrapedEntry, parseEntries } from './lib/synaxarium-html'

// Coptic months and their days
const COPTIC_MONTHS = [
	{ name: 'Tout', days: 30, num: 1 },
	{ name: 'Baba', days: 30, num: 2 },
	{ name: 'Hator', days: 30, num: 3 },
	{ name: 'Kiahk', days: 30, num: 4 },
	{ name: 'Toba', days: 30, num: 5 },
	{ name: 'Amshir', days: 30, num: 6 },
	{ name: 'Baramhat', days: 30, num: 7 },
	{ name: 'Baramouda', days: 30, num: 8 },
	{ name: 'Bashans', days: 30, num: 9 },
	{ name: 'Paona', days: 30, num: 10 },
	{ name: 'Epep', days: 30, num: 11 },
	{ name: 'Mesra', days: 30, num: 12 },
	{ name: 'Nasie', days: 6, num: 13 }, // 5 or 6 days (leap year)
]

const BASE_URL = 'https://copticchurch.net/synaxarium/ar'

const OUTPUT_PATH = join(import.meta.dirname, '..', 'src', 'ar', 'synaxarium', 'canonical.json')

type Synaxarium = Record<string, (ScrapedEntry & { id?: string })[]>

/** The English entry ids of days scraped with --only, in the page's entry order. */
const ENGLISH_IDS: Record<string, string[]> = {
	'13 Baba': ['13-baba-the-departure-of-saint-zacharias-the-monk'],
}

// Fetch with retry
async function fetchWithRetry(url: string, retries = 3): Promise<string> {
	for (let i = 0; i < retries; i++) {
		try {
			const response = await fetch(url)
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`)
			}
			return await response.text()
		} catch (err) {
			if (i === retries - 1) throw err
			await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
		}
	}
	throw new Error('unreachable')
}

async function scrapeDay(monthNum: number, day: number): Promise<ScrapedEntry[]> {
	const url = `${BASE_URL}/${monthNum}_${day}`

	try {
		return parseEntries(await fetchWithRetry(url), url)
	} catch (err) {
		console.error(`  Error fetching ${url}: ${err}`)
		return []
	}
}

const dateKeys = (): { key: string; monthNum: number; day: number }[] =>
	COPTIC_MONTHS.flatMap((month) =>
		Array.from({ length: month.days }, (_, i) => ({
			key: `${i + 1} ${month.name}`,
			monthNum: month.num,
			day: i + 1,
		})),
	)

const save = (synaxarium: Synaxarium) => {
	mkdirSync(join(OUTPUT_PATH, '..'), { recursive: true })
	writeFileSync(OUTPUT_PATH, JSON.stringify(synaxarium, null, '\t'))
	console.log(`Saved to: ${OUTPUT_PATH}`)
}

/** Replace one day in canonical.json, leaving every other entry byte for byte. */
async function scrapeOne(only: string) {
	const target = dateKeys().find(({ monthNum, day }) => `${monthNum}_${day}` === only)
	if (!target) throw new Error(`No Coptic day ${only}; expected {month}_{day}, e.g. 2_13`)

	const entries = await scrapeDay(target.monthNum, target.day)
	const ids = ENGLISH_IDS[target.key]
	if (ids?.length !== entries.length) {
		throw new Error(`${target.key}: ${entries.length} entries, ENGLISH_IDS has ${ids?.length ?? 0}`)
	}

	const existing = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8')) as Synaxarium
	const day = entries.map((entry, i) => ({ ...entry, id: ids[i] }))
	const merged: Synaxarium = {}
	for (const { key } of dateKeys()) {
		const value = key === target.key ? day : existing[key]
		if (value) merged[key] = value
	}
	save(merged)
}

async function main() {
	const only = process.argv.find((arg) => arg.startsWith('--only='))?.slice('--only='.length)
	if (only) return scrapeOne(only)

	const synaxarium: Synaxarium = {}
	const missing: string[] = []
	let totalEntries = 0

	console.log('Scraping Arabic Synaxarium from CopticChurch.net...\n')

	for (const { key, monthNum, day } of dateKeys()) {
		process.stdout.write(`  ${key}... `)

		const entries = await scrapeDay(monthNum, day)

		if (entries.length > 0) {
			synaxarium[key] = entries
			totalEntries += entries.length
			console.log(`${entries.length} entries`)
		} else {
			missing.push(key)
			console.log('no entries found')
		}

		// Rate limiting - be nice to the server
		await new Promise((r) => setTimeout(r, 300))
	}

	// A day left out here fails every Arabic request for it, so stop before saving.
	if (missing.length > 0) throw new Error(`No entries for: ${missing.join(', ')}`)

	console.log(`\n\nDone! Scraped ${totalEntries} total entries`)
	save(synaxarium)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
