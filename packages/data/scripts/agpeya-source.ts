/** Shared reading of the parallel English/Arabic Agpeya source pages. */
import { readFileSync, writeFileSync } from 'node:fs'
import type { AgpeyaLanguage } from '../src/agpeya/types'

// Arabic pages are windows-1256, at the English name plus a trailing underscore
const pageUrl = (page: string, lang: AgpeyaLanguage) =>
	`https://st-takla.org/Agpeya/Agbeya_${page}${lang === 'ar' ? '_' : ''}.html`

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', nbsp: ' ' }

function decodeEntities(text: string): string {
	return text
		.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
		.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
		.replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match)
}

// Pages sometimes open a <p> without closing the last, so opening tags split too
function paragraphs(html: string): string[] {
	return html
		.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
		.replace(/\s+/g, ' ')
		.split(/<\/p>|<p\b[^>]*>|<br\s*\/?>/i)
		.map((chunk) =>
			decodeEntities(chunk.replace(/<[^<>]*>/g, ''))
				.replace(/\s+/g, ' ')
				.trim(),
		)
		.filter(Boolean)
}

export async function fetchPage(page: string, lang: AgpeyaLanguage): Promise<string[]> {
	const res = await fetch(pageUrl(page, lang), { headers: { 'User-Agent': 'Mozilla/5.0' } })
	if (!res.ok) throw new Error(`${res.status} fetching ${pageUrl(page, lang)}`)
	const bytes = new Uint8Array(await res.arrayBuffer())
	return paragraphs(new TextDecoder(lang === 'ar' ? 'windows-1256' : 'utf-8').decode(bytes))
}

export function indexOf(lines: string[], pattern: RegExp, from: number, label: string): number {
	const i = lines.findIndex((line, n) => n >= from && pattern.test(line))
	if (i === -1) throw new Error(`Marker not found: ${label} (${pattern})`)
	return i
}

export const OUR_FATHER = { en: /Our Father Who art in heaven/i, ar: /أبانا الذي في السموات/ }

// Pages abbreviate the Lord's Prayer; pray it in full, keeping any preface on its line
export const expandOurFather =
	(lang: AgpeyaLanguage, lordsPrayer: string) =>
	(line: string): string[] => {
		const at = line.search(OUR_FATHER[lang])
		return at === -1 ? [line] : [line.slice(0, at).trim(), lordsPrayer].filter(Boolean)
	}

const KYRIE_PHRASE = { en: 'Lord have mercy.', ar: 'يا رب ارحم.' }

export const kyrieRows = (lang: AgpeyaLanguage) =>
	[10, 10, 10, 10, 1].map((n) => new Array(n).fill(KYRIE_PHRASE[lang]).join(' '))

export const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
export const writeJson = (path: string, value: unknown) =>
	writeFileSync(path, `${JSON.stringify(value, null, '\t')}\n`)

// Arabic pages inline Coptic responses in a legacy ASCII font encoding ("Doxa Patri
// ke Uiw ke `agiw `Pneumati"), which reads as gibberish in Unicode. The Arabic
// transliteration and translation beside it carry the same response, so drop it.
// Whitespace is trimmed in code rather than matched by the regex: letting the pattern
// start or end on spaces makes it backtrack. A lone letter is not a Coptic response.
const ASCII_COPTIC_RUN = /[A-Za-z`][A-Za-z`@.\s]*/g
export function stripAsciiCoptic(line: string): string {
	let kept = ''
	let from = 0
	for (const match of line.matchAll(ASCII_COPTIC_RUN)) {
		const run = match[0].trimEnd()
		if (run.length < 2) continue
		kept += line.slice(from, match.index).trimEnd()
		from = match.index + run.length
	}
	return `${kept}${line.slice(from)}`.replace(/\s{2,}/g, ' ').trim()
}
