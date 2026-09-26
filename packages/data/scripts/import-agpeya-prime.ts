/**
 * Imports Prime's prayers after the gospel, from the litanies through the
 * Conclusion of Every Hour, in English and Arabic. Run after the conclusions
 * importer, whose shared Kyrie, Holy Holy Holy and Conclusion Prime reuses.
 *
 *   npx tsx scripts/import-agpeya-prime.ts [--check]
 */
import { join } from 'node:path'
import type { AgpeyaLanguage } from '../src/agpeya/types'
import {
	expandOurFather,
	fetchPage,
	indexOf,
	readJson,
	stripAsciiCoptic,
	writeJson,
} from './agpeya-source'

const DATA_DIR = join(import.meta.dirname, '../src')

interface Part {
	id: string
	/** Shared prayers go to common.json; the rest are Prime's own */
	shared?: boolean
	kind: 'litany' | 'conclusion'
	title: Record<AgpeyaLanguage, string>
	/** Heading that opens the part on each page; the part runs to the next part's heading */
	start: Record<AgpeyaLanguage, RegExp>
}

const PARTS: Part[] = [
	{
		id: 'prime-litany',
		kind: 'litany',
		title: { en: 'Litanies', ar: 'القطع' },
		start: { en: /^Glory be to God forever\. Amen\.$/, ar: /^القطع$/ },
	},
	{
		id: 'gloria',
		shared: true,
		kind: 'conclusion',
		title: { en: 'The Gloria', ar: 'تسبحة الملائكة' },
		start: { en: /^THE GLORIA$/, ar: /^تسبحة الملائكة$/ },
	},
	{
		id: 'trisagion',
		shared: true,
		kind: 'conclusion',
		title: { en: 'The Trisagion', ar: 'الثلاث تقديسات' },
		start: { en: /^THE TRISAGION$/, ar: /^الثلاث تقديسات$/ },
	},
	{
		id: 'hail-to-you',
		shared: true,
		kind: 'conclusion',
		title: { en: 'Hail to Saint Mary', ar: 'السلام لك' },
		start: { en: /^HAIL TO SAINT MARY$/, ar: /^السلام لك$/ },
	},
	{
		id: 'creed-introduction',
		shared: true,
		kind: 'conclusion',
		title: { en: 'Introduction to the Creed', ar: 'بدء قانون الإيمان' },
		start: { en: /^INTRODUCTION TO THE CREED$/, ar: /^بدء قانون الإيمان$/ },
	},
	{
		id: 'creed',
		shared: true,
		kind: 'conclusion',
		title: { en: 'The Orthodox Creed', ar: 'قانون الإيمان المقدس الأرثوذكسي' },
		start: { en: /^THE ORTHODOX CREED$/, ar: /^قانون الإيمان المقدس الأرثوذكسي$/ },
	},
	{
		id: 'prime-absolution',
		kind: 'conclusion',
		title: { en: 'First Absolution', ar: 'التحليل' },
		start: { en: /^FIRST ABSOLUTION$/, ar: /^التحليل$/ },
	},
	{
		id: 'prime-second-absolution',
		kind: 'conclusion',
		title: { en: 'Second Absolution', ar: 'تحليل آخر' },
		start: { en: /^SECOND ABSOLUTION$/, ar: /^تحليل آخر$/ },
	},
]

// Where the creed ends and the shared Kyrie/Holy Holy Holy block begins, and where
// the second absolution ends
const CREED_END = { en: /^Then the worshipper prays:$|41 times$/i, ar: /41 مرة$/ }
const SECOND_ABSOLUTION_END = { en: /^CONCLUSION OF EVERY HOUR$/, ar: /^طلبة تصلى آخر كل ساعة$/ }

// Shared blocks the conclusions importer already wrote; Prime prays them in this order
const TAIL = ['kyrie41', 'holy-holy-holy'] as const
const CLOSING = 'conclusion-of-every-hour'
const REPLACED = ['prime-lords-prayer', 'prime-closing']

function extract(
	lines: string[],
	lang: AgpeyaLanguage,
	lordsPrayer: string,
): Map<string, string[]> {
	const expand = expandOurFather(lang, lordsPrayer)
	// Each heading is searched after the previous one; pages open with a contents list
	const starts: number[] = []
	for (const part of PARTS) {
		const from = starts.length ? (starts.at(-1) as number) + 1 : lines.length / 2
		starts.push(indexOf(lines, part.start[lang], from, part.id))
	}
	const ends = PARTS.map((part, i) => {
		if (part.id === 'creed') return indexOf(lines, CREED_END[lang], starts[i], 'creed end')
		if (part.id === 'prime-absolution') return starts[i + 1]
		if (part.id === 'prime-second-absolution')
			return indexOf(lines, SECOND_ABSOLUTION_END[lang], starts[i], 'second absolution end')
		return starts[i + 1]
	})
	const clean = (line: string) => (lang === 'ar' ? stripAsciiCoptic(line) : line)
	return new Map(
		PARTS.map((part, i) => [
			part.id,
			lines
				.slice(starts[i] + 1, ends[i])
				.map(clean)
				.flatMap(expand),
		]),
	)
}

async function importLanguage(lang: AgpeyaLanguage, check: boolean) {
	const commonPath = join(DATA_DIR, lang, 'agpeya', 'common.json')
	const primePath = join(DATA_DIR, lang, 'agpeya', 'prime.json')
	const common = readJson(commonPath)
	const prime = readJson(primePath)
	const lordsPrayer: string = common.sections['lords-prayer'].content.at(-1)
	for (const id of [...TAIL, CLOSING])
		if (!common.sections[id])
			throw new Error(`${lang}: run import-agpeya-conclusions first (${id})`)

	const content = extract(await fetchPage('01_Prime', lang), lang, lordsPrayer)
	const section = (part: Part) => ({
		id: part.id,
		kind: part.kind,
		title: part.title[lang],
		content: content.get(part.id),
	})

	if (check) {
		console.log(`\n══ ${lang} ══`)
		for (const [id, lines] of content)
			console.log(`${id}: ${lines.length} lines\n  ${lines.join('\n  ')}`)
		return
	}

	for (const part of PARTS.filter((p) => p.shared))
		common.sections[part.id] = { ...common.sections[part.id], ...section(part) }
	writeJson(commonPath, common)

	const own = PARTS.filter((p) => !p.shared)
	const ownIds = new Set([...own.map((p) => p.id), ...REPLACED])
	prime.sections = prime.sections
		.filter((s: { id: string }) => !ownIds.has(s.id))
		.concat(
			own.map((part) => ({
				...prime.sections.find((s: { id: string }) => s.id === part.id),
				...section(part),
			})),
		)

	const after = PARTS.map((p) => p.id)
	const gospel = prime.order.indexOf('prime-gospel')
	if (gospel === -1) throw new Error(`${lang}: prime has no gospel in its order`)
	prime.order = [
		...prime.order.slice(0, gospel + 1),
		...after.slice(0, 6),
		...TAIL,
		...after.slice(6),
		CLOSING,
	]
	writeJson(primePath, prime)
	console.log(`${lang}: wrote prime's prayers after the gospel`)
}

const check = process.argv.includes('--check')
for (const lang of ['en', 'ar'] as const) await importLanguage(lang, check)
