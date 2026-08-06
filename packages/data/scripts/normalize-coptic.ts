/**
 * Normalize Coptic text to lowercase while preserving diacritics
 *
 * Coptic Unicode block (U+2C80-U+2CFF):
 * - Uppercase and lowercase are INTERLEAVED (not separate ranges)
 * - Even codepoints = uppercase, Odd codepoints = lowercase
 * - To convert upper to lower: add 1
 */

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const COPTIC_DIR = join(import.meta.dirname, '..', 'src', 'cop')

// biome-ignore lint/suspicious/noExplicitAny: verse/chapter/book shapes vary per Bible source file
type JsonRecord = Record<string, any>

// Coptic letters exist in TWO Unicode blocks:
// 1. Coptic block: U+2C80 to U+2CFF (main block)
// 2. Greek and Coptic block: U+03E2 to U+03EF (legacy Coptic letters)
// Pattern: even = uppercase, odd = lowercase
function copticToLowerCase(text: string): string {
	let result = ''
	for (const char of text) {
		const code = char.codePointAt(0) ?? 0

		// Main Coptic block (U+2C80 to U+2CE4) - even = uppercase
		if (code >= 0x2c80 && code <= 0x2ce4 && code % 2 === 0) {
			result += String.fromCodePoint(code + 1)
		}
		// Greek block Coptic letters (U+03E2 to U+03EF) - even = uppercase
		// Ϣ/ϣ, Ϥ/ϥ, Ϧ/ϧ, Ϩ/ϩ, Ϫ/ϫ, Ϭ/ϭ, Ϯ/ϯ
		else if (code >= 0x03e2 && code <= 0x03ef && code % 2 === 0) {
			result += String.fromCodePoint(code + 1)
		} else {
			// Keep as-is (lowercase, diacritics, punctuation, symbols, etc.)
			result += char
		}
	}
	return result
}

function normalizeBook(book: JsonRecord): JsonRecord {
	return {
		...book,
		chapters: book.chapters.map((chapter: JsonRecord) => ({
			...chapter,
			verses: chapter.verses.map((verse: JsonRecord) => ({
				...verse,
				text: copticToLowerCase(verse.text),
			})),
		})),
	}
}

function processFile(filePath: string, backupFirst = true): void {
	console.log(`Processing: ${filePath}`)

	// Read backup if exists, otherwise original
	const backupPath = `${filePath}.backup`
	let sourcePath = filePath

	if (backupFirst && !existsSync(backupPath)) {
		// Create backup from original
		copyFileSync(filePath, backupPath)
		console.log(`  Backup created: ${backupPath}`)
	} else if (existsSync(backupPath)) {
		// Use backup as source to allow re-running
		sourcePath = backupPath
		console.log('  Using backup as source')
	}

	const data: JsonRecord = JSON.parse(readFileSync(sourcePath, 'utf8'))

	// Normalize all books
	const normalizedBooks = data.books.map(normalizeBook)

	// Sample before/after
	const sampleBook = data.books[0]
	const sampleVerse = sampleBook?.chapters[0]?.verses[0]
	const normalizedSample = normalizedBooks[0]?.chapters[0]?.verses[0]

	if (sampleVerse) {
		console.log(`  Sample (${sampleBook.name} 1:1):`)
		console.log(`    Before: ${sampleVerse.text.substring(0, 60)}`)
		console.log(`    After:  ${normalizedSample.text.substring(0, 60)}`)
	}

	// Write back
	const output = { ...data, books: normalizedBooks }
	writeFileSync(filePath, JSON.stringify(output, null, '\t'))
	console.log(`  Written: ${normalizedBooks.length} books normalized`)
}

// Process all Coptic JSON files
const files = [
	join(COPTIC_DIR, 'bohairic', 'books.json'),
	join(COPTIC_DIR, 'sahidic', 'books.json'),
	join(COPTIC_DIR, 'canonical.json'),
]

console.log('Normalizing Coptic text to lowercase (preserving diacritics)...\n')

for (const file of files) {
	if (existsSync(file)) {
		processFile(file)
		console.log()
	} else {
		console.log(`Skipping (not found): ${file}`)
	}
}

console.log('Done!')
