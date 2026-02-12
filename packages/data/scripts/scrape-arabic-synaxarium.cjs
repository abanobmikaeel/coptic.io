#!/usr/bin/env node
/**
 * Scrape Arabic Synaxarium from CopticChurch.net
 *
 * The Arabic synaxarium uses the same URL structure as English:
 * https://www.copticchurch.net/synaxarium/{month}_{day}.html?lang=ar
 */

const fs = require('node:fs')
const path = require('node:path')

// Coptic months and their days
const COPTIC_MONTHS = [
	{ name: 'Tout', days: 30, num: 1 },
	{ name: 'Baba', days: 30, num: 2 },
	{ name: 'Hatour', days: 30, num: 3 },
	{ name: 'Kiahk', days: 30, num: 4 },
	{ name: 'Touba', days: 30, num: 5 },
	{ name: 'Amshir', days: 30, num: 6 },
	{ name: 'Baramhat', days: 30, num: 7 },
	{ name: 'Baramouda', days: 30, num: 8 },
	{ name: 'Bashans', days: 30, num: 9 },
	{ name: 'Baouna', days: 30, num: 10 },
	{ name: 'Abib', days: 30, num: 11 },
	{ name: 'Mesra', days: 30, num: 12 },
	{ name: 'Nasie', days: 6, num: 13 }, // 5 or 6 days (leap year)
]

const BASE_URL = 'https://www.copticchurch.net/synaxarium'

function parseEntriesFromHtml(html, monthNum, day) {
	const entries = []

	// Split by h3 tags which contain entry headers
	// Pattern: <h3><A NAME='1'>1. Title </a></h3> followed by <p> content </p>
	const entryPattern =
		/<h3><A NAME='(\d+)'[^>]*>[\d.]*\s*([^<]+)<\/a><\/h3>([\s\S]*?)(?=<h3>|<\/div>)/gi

	let match
	// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	while ((match = entryPattern.exec(html)) !== null) {
		const entryNum = match[1]
		const name = match[2].trim()
		const contentBlock = match[3]

		// Extract text from all <p> tags in this entry
		const paragraphs = []
		const pPattern = /<p>([^<]*(?:<[^p][^>]*>[^<]*<\/[^p][^>]*>)*[^<]*)<\/p>/gi
		let pMatch
		// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
		while ((pMatch = pPattern.exec(contentBlock)) !== null) {
			// Clean up the text - remove inner tags and extra whitespace
			const text = pMatch[1]
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
				name: name,
				text: paragraphs.join('\n\n'),
			})
		}
	}

	return entries
}

// Fetch with retry
async function fetchWithRetry(url, retries = 3) {
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
}

async function scrapeDay(monthNum, day) {
	const url = `${BASE_URL}/${monthNum}_${day}.html?lang=ar`

	try {
		const html = await fetchWithRetry(url)
		const entries = parseEntriesFromHtml(html, monthNum, day)
		return entries
	} catch (err) {
		console.error(`  Error fetching ${url}: ${err.message}`)
		return []
	}
}

async function main() {
	const synaxarium = {}
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
	const outputDir = path.join(__dirname, '../src/ar/synaxarium')
	fs.mkdirSync(outputDir, { recursive: true })

	const outputPath = path.join(outputDir, 'canonical.json')
	fs.writeFileSync(outputPath, JSON.stringify(synaxarium, null, '\t'))

	console.log(`\n\nDone! Scraped ${totalEntries} total entries`)
	console.log(`Saved to: ${outputPath}`)
}

main().catch(console.error)
