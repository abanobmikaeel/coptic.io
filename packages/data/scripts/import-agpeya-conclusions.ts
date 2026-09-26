/**
 * Imports the concluding prayers of terce, sext, none and vespers (Kyrie, Holy Holy
 * Holy, the hour's Absolution, the Conclusion of Every Hour) in English and Arabic.
 *
 *   npx tsx scripts/import-agpeya-conclusions.ts [--check]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { AgpeyaLanguage } from '../src/agpeya/types'

const DATA_DIR = join(import.meta.dirname, '../src')
const HOURS = [
	{ id: 'terce', page: '03_Terce' },
	{ id: 'sext', page: '06_Sext' },
	{ id: 'none', page: '09_None' },
	{ id: 'vespers', page: '11_Vespers' },
] as const
type HourId = (typeof HOURS)[number]['id']

// Arabic pages are windows-1256, at the English name plus a trailing underscore
const pageUrl = (page: string, lang: AgpeyaLanguage) =>
	`https://st-takla.org/Agpeya/Agbeya_${page}${lang === 'ar' ? '_' : ''}.html`

const MARKERS = {
	en: {
		kyrie: /41 times$/i,
		holy: /^HOLY HOLY HOLY$/,
		ourFather: /Our Father Who art in heaven/,
		absolution: /^ABSOLUTION$/,
		conclusion: /^THE CONCLUSION OF EVERY HOUR$/,
		end: /for you are blessed forever\. amen\.$/i,
	},
	ar: {
		kyrie: /41 مرة$/,
		holy: /^قدوس قدوس قدوس$/,
		ourFather: /أبانا الذي في السموات/,
		absolution: /^التحليل$/,
		conclusion: /^طلبة تصلى آخر كل ساعة$/,
		end: /أبانا الذي في السموات/,
	},
} satisfies Record<AgpeyaLanguage, Record<string, RegExp>>

const TITLES = {
	en: {
		kyrie: 'Lord Have Mercy (41 times)',
		holy: 'Holy, Holy, Holy',
		absolution: 'Absolution',
		conclusion: 'Conclusion of Every Hour',
	},
	ar: {
		kyrie: 'كيرياليسون (41 مرة)',
		holy: 'قدوس قدوس قدوس',
		absolution: 'التحليل',
		conclusion: 'طلبة تصلى آخر كل ساعة',
	},
} satisfies Record<AgpeyaLanguage, Record<string, string>>

const KYRIE_PHRASE = { en: 'Lord have mercy.', ar: 'يا رب ارحم.' }

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

async function fetchPage(page: string, lang: AgpeyaLanguage): Promise<string[]> {
	const res = await fetch(pageUrl(page, lang), { headers: { 'User-Agent': 'Mozilla/5.0' } })
	if (!res.ok) throw new Error(`${res.status} fetching ${pageUrl(page, lang)}`)
	const bytes = new Uint8Array(await res.arrayBuffer())
	return paragraphs(new TextDecoder(lang === 'ar' ? 'windows-1256' : 'utf-8').decode(bytes))
}

function indexOf(lines: string[], pattern: RegExp, from: number, label: string): number {
	const i = lines.findIndex((line, n) => n >= from && pattern.test(line))
	if (i === -1) throw new Error(`Marker not found: ${label} (${pattern})`)
	return i
}

interface Conclusion {
	holy: string[]
	absolution: string[]
	conclusion: string[]
}

function extract(lines: string[], lang: AgpeyaLanguage, lordsPrayer: string): Conclusion {
	const m = MARKERS[lang]
	const kyrie = indexOf(lines, m.kyrie, 0, 'kyrie')
	const holy = indexOf(lines, m.holy, kyrie, 'holy')
	const ourFather = indexOf(lines, m.ourFather, holy, 'our father')
	const absolution = indexOf(lines, m.absolution, ourFather, 'absolution')
	const conclusion = indexOf(lines, m.conclusion, absolution, 'conclusion')
	const end = indexOf(lines, m.end, conclusion + 1, 'end')

	// Pages abbreviate the Lord's Prayer; pray it in full
	const expandOurFather = (line: string): string[] => {
		const at = line.search(m.ourFather)
		return at === -1 ? [line] : [line.slice(0, at).trim(), lordsPrayer].filter(Boolean)
	}
	return {
		holy: [...lines.slice(holy + 1, ourFather), ...expandOurFather(lines[ourFather])],
		absolution: lines.slice(absolution + 1, conclusion),
		conclusion: lines.slice(conclusion + 1, end + 1).flatMap(expandOurFather),
	}
}

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const writeJson = (path: string, value: unknown) =>
	writeFileSync(path, `${JSON.stringify(value, null, '\t')}\n`)

const kyrieRows = (lang: AgpeyaLanguage) =>
	[10, 10, 10, 10, 1].map((n) => new Array(n).fill(KYRIE_PHRASE[lang]).join(' '))

async function importLanguage(lang: AgpeyaLanguage, check: boolean) {
	const commonPath = join(DATA_DIR, lang, 'agpeya', 'common.json')
	const common = readJson(commonPath)
	const lordsPrayer: string = common.sections['lords-prayer'].content.at(-1)

	const extracted = new Map<HourId, Conclusion>()
	for (const hour of HOURS)
		extracted.set(hour.id, extract(await fetchPage(hour.page, lang), lang, lordsPrayer))

	// Shared by every hour; pages differ only in paragraph breaks, so keep the finest
	const sharedPart = (part: 'holy' | 'conclusion'): string[] => {
		const copies = [...extracted.values()].map((c) => c[part])
		const text = (lines: string[]) => lines.join(' ').replace(/\s+/g, ' ')
		if (new Set(copies.map(text)).size > 1)
			throw new Error(`${lang}: "${part}" differs between hours; expected it shared`)
		return copies.reduce<string[]>((a, b) => (b.length > a.length ? b : a), [])
	}

	const t = TITLES[lang]
	const shared = {
		kyrie41: {
			id: 'kyrie41',
			kind: 'conclusion',
			title: t.kyrie,
			content: kyrieRows(lang),
			inline: true,
		},
		'holy-holy-holy': {
			id: 'holy-holy-holy',
			kind: 'conclusion',
			title: t.holy,
			content: sharedPart('holy'),
		},
		'conclusion-of-every-hour': {
			id: 'conclusion-of-every-hour',
			kind: 'conclusion',
			title: t.conclusion,
			content: sharedPart('conclusion'),
		},
	}

	if (check) {
		console.log(`\n══ ${lang} ══`)
		for (const s of Object.values(shared))
			console.log(`${s.id}: ${s.content.length} lines\n  ${s.content.join('\n  ')}`)
		for (const [id, c] of extracted)
			console.log(`${id}-absolution: ${c.absolution.length} lines\n  ${c.absolution.join('\n  ')}`)
		return
	}

	for (const [id, section] of Object.entries(shared))
		common.sections[id] = { ...common.sections[id], ...section }
	writeJson(commonPath, common)

	for (const hour of HOURS) {
		const path = join(DATA_DIR, lang, 'agpeya', `${hour.id}.json`)
		const file = readJson(path)
		const closingId = `${hour.id}-closing`
		const absolutionId = `${hour.id}-absolution`
		const absolution = {
			id: absolutionId,
			kind: 'conclusion',
			title: t.absolution,
			content: extracted.get(hour.id)?.absolution,
		}
		file.sections = file.sections
			.filter((s: { id: string }) => s.id !== closingId && s.id !== absolutionId)
			.concat(absolution)
		const tail = ['kyrie41', 'holy-holy-holy', absolutionId, 'conclusion-of-every-hour']
		file.order = file.order
			.filter((id: unknown) => id !== closingId && !tail.includes(id as string))
			.concat(tail)
		writeJson(path, file)
	}
	console.log(`${lang}: wrote the concluding sequence for ${HOURS.map((h) => h.id).join(', ')}`)
}

const check = process.argv.includes('--check')
for (const lang of ['en', 'ar'] as const) await importLanguage(lang, check)
