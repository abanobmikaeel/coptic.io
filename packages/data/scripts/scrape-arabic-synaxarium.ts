/**
 * Scrape Arabic Synaxarium from CopticChurch.net
 *
 * The Arabic synaxarium uses the same URL structure as English:
 * https://www.copticchurch.net/synaxarium/{month}_{day}.html?lang=ar
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

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

const BASE_URL = 'https://www.copticchurch.net/synaxarium'

interface SynaxariumEntry {
	url: string
	name: string
	text: string
}

function parseEntriesFromHtml(html: string, monthNum: number, day: number): SynaxariumEntry[] {
	const entries: SynaxariumEntry[] = []

	// Split by h3 tags which contain entry headers
	// Pattern: <h3><A NAME='1'>1. Title </a></h3> followed by <p> content </p>
	const entryPattern =
		/<h3><A NAME='(\d+)'[^>]*>[\d.]*\s*([^<]+)<\/a><\/h3>([\s\S]*?)(?=<h3>|<\/div>)/gi

	for (const match of html.matchAll(entryPattern)) {
		const entryNum = match[1]
		const name = (match[2] ?? '').trim()
		const contentBlock = match[3] ?? ''

		// Extract text from all <p> tags in this entry
		const paragraphs: string[] = []
		const pPattern = /<p>([^<]*(?:<[^p][^>]*>[^<]*<\/[^p][^>]*>)*[^<]*)<\/p>/gi
		for (const pMatch of contentBlock.matchAll(pPattern)) {
			// Clean up the text - remove inner tags and extra whitespace
			const text = (pMatch[1] ?? '')
				.replace(/<[^>]+>/g, '')
				.replace(/\s+/g, ' ')
				.trim()
			if (text && text.length > 10) {
				paragraphs.push(text)
			}
		}

		if (name && paragraphs.length > 0) {
			entries.push({
				url: `${BASE_URL}/${monthNum}_${day}.html?lang=ar#${entryNum}`,
				name,
				text: paragraphs.join('\n\n'),
			})
		}
	}

	return entries
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

async function scrapeDay(monthNum: number, day: number): Promise<SynaxariumEntry[]> {
	const url = `${BASE_URL}/${monthNum}_${day}.html?lang=ar`

	try {
		const html = await fetchWithRetry(url)
		return parseEntriesFromHtml(html, monthNum, day)
	} catch (err) {
		console.error(`  Error fetching ${url}: ${err}`)
		return []
	}
}

async function main() {
	const synaxarium: Record<string, SynaxariumEntry[]> = {}
	let totalEntries = 0

	console.log('Scraping Arabic Synaxarium from CopticChurch.net...\n')

	for (const month of COPTIC_MONTHS) {
		console.log(`\n${month.name} (${month.days} days)...`)

		for (let day = 1; day <= month.days; day++) {
			const dateKey = `${day} ${month.name}`
			process.stdout.write(`  Day ${day}... `)

			const entries = await scrapeDay(month.num, day)

			if (entries.length > 0) {
				synaxarium[dateKey] = entries
				totalEntries += entries.length
				console.log(`${entries.length} entries`)
			} else {
				console.log('no entries found')
			}

			// Rate limiting - be nice to the server
			await new Promise((r) => setTimeout(r, 300))
		}
	}

	// Save the data
	const outputDir = join(import.meta.dirname, '..', 'src', 'ar', 'synaxarium')
	mkdirSync(outputDir, { recursive: true })

	const outputPath = join(outputDir, 'canonical.json')
	writeFileSync(outputPath, JSON.stringify(synaxarium, null, '\t'))

	console.log(`\n\nDone! Scraped ${totalEntries} total entries`)
	console.log(`Saved to: ${outputPath}`)
}

main().catch(console.error)
