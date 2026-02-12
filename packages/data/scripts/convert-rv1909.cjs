#!/usr/bin/env node
/**
 * Convert RV1909 Bible data from aruljohn/Reina-Valera format to our format
 */

const fs = require('node:fs')
const path = require('node:path')

const SOURCE_DIR = '/tmp/rv1909'
const OUTPUT_FILE = path.join(__dirname, '../src/es/bible/books.json')

// Spanish to English book name mapping (for API consistency)
// Includes alternate spellings/accents found in the source data
const BOOK_NAME_MAP = {
	Génesis: 'Genesis',
	Éxodo: 'Exodus',
	Levítico: 'Leviticus',
	Números: 'Numbers',
	Deuteronomio: 'Deuteronomy',
	Josué: 'Joshua',
	Jueces: 'Judges',
	Rut: 'Ruth',
	'1 Samuel': '1 Samuel',
	'2 Samuel': '2 Samuel',
	'1 Reyes': '1 Kings',
	'2 Reyes': '2 Kings',
	'1 Crónicas': '1 Chronicles',
	'2 Crónicas': '2 Chronicles',
	Esdras: 'Ezra',
	Ésdras: 'Ezra',
	Nehemías: 'Nehemiah',
	Ester: 'Esther',
	Job: 'Job',
	Salmos: 'Psalms',
	Proverbios: 'Proverbs',
	Eclesiastés: 'Ecclesiastes',
	Eclesiástes: 'Ecclesiastes',
	'El Cantar de los Cantares': 'Song of Solomon',
	Cantares: 'Song of Solomon',
	Isaías: 'Isaiah',
	Jeremías: 'Jeremiah',
	Lamentaciones: 'Lamentations',
	Ezequiel: 'Ezekiel',
	Daniel: 'Daniel',
	Oseas: 'Hosea',
	Oséas: 'Hosea',
	Joel: 'Joel',
	Amós: 'Amos',
	Abdías: 'Obadiah',
	Jonás: 'Jonah',
	Miqueas: 'Micah',
	Miquéas: 'Micah',
	Nahúm: 'Nahum',
	Nahum: 'Nahum',
	Habacuc: 'Habakkuk',
	Sofonías: 'Zephaniah',
	Aggeo: 'Haggai',
	Zacarías: 'Zechariah',
	Malaquías: 'Malachi',
	'San Mateo': 'Matthew',
	'San Marcos': 'Mark',
	'San Márcos': 'Mark',
	'San Lucas': 'Luke',
	'San Lúcas': 'Luke',
	'San Juan': 'John',
	'Los Hechos': 'Acts',
	'Los Actos': 'Acts',
	Romanos: 'Romans',
	'1 Corintios': '1 Corinthians',
	'2 Corintios': '2 Corinthians',
	Gálatas: 'Galatians',
	Efesios: 'Ephesians',
	Filipenses: 'Philippians',
	Colosenses: 'Colossians',
	'1 Tesalonicenses': '1 Thessalonians',
	'2 Tesalonicenses': '2 Thessalonians',
	'1 Timoteo': '1 Timothy',
	'2 Timoteo': '2 Timothy',
	Tito: 'Titus',
	Filemón: 'Philemon',
	Hebreos: 'Hebrews',
	Santiago: 'James',
	'1 San Pedro': '1 Peter',
	'2 San Pedro': '2 Peter',
	'1 San Juan': '1 John',
	'2 San Juan': '2 John',
	'3 San Juan': '3 John',
	'San Judas': 'Jude',
	'San Júdas': 'Jude',
	Apocalipsis: 'Revelation',
	Revelación: 'Revelation',
}

// Canonical book order
const BOOK_ORDER = [
	'Genesis',
	'Exodus',
	'Leviticus',
	'Numbers',
	'Deuteronomy',
	'Joshua',
	'Judges',
	'Ruth',
	'1 Samuel',
	'2 Samuel',
	'1 Kings',
	'2 Kings',
	'1 Chronicles',
	'2 Chronicles',
	'Ezra',
	'Nehemiah',
	'Esther',
	'Job',
	'Psalms',
	'Proverbs',
	'Ecclesiastes',
	'Song of Solomon',
	'Isaiah',
	'Jeremiah',
	'Lamentations',
	'Ezekiel',
	'Daniel',
	'Hosea',
	'Joel',
	'Amos',
	'Obadiah',
	'Jonah',
	'Micah',
	'Nahum',
	'Habakkuk',
	'Zephaniah',
	'Haggai',
	'Zechariah',
	'Malachi',
	'Matthew',
	'Mark',
	'Luke',
	'John',
	'Acts',
	'Romans',
	'1 Corinthians',
	'2 Corinthians',
	'Galatians',
	'Ephesians',
	'Philippians',
	'Colossians',
	'1 Thessalonians',
	'2 Thessalonians',
	'1 Timothy',
	'2 Timothy',
	'Titus',
	'Philemon',
	'Hebrews',
	'James',
	'1 Peter',
	'2 Peter',
	'1 John',
	'2 John',
	'3 John',
	'Jude',
	'Revelation',
]

function convertBook(sourceData) {
	const englishName = BOOK_NAME_MAP[sourceData.book]
	if (!englishName) {
		console.warn(`Unknown book: ${sourceData.book}`)
		return null
	}

	return {
		name: englishName,
		chapters: sourceData.chapters.map((ch) => ({
			num: ch.chapter,
			verses: ch.verses.map((v) => ({
				num: v.verse,
				text: v.text,
			})),
		})),
	}
}

function main() {
	console.log('Converting RV1909 Bible data...')

	// Read all JSON files from source
	const files = fs.readdirSync(SOURCE_DIR).filter((f) => f.endsWith('.json'))
	console.log(`Found ${files.length} book files`)

	const books = []
	const unmapped = []

	for (const file of files) {
		const filePath = path.join(SOURCE_DIR, file)
		const content = fs.readFileSync(filePath, 'utf8')
		const sourceData = JSON.parse(content)

		const converted = convertBook(sourceData)
		if (converted) {
			books.push(converted)
		} else {
			unmapped.push(sourceData.book)
		}
	}

	// Sort books by canonical order
	books.sort((a, b) => {
		const aIdx = BOOK_ORDER.indexOf(a.name)
		const bIdx = BOOK_ORDER.indexOf(b.name)
		return aIdx - bIdx
	})

	console.log(`Converted ${books.length} books`)
	if (unmapped.length > 0) {
		console.warn('Unmapped books:', unmapped)
	}

	// Ensure output directory exists
	const outputDir = path.dirname(OUTPUT_FILE)
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true })
	}

	// Write output
	const output = { books }
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, '\t'))

	console.log(`Written to ${OUTPUT_FILE}`)

	// Stats
	let totalVerses = 0
	for (const book of books) {
		for (const ch of book.chapters) {
			totalVerses += ch.verses.length
		}
	}
	console.log(`Total verses: ${totalVerses}`)
}

main()
