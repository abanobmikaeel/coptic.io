#!/usr/bin/env node
/**
 * Scrape Coptic Bible from copticchurch.net and coptic.org
 *
 * Output:
 * - src/coptic/bohairic/books.json  (Bohairic only)
 * - src/coptic/sahidic/books.json   (Sahidic only - for missing Bohairic books)
 * - src/coptic/canonical.json       (Combined: Bohairic + Sahidic fallbacks)
 */

const fs = require('node:fs')
const path = require('node:path')

const OUTPUT_BASE = path.join(__dirname, '../src/coptic')
const CACHE_DIR = path.join(__dirname, '../.cache/coptic-bible')

// Rate limiting
const DELAY_MS = 500

// Canonical book order
const BOOK_ORDER = [
	'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
	'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
	'1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
	'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms',
	'Proverbs', 'Ecclesiastes', 'Song of Solomon',
	'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
	'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah',
	'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai',
	'Zechariah', 'Malachi',
	'Matthew', 'Mark', 'Luke', 'John', 'Acts',
	'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
	'Ephesians', 'Philippians', 'Colossians',
	'1 Thessalonians', '2 Thessalonians',
	'1 Timothy', '2 Timothy', 'Titus', 'Philemon',
	'Hebrews', 'James', '1 Peter', '2 Peter',
	'1 John', '2 John', '3 John', 'Jude', 'Revelation'
]

// NT books - available in both Bohairic and Sahidic on copticchurch.net
const NT_BOOKS = [
	{ name: 'Matthew', chapters: 28 },
	{ name: 'Mark', chapters: 16 },
	{ name: 'Luke', chapters: 24 },
	{ name: 'John', chapters: 21 },
	{ name: 'Acts', chapters: 28 },
	{ name: 'Romans', chapters: 16 },
	{ name: '1 Corinthians', urlName: '1%20Corinthians', chapters: 16 },
	{ name: '2 Corinthians', urlName: '2%20Corinthians', chapters: 13 },
	{ name: 'Galatians', chapters: 6 },
	{ name: 'Ephesians', chapters: 6 },
	{ name: 'Philippians', chapters: 4 },
	{ name: 'Colossians', chapters: 4 },
	{ name: '1 Thessalonians', urlName: '1%20Thessalonians', chapters: 5 },
	{ name: '2 Thessalonians', urlName: '2%20Thessalonians', chapters: 3 },
	{ name: '1 Timothy', urlName: '1%20Timothy', chapters: 6 },
	{ name: '2 Timothy', urlName: '2%20Timothy', chapters: 4 },
	{ name: 'Titus', chapters: 3 },
	{ name: 'Philemon', chapters: 1 },
	{ name: 'Hebrews', chapters: 13 },
	{ name: 'James', chapters: 5 },
	{ name: '1 Peter', urlName: '1%20Peter', chapters: 5 },
	{ name: '2 Peter', urlName: '2%20Peter', chapters: 3 },
	{ name: '1 John', urlName: '1%20John', chapters: 5 },
	{ name: '2 John', urlName: '2%20John', chapters: 1 },
	{ name: '3 John', urlName: '3%20John', chapters: 1 },
	{ name: 'Jude', chapters: 1 },
	{ name: 'Revelation', chapters: 22 },
]

// OT books available in Bohairic on coptic.org
const OT_BOHAIRIC = [
	{ name: 'Genesis', url: 'GENESIS.HTM' },
	{ name: 'Exodus', url: 'EXODUS.htm' },
	{ name: 'Leviticus', url: 'Leviticus.htm' },
	{ name: 'Numbers', url: 'NUMBERS.htm' },
	{ name: 'Deuteronomy', url: 'Deutoronomy.htm' },
	// Joshua - Bohairic incomplete, use Sahidic
	// Judges - Bohairic incomplete, use Sahidic
	{ name: 'Ruth', url: 'ruths.htm' },
	{ name: 'Job', url: 'job.htm' },
	{ name: 'Psalms', url: 'psalms.htm' },
	{ name: 'Proverbs', url: 'proverbs.htm' },
	{ name: 'Ecclesiastes', url: 'ecclesiastes.htm' },
	{ name: 'Song of Solomon', url: 'songs.htm' },
	{ name: 'Isaiah', url: 'icaias.html' },
	{ name: 'Jeremiah', url: 'jeremias.html' },
	{ name: 'Lamentations', url: 'ethrinoi.html' },
	{ name: 'Ezekiel', url: '04iezeki3l.html' },
	{ name: 'Daniel', url: '05daniel.html' },
	{ name: 'Hosea', url: '1wci.html' },
	{ name: 'Joel', url: '2iwhl.html' },
	{ name: 'Amos', url: '3amwc.html' },
	{ name: 'Obadiah', url: '4obdiou.html' },
	{ name: 'Jonah', url: '5iwna.html' },
	{ name: 'Micah', url: '6mixeac.html' },
	{ name: 'Nahum', url: '7naoum.html' },
	{ name: 'Habakkuk', url: '8ambakoum.html' },
	{ name: 'Zephaniah', url: '9cofoniac.html' },
	{ name: 'Haggai', url: '10aggeos.html' },
	{ name: 'Zechariah', url: '11zaxariac.html' },
	{ name: 'Malachi', url: '12malaxiac.html' },
]

