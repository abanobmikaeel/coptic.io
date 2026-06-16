/**
 * CS Avva Shenouda converter
 *
 * Converts Unicode Coptic + Greek characters to the ASCII encoding expected by
 * the CS Avva Shenouda font, so liturgical text renders with the traditional
 * calligraphic Coptic style. The Coptic Bible data already uses this encoding;
 * we apply it to incense/liturgy data extracted from Unicode sources.
 *
 * Usage:
 *   bun run scripts/convert-coptic.ts  [path/to/coptic.json ...]
 *
 * If file paths are given, the JSON is converted in place.
 * If no arguments, it converts packages/data/src/cop/incense/incense.json.
 */

import { readFileSync, writeFileSync } from 'node:fs'

// Unicode → CS Avva Shenouda ASCII mapping
export const AVVA_MAP: Record<string, string> = {
	// Coptic lowercase (U+2C80 block)
	ⲁ: 'a',
	ⲃ: 'b',
	ⲅ: 'g',
	ⲇ: 'd',
	ⲉ: 'e',
	ⲍ: 'z',
	ⲏ: 'y',
	ⲑ: ';',
	ⲓ: 'i',
	ⲕ: 'k',
	ⲗ: 'l',
	ⲙ: 'm',
	ⲛ: 'n',
	ⲝ: 'x',
	ⲟ: 'o',
	ⲡ: 'p',
	ⲣ: 'r',
	ⲥ: 'c',
	ⲧ: 't',
	ⲩ: 'u',
	ⲫ: 'v',
	ⲭ: ',',
	ⲯ: 'q',
	ⲱ: 'w',
	// Coptic-specific letters
	ϣ: 's',
	ϥ: 'f',
	ϧ: '/',
	ϩ: 'h',
	ϫ: 'j',
	ϭ: '[',
	ϯ: ']',
	// Coptic uppercase (same ASCII value — Coptic doesn't distinguish case)
	Ⲁ: 'a',
	Ⲃ: 'b',
	Ⲅ: 'g',
	Ⲇ: 'd',
	Ⲉ: 'e',
	Ⲍ: 'z',
	Ⲏ: 'y',
	Ⲑ: ';',
	Ⲓ: 'i',
	Ⲕ: 'k',
	Ⲗ: 'l',
	Ⲙ: 'm',
	Ⲛ: 'n',
	Ⲝ: 'x',
	Ⲟ: 'o',
	Ⲡ: 'p',
	Ⲣ: 'r',
	Ⲥ: 'c',
	Ⲧ: 't',
	Ⲩ: 'u',
	Ⲫ: 'v',
	Ⲭ: ',',
	Ⲯ: 'q',
	Ⲱ: 'w',
	Ϣ: 's',
	Ϥ: 'f',
	Ϧ: '/',
	Ϩ: 'h',
	Ϫ: 'j',
	Ϭ: '[',
	Ϯ: ']',
	// Greek letters used in Coptic liturgy (map to Coptic ASCII equivalents)
	Α: 'a',
	Β: 'b',
	Γ: 'g',
	Δ: 'd',
	Ε: 'e',
	Ζ: 'z',
	Η: 'y',
	Θ: ';',
	Ι: 'i',
	Κ: 'k',
	Λ: 'l',
	Μ: 'm',
	Ν: 'n',
	Ξ: 'x',
	Ο: 'o',
	Π: 'p',
	Ρ: 'r',
	Σ: 'c',
	Τ: 't',
	Υ: 'u',
	Φ: 'v',
	Χ: ',',
	Ψ: 'q',
	Ω: 'w',
	α: 'a',
	β: 'b',
	γ: 'g',
	δ: 'd',
	ε: 'e',
	ζ: 'z',
	η: 'y',
	θ: ';',
	ι: 'i',
	κ: 'k',
	λ: 'l',
	μ: 'm',
	ν: 'n',
	ξ: 'x',
	ο: 'o',
	π: 'p',
	ρ: 'r',
	σ: 'c',
	ς: 'c',
	τ: 't',
	υ: 'u',
	φ: 'v',
	χ: ',',
	ψ: 'q',
	ω: 'w',
	ϲ: 'c',
	Ϲ: 'c',
}

export function toAvvaShenouda(text: string): string {
	let out = ''
	for (const ch of text) {
		const cp = ch.codePointAt(0) ?? 0
		// Drop combining marks the font can't render (they show as tofu): diacriticals
		// (U+0300–U+036F, U+0483–U+0489) and the conjoining macron overlines used on
		// abbreviated sacred names like Ⲡⲟ̅ⲥ̅ / Ⲓⲏ̅ⲥ̅ (U+FE20–U+FE2F).
		if (
			(cp >= 0x0300 && cp <= 0x036f) ||
			(cp >= 0x0483 && cp <= 0x0489) ||
			(cp >= 0xfe20 && cp <= 0xfe2f)
		)
			continue
		// CS Avva Shenouda renders ':' as a capital theta. Liturgical phrase colons are
		// dropped — spaces already separate the phrases (matching the Coptic Bible data).
		if (ch === ':') continue
		if (ch in AVVA_MAP) {
			out += AVVA_MAP[ch]
			continue
		}
		// Latin letters with diacritics (ò, ó, etc.) → strip to base letter
		if (cp > 127 && cp < 0x0250) {
			out += ch.normalize('NFD')[0]
			continue
		}
		out += ch
	}
	return out.replace(/ {2,}/g, ' ').trim()
}

type ContentItem = string | { speaker?: string; text: string; isRubric?: boolean }

export function convertCopticItem(item: ContentItem): ContentItem {
	if (typeof item === 'string') return toAvvaShenouda(item)
	return { ...item, text: toAvvaShenouda(item.text) }
}

// ── CLI usage ─────────────────────────────────────────────────────────────────

function convertFile(path: string) {
	const data = JSON.parse(readFileSync(path, 'utf-8'))
	let changed = 0

	const convertList = (list: ContentItem[]): ContentItem[] | null => {
		const converted = list.map(convertCopticItem)
		return JSON.stringify(converted) !== JSON.stringify(list) ? converted : null
	}

	for (const section of data.evening?.sections ?? []) {
		if (Array.isArray(section.content)) {
			const converted = convertList(section.content)
			if (converted) {
				section.content = converted
				changed++
			}
		}
		// Conditional sections store their text inside blocks[].content
		if (Array.isArray(section.blocks)) {
			for (const block of section.blocks) {
				if (!Array.isArray(block.content)) continue
				const converted = convertList(block.content)
				if (converted) {
					block.content = converted
					changed++
				}
			}
		}
	}

	writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf-8')
	console.log(`Converted ${changed} sections → ${path}`)
}

const paths =
	process.argv.slice(2).length > 0
		? process.argv.slice(2)
		: ['packages/data/src/cop/incense/incense.json']

for (const p of paths) convertFile(p)
