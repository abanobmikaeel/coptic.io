#!/usr/bin/env node
/**
 * Convert Unicode Coptic text to ASCII for CS/Avva Shenouda fonts
 *
 * Traditional Coptic fonts like CS Avva Shenouda are ASCII-mapped:
 * they display Coptic glyphs when you type ASCII letters.
 *
 * This script converts our Unicode Coptic Bible data to ASCII format
 * so these beautiful traditional fonts can render them properly.
 */

const fs = require('node:fs')
const path = require('node:path')

// Unicode to ASCII mapping for CS Avva Shenouda style fonts
// Lowercase Unicode -> lowercase ASCII
const unicodeToAscii = {
	// Main Coptic block (lowercase)
	ⲁ: 'a', // Alpha
	ⲃ: 'b', // Beta/Vida
	ⲅ: 'g', // Gamma
	ⲇ: 'd', // Delta
	ⲉ: 'e', // Epsilon
	ⲍ: 'z', // Zeta
	ⲏ: 'y', // Eta
	ⲑ: ';', // Theta
	ⲓ: 'i', // Iota
	ⲕ: 'k', // Kapa
	ⲗ: 'l', // Lambda
	ⲙ: 'm', // Mi
	ⲛ: 'n', // Ni
	ⲝ: 'x', // Xi
	ⲟ: 'o', // Omicron
	ⲡ: 'p', // Pi
	ⲣ: 'r', // Ro
	ⲥ: 'c', // Sigma (lowercase)
	ⲧ: 't', // Tau
	ⲩ: 'u', // Upsilon
	ⲫ: 'v', // Phi
	ⲭ: ',', // Chi (using comma)
	ⲯ: 'q', // Psi (using q)
	ⲱ: 'w', // Omega

	// Main Coptic block (uppercase) - map to uppercase ASCII
	Ⲁ: 'A',
	Ⲃ: 'B',
	Ⲅ: 'G',
	Ⲇ: 'D',
	Ⲉ: 'E',
	Ⲍ: 'Z',
	Ⲏ: 'Y',
	Ⲑ: ':', // Theta uppercase (colon for semicolon uppercase)
	Ⲓ: 'I',
	Ⲕ: 'K',
	Ⲗ: 'L',
	Ⲙ: 'M',
	Ⲛ: 'N',
	Ⲝ: 'X',
	Ⲟ: 'O',
	Ⲡ: 'P',
	Ⲣ: 'R',
	Ⲥ: 'C',
	Ⲧ: 'T',
	Ⲩ: 'U',
	Ⲫ: 'V',
	Ⲭ: '<', // Chi uppercase
	Ⲯ: 'Q',
	Ⲱ: 'W',

	// Demotic/unique Coptic letters (Greek block U+03E2-U+03EF)
	ϣ: 's', // Shai (lowercase)
	Ϣ: 'S', // Shai (uppercase)
	ϥ: 'f', // Fi (lowercase)
	Ϥ: 'F', // Fi (uppercase)
	ϧ: '/', // Khai (lowercase) - using slash
	Ϧ: '?', // Khai (uppercase)
	ϩ: 'h', // Hori (lowercase)
	Ϩ: 'H', // Hori (uppercase)
	ϫ: 'j', // Janja (lowercase)
	Ϫ: 'J', // Janja (uppercase)
	ϭ: '[', // Chima (lowercase)
	Ϭ: '{', // Chima (uppercase)
	ϯ: ']', // Ti (lowercase)
	Ϯ: '}', // Ti (uppercase)

	// Additional Coptic letters
	ⲹ: '`', // Cryptogrammic Gangia
	ⲻ: '\\', // Cryptogrammic Ni

	// Combining marks - convert to = prefix or similar
	// '\u0300': '=',  // Combining grave -> supralinear stroke marker
	// '\u0304': '=',  // Combining macron -> supralinear stroke
}

// Combining diacritical marks to handle
const combiningMarks = {
	'\u0300': '`', // Combining grave accent
	'\u0301': "'", // Combining acute accent
	'\u0302': '^', // Combining circumflex
	'\u0304': '=', // Combining macron (supralinear stroke)
	'\u0305': '=', // Combining overline
	'\u0323': '_', // Combining dot below
}

function convertToAscii(text) {
	let result = ''
	for (const char of text) {
		if (unicodeToAscii[char]) {
			result += unicodeToAscii[char]
		} else if (combiningMarks[char]) {
			// For combining marks, we need special handling
			// In CS fonts, = before a letter adds supralinear stroke
			// For now, just skip diacritics as they may not render well in ASCII fonts
			// result += combiningMarks[char]
			// Skip diacritics - the font may have its own way of handling them
		} else {
			// Keep other characters (spaces, punctuation, numbers) as-is
			result += char
		}
	}
	return result
}

// Process the canonical.json file
const canonicalPath = path.join(__dirname, '../src/coptic/canonical.json')
const outputPath = path.join(__dirname, '../src/coptic/canonical-ascii.json')

console.log('Loading canonical.json...')
const data = JSON.parse(fs.readFileSync(canonicalPath, 'utf-8'))

console.log('Converting Unicode Coptic to ASCII...')
let convertedCount = 0

function processValue(value) {
	if (typeof value === 'string') {
		convertedCount++
		return convertToAscii(value)
	}
	if (Array.isArray(value)) {
		return value.map(processValue)
	}
	if (typeof value === 'object' && value !== null) {
		const result = {}
		for (const [key, val] of Object.entries(value)) {
			result[key] = processValue(val)
		}
		return result
	}
	return value
}

const converted = processValue(data)

console.log(`Converted ${convertedCount} strings`)
console.log('Writing canonical-ascii.json...')
fs.writeFileSync(outputPath, JSON.stringify(converted, null, 2))
console.log('Done!')

// Also show a sample conversion
console.log('\n--- Sample Conversion ---')
const sample = 'Ⲡ̀ⲣⲟⲥⲉⲩⲝⲁⲥⲑⲉ ⲩ̀ⲡⲉⲣ'
console.log('Unicode:', sample)
console.log('ASCII:  ', convertToAscii(sample))