// OT books available in Sahidic on coptic.org (for fallback)
const OT_SAHIDIC = [
	{ name: 'Joshua', url: 'joshua.htm' },
	{ name: 'Judges', url: 'judges1.htm' },
	{ name: 'Lamentations', url: 'lamentationsahidic.htm' }, // Also available in Sahidic
]

// Utility functions
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

function ensureDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

function getCachePath(source, dialect, book, chapter) {
	return path.join(CACHE_DIR, source, dialect, `${book.replace(/\s/g, '_')}_${chapter}.html`)
}

async function fetchWithCache(url, cachePath) {
	ensureDir(path.dirname(cachePath))

	if (fs.existsSync(cachePath)) {
		console.log(`  [cache] ${path.basename(cachePath)}`)
		return fs.readFileSync(cachePath, 'utf8')
	}

	console.log(`  [fetch] ${url}`)
	await sleep(DELAY_MS)

	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${url}`)
	}

	const html = await response.text()
	fs.writeFileSync(cachePath, html)
	return html
}

// Convert HTML entities to actual Unicode characters
function decodeHtmlEntities(text) {
	return text
		.replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(parseInt(num, 10)))
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
}

// Parse copticchurch.net chapter page
function parseCopticChurchChapter(html) {
	const verses = []

	// Format: <small class='text-muted'>1</small> COPTIC TEXT
	// The verses are in a <p class='coptic'> block
	const copticBlockMatch = html.match(/<p class='coptic'>([\s\S]*?)<\/p>/i)
	if (!copticBlockMatch) {
		console.log('    No coptic block found')
		return verses
	}

	const content = copticBlockMatch[1]

	// Parse verses: <small class='text-muted'>NUM</small> TEXT
	const versePattern = /<small class='text-muted'>(\d+)<\/small>\s*([^<]+)/g
	let match
	while ((match = versePattern.exec(content)) !== null) {
		const num = parseInt(match[1], 10)
		const text = match[2].trim()
		if (text) {
			verses.push({ num, text })
		}
	}

	return verses
}

// Parse coptic.org OT page (continuous text, needs chapter/verse inference)
function parseCopticOrgBook(html) {
	const chapters = []

	// Decode HTML entities first
	let content = decodeHtmlEntities(html)

	// Remove HTML tags but preserve line breaks
	content = content
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<[^>]+>/g, '')

	// Split into lines and filter to only Coptic text
	const lines = content
		.split('\n')
		.map(l => l.trim())
		.filter(l => {
			// Keep lines that contain Coptic Unicode characters
			return /[ⲀⲂⲄⲆⲈⲊⲌⲎⲐⲒⲔⲖⲘⲚⲜⲞⲠⲢⲤⲦⲨⲪⲬⲮⲰϢϤϦϨϪϬϮⲀⲂⲄⲆⲈⲊⲌⲎⲐⲒⲔⲖⲘⲚⲜⲞⲠⲢⲤⲦⲨⲪⲬⲮⲰ]/.test(l) && l.length > 10
		})

	// For OT books without verse structure, treat each line as a verse
	// Group into chapters of ~30 verses each (rough approximation)
	const VERSES_PER_CHAPTER = 30

	for (let i = 0; i < lines.length; i += VERSES_PER_CHAPTER) {
		const chapterLines = lines.slice(i, i + VERSES_PER_CHAPTER)
		const verses = chapterLines.map((text, idx) => ({
			num: idx + 1,
			text
		}))

		if (verses.length > 0) {
			chapters.push({ num: chapters.length + 1, verses })
		}
	}

	return chapters
}

async function scrapeNT(dialect) {
	const code = dialect === 'bohairic' ? 'CPTB' : 'CPTS'
	console.log(`\n=== Scraping NT (${dialect}) from copticchurch.net ===\n`)
	const books = []

	for (const book of NT_BOOKS) {
		console.log(`\nProcessing ${book.name}...`)
		const chapters = []

		for (let ch = 1; ch <= book.chapters; ch++) {
			const urlName = book.urlName || book.name
			const url = `https://copticchurch.net/bible/coptic/${code}/${urlName}/${ch}?showVN=1`
			const cachePath = getCachePath('copticchurch', dialect, book.name, ch)

			try {
				const html = await fetchWithCache(url, cachePath)
				const verses = parseCopticChurchChapter(html)

				if (verses.length > 0) {
					chapters.push({ num: ch, verses })
					console.log(`    Chapter ${ch}: ${verses.length} verses`)
				} else {
					console.log(`    Chapter ${ch}: no verses found`)
				}
			} catch (err) {
				console.error(`    Chapter ${ch}: ERROR - ${err.message}`)
			}
		}

		if (chapters.length > 0) {
			books.push({ name: book.name, chapters })
		}
	}

	return books
}

