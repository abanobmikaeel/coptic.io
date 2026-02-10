#!/usr/bin/env node
/**
 * Normalize Coptic text to lowercase while preserving diacritics
 *
 * Coptic Unicode block (U+2C80-U+2CFF):
 * - Uppercase and lowercase are INTERLEAVED (not separate ranges)
 * - Even codepoints = uppercase, Odd codepoints = lowercase
 * - To convert upper to lower: add 1
 */

const fs = require('node:fs')
const path = require('node:path')

const COPTIC_DIR = path.join(__dirname, '../src/coptic')

// Coptic letters exist in TWO Unicode blocks:
// 1. Coptic block: U+2C80 to U+2CFF (main block)
// 2. Greek and Coptic block: U+03E2 to U+03EF (legacy Coptic letters)
// Pattern: even = uppercase, odd = lowercase
function copticToLowerCase(text) {
	let result = ''
	for (const char of text) {
		const code = char.codePointAt(0)

		// Main Coptic block (U+2C80 to U+2CE4) - even = uppercase
		if (code >= 0x2C80 && code <= 0x2CE4 && code % 2 === 0) {
			result += String.fromCodePoint(code + 1)
		}
		// Greek block Coptic letters (U+03E2 to U+03EF) - even = uppercase
		// Ϣ/ϣ, Ϥ/ϥ, Ϧ/ϧ, Ϩ/ϩ, Ϫ/ϫ, Ϭ/ϭ, Ϯ/ϯ
		else if (code >= 0x03E2 && code <= 0x03EF && code % 2 === 0) {
			result += String.fromCodePoint(code + 1)
		}
		else {
			// Keep as-is (lowercase, diacritics, punctuation, symbols, etc.)
			result += char
		}
	}
	return result
}

function normalizeBook(book) {
	return {
		...book,
		chapters: book.chapters.map(chapter => ({
			...chapter,
			verses: chapter.verses.map(verse => ({
				...verse,
				text: copticToLowerCase(verse.text)
			}))
		}))
	}
}

function processFile(filePath, backupFirst = true) {
	console.log(`Processing: ${filePath}`)

	// Read backup if exists, otherwise original
	const backupPath = filePath + '.backup'
	let sourcePath = filePath

	if (backupFirst && !fs.existsSync(backupPath)) {
		// Create backup from original
		fs.copyFileSync(filePath, backupPath)
		console.log(`  Backup created: ${backupPath}`)
	} else if (fs.existsSync(backupPath)) {
		// Use backup as source to allow re-running
		sourcePath = backupPath
		console.log(`  Using backup as source`)
	}

	const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))

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
	fs.writeFileSync(filePath, JSON.stringify(output, null, '\t'))
	console.log(`  Written: ${normalizedBooks.length} books normalized`)
}

// Process all Coptic JSON files
const files = [
	path.join(COPTIC_DIR, 'bohairic', 'books.json'),
	path.join(COPTIC_DIR, 'sahidic', 'books.json'),
	path.join(COPTIC_DIR, 'canonical.json'),
]

console.log('Normalizing Coptic text to lowercase (preserving diacritics)...\n')

for (const file of files) {
	if (fs.existsSync(file)) {
		processFile(file)
		console.log()
	} else {
		console.log(`Skipping (not found): ${file}`)
	}
}

console.log('Done!')