async function scrapeOT(bookList, dialect) {
	console.log(`\n=== Scraping OT (${dialect}) from coptic.org ===\n`)
	const books = []

	for (const book of bookList) {
		console.log(`\nProcessing ${book.name}...`)
		const url = `http://www.coptic.org/language/bible/${book.url}`
		const cachePath = getCachePath('copticorg', dialect, book.name, 'full')

		try {
			const html = await fetchWithCache(url, cachePath)
			const chapters = parseCopticOrgBook(html)

			if (chapters.length > 0) {
				books.push({ name: book.name, chapters })
				console.log(`  Found ${chapters.length} chapters`)
			} else {
				console.log(`  No content found`)
			}
		} catch (err) {
			console.error(`  ERROR - ${err.message}`)
		}
	}

	return books
}

function sortBooks(books) {
	return books.sort((a, b) => {
		const aIdx = BOOK_ORDER.indexOf(a.name)
		const bIdx = BOOK_ORDER.indexOf(b.name)
		return aIdx - bIdx
	})
}

async function main() {
	console.log('='.repeat(60))
	console.log('Coptic Bible Scraper')
	console.log('='.repeat(60))

	ensureDir(CACHE_DIR)
	ensureDir(path.join(OUTPUT_BASE, 'bohairic'))
	ensureDir(path.join(OUTPUT_BASE, 'sahidic'))

	// === BOHAIRIC ===
	const bohairicOT = await scrapeOT(OT_BOHAIRIC, 'bohairic')
	const bohairicNT = await scrapeNT('bohairic')
	const bohairicBooks = sortBooks([...bohairicOT, ...bohairicNT])

	// Write Bohairic books.json
	const bohairicFile = path.join(OUTPUT_BASE, 'bohairic', 'books.json')
	fs.writeFileSync(bohairicFile, JSON.stringify({ books: bohairicBooks }, null, '\t'))
	console.log(`\nWritten: ${bohairicFile}`)

	// === SAHIDIC (only books missing from Bohairic) ===
	const sahidicOT = await scrapeOT(OT_SAHIDIC, 'sahidic')
	// We could also scrape Sahidic NT, but for now just the OT fallbacks
	const sahidicBooks = sortBooks(sahidicOT)

	// Write Sahidic books.json
	const sahidicFile = path.join(OUTPUT_BASE, 'sahidic', 'books.json')
	fs.writeFileSync(sahidicFile, JSON.stringify({ books: sahidicBooks }, null, '\t'))
	console.log(`Written: ${sahidicFile}`)

	// === CANONICAL (Combined) ===
	// Start with all Bohairic books, then add Sahidic fallbacks for missing ones
	const bohairicNames = new Set(bohairicBooks.map(b => b.name))
	const sahidicFallbacks = sahidicBooks.filter(b => !bohairicNames.has(b.name))

	const canonicalBooks = sortBooks([...bohairicBooks, ...sahidicFallbacks])

	// Track which dialect each book comes from
	const bookSources = {}
	for (const book of bohairicBooks) {
		bookSources[book.name] = 'bohairic'
	}
	for (const book of sahidicFallbacks) {
		bookSources[book.name] = 'sahidic'
	}

	const canonical = {
		description: 'Combined Coptic Bible: Bohairic primary, Sahidic fallback for missing books',
		books: canonicalBooks,
		sources: bookSources,
		missingBooks: BOOK_ORDER.filter(name => !canonicalBooks.find(b => b.name === name))
	}

	const canonicalFile = path.join(OUTPUT_BASE, 'canonical.json')
	fs.writeFileSync(canonicalFile, JSON.stringify(canonical, null, '\t'))
	console.log(`Written: ${canonicalFile}`)

	// === Summary ===
	console.log('\n' + '='.repeat(60))
	console.log('Summary:')
	console.log(`  Bohairic books: ${bohairicBooks.length}`)
	console.log(`  Sahidic books: ${sahidicBooks.length}`)
	console.log(`  Canonical (combined): ${canonicalBooks.length}`)
	console.log(`  - From Bohairic: ${bohairicBooks.length}`)
	console.log(`  - From Sahidic (fallback): ${sahidicFallbacks.length} (${sahidicFallbacks.map(b => b.name).join(', ') || 'none'})`)
	console.log(`  Still missing: ${canonical.missingBooks.join(', ') || 'None'}`)
	console.log('='.repeat(60))
}

main().catch(err => {
	console.error('Fatal error:', err)
	process.exit(1)
})
