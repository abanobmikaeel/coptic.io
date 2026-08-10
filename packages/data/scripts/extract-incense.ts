/**
 * Incense (Raising of Incense) data extractor.
 *
 * Pulls the Vespers texts from tasbeha.org's hymn library, where each page lays the
 * three languages out as parallel rows: <div class='row'> with three textcolumn cells
 * (English / Coptic-Unicode / Arabic). Rows are parsed as aligned triples so the three
 * languages stay structurally identical — every non-rubric line in one language has a
 * counterpart in the other two. (The previous text-based extraction collapsed columns
 * independently, which shifted section boundaries and broke cross-language alignment.)
 *
 * Sections with conditional blocks (verses-of-cymbals) are hand-maintained and carried
 * over from the existing JSON. The Litany for the Nature is emitted as season-conditional
 * blocks (waters/plants/fruits) resolved by the API from the Coptic date.
 *
 * ⚠ Re-running REGENERATES every section's `content` in all three languages, including
 * English. Hand edits to content lines (e.g. translation improvements from the
 * tasbeha.org collaboration) are overwritten — review the git diff before committing,
 * and fold deliberate English changes into the source pages or a follow-up edit.
 * Section titles, rubrics, and conditional blocks are carried from the existing files.
 *
 * Usage:
 *   bun run scripts/extract-incense.ts [en|ar|cop ...]
 *
 * With no language arguments all translations are regenerated. Pass `cop` to
 * refresh only the Unicode Coptic data without rewriting English or Arabic.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const BASE = 'https://tasbeha.org/hymn_library/view'

type Lang = 'en' | 'ar' | 'cop'
type Speaker = 'Priest' | 'Deacon' | 'People'

interface ContentLine {
	speaker?: Speaker
	text: string
	isRubric?: boolean
}
type ContentItem = string | ContentLine

interface ConditionalBlock {
	when?: { season?: 'waters' | 'plants' | 'fruits' }
	title?: string
	content: ContentItem[]
}

const getText = (item: ContentItem): string => (typeof item === 'string' ? item : item.text)

const SPEAKER_LABELS: Record<Lang, Record<string, Speaker>> = {
	en: { Priest: 'Priest', Deacon: 'Deacon', People: 'People', Reader: 'Deacon' },
	ar: {
		الكاهن: 'Priest',
		الشماس: 'Deacon',
		الشعب: 'People',
		الشعبُ: 'People',
		القارئ: 'Deacon',
		القارﺉُ: 'Deacon',
	},
	cop: {
		Ⲡⲓⲟⲩⲏⲃ: 'Priest',
		Ⲡⲓⲇⲓⲁⲕⲱⲛ: 'Deacon',
		Ⲡⲓⲗⲁⲟⲥ: 'People',
		Ⲡⲓⲁ̀ⲛⲁⲅⲛⲱⲥⲧⲏⲥ: 'Deacon',
	},
}

interface Mapping {
	id: number
	sectionIds: string[]
}

// verses-of-cymbals and short-blessing are intentionally absent: their conditional blocks
// (cymbals' Adam/Watos/commemoration variants; short-blessing's Sunday Lord's-Day blessing)
// are hand-maintained in the JSON and carried over by writeOutput.
const MAPPINGS: Mapping[] = [
	{ id: 1833, sectionIds: ['thanksgiving'] },
	{ id: 1834, sectionIds: ['litany-departed'] },
	{ id: 1846, sectionIds: ['litany-sick'] },
	{ id: 1847, sectionIds: ['litany-travelers'] },
	{ id: 1848, sectionIds: ['litany-oblations'] },
	{ id: 1835, sectionIds: ['graciously-o-lord'] },
	{ id: 1836, sectionIds: ['trisagion'] },
	{ id: 1837, sectionIds: ['intro-to-creed'] },
	{ id: 1852, sectionIds: ['creed'] },
	{ id: 1840, sectionIds: ['o-god-have-mercy'] },
	{ id: 1842, sectionIds: ['litany-gospel'] },
	{ id: 2593, sectionIds: ['another-litany-gospel'] },
	{ id: 1843, sectionIds: ['gospel-response'] },
	{
		id: 1844,
		sectionIds: [
			'litany-peace',
			'litany-fathers',
			'litany-place',
			'litany-nature',
			'litany-assemblies',
		],
	},
	{ id: 1853, sectionIds: ['conclusion'] },
]

// ── Row-aligned HTML parsing ──────────────────────────────────────────────────

/** One parallel row of the source table; empty string means the cell is blank. */
interface Row {
	en: string
	cop: string
	ar: string
}

function decodeEntities(s: string): string {
	return s
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, ' ')
}

function cleanCell(html: string): string {
	const text = decodeEntities(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).trim()
	return text === '-' ? '' : text
}

const COLUMN_CLASS: Record<string, Lang> = {
	englishtext: 'en',
	coptictext_utf8: 'cop',
	arabictext: 'ar',
}

function parseRows(html: string): Row[] {
	const rows: Row[] = []
	for (const chunk of html.split(/<div class='row'>/).slice(1)) {
		const cells = [
			...chunk.matchAll(
				/<div class='col-xs-4 textcolumn (englishtext|coptictext_utf8|arabictext)'[^>]*>([\s\S]*?)<\/div>/g,
			),
		]
		if (cells.length !== 3) continue
		const row: Row = { en: '', cop: '', ar: '' }
		for (const [, cls, body] of cells) {
			const lang = COLUMN_CLASS[cls ?? '']
			if (lang) row[lang] = cleanCell(body ?? '')
		}
		// Skip Arabic-transliteration rows ("قبطي معرب") — phonetic aid, not a fourth language
		if (!row.en && !row.cop && /قبطي معرب|^[أا]/.test(row.ar) && rows.length > 0) continue
		if (row.en || row.cop || row.ar) rows.push(row)
	}
	return rows
}

// ── Row → content lines ───────────────────────────────────────────────────────

/** A row carrying staging directions rather than prayer text: present in English and
 * Arabic but absent from the Coptic column. (A row where only one language has text is
 * a column shift in the source — real content, handled by the pending-speaker carry.) */
const isRubricRow = (row: Row): boolean => !row.cop && Boolean(row.en) && Boolean(row.ar)

const speakerFor = (lang: Lang, line: string): Speaker | undefined => {
	const label = line.match(/^([^\n:]{1,25}):$/)?.[1]
	return label ? SPEAKER_LABELS[lang][label] : undefined
}

/** Parse one cell into content items. A cell is a sequence of lines: speaker labels
 * ("Priest:") start a new attributed turn, text before the first label is a staging
 * rubric ("The priest casts water on the congregation, saying,"), and a colon-ended
 * line before further text is an inline rubric ("In the presence of a bishop:").
 *
 * Some source pages mis-split a turn across rows, leaving a label-only cell ("Priest:")
 * with its text in the language's next non-empty cell — `pending` carries that speaker
 * forward so the shifted column still gets the right attribution.
 */
function cellToItems(
	cell: string,
	lang: Lang,
	rubric: boolean,
	pending: Speaker | undefined,
): { items: ContentItem[]; pending: Speaker | undefined } {
	if (!cell) return { items: [], pending }
	if (rubric) return { items: [{ text: cell.replace(/\n+/g, ' '), isRubric: true }], pending }

	const lines = cell
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean)

	// Group lines into segments, one per speaker label
	let current: { speaker?: Speaker; lines: string[] } = { lines: [] }
	const segments = [current]
	for (const line of lines) {
		const speaker = speakerFor(lang, line)
		if (speaker) {
			current = { speaker, lines: [] }
			segments.push(current)
		} else {
			current.lines.push(line)
		}
	}

	const items: ContentItem[] = []
	let nextPending = pending
	for (const [i, segment] of segments.entries()) {
		// Unlabeled text followed by a labeled segment is a staging direction
		if (i === 0 && segment.speaker === undefined && segments.length > 1) {
			if (segment.lines.length > 0) items.push({ text: segment.lines.join(' '), isRubric: true })
			continue
		}
		if (i === 0 && segment.lines.length === 0) continue

		const segLines = [...segment.lines]
		// Inline rubric prefix on its own line before the prayer text. The source separates
		// it with a newline and marks it either with a trailing colon ("In the presence of
		// a bishop:" / "وينهي:") or by wrapping the whole direction in parentheses ("(The
		// patron saint of the church is mentioned…)"). Without the paren case the English
		// direction would mash into the prayer line it precedes.
		const prefix = segLines[0]
		if (segLines.length > 1 && prefix && (/:$/.test(prefix) || /^\(.*\)$/.test(prefix))) {
			items.push({ text: prefix, isRubric: true })
			segLines.shift()
		}

		const text = segLines.join(' ').replace(/ {2,}/g, ' ').trim()
		if (!text) {
			// Label-only segment: the text comes in this language's next cell
			nextPending = segment.speaker ?? nextPending
			continue
		}
		const speaker = segment.speaker ?? nextPending
		items.push(speaker ? { speaker, text } : text)
		nextPending = undefined
	}

	return { items, pending: nextPending }
}

function rowsToSection(rows: Row[]): Record<Lang, ContentItem[]> {
	const out: Record<Lang, ContentItem[]> = { en: [], ar: [], cop: [] }
	const pending: Record<Lang, Speaker | undefined> = {
		en: undefined,
		ar: undefined,
		cop: undefined,
	}
	for (const row of rows) {
		const rubric = isRubricRow(row)
		for (const lang of ['en', 'ar', 'cop'] as Lang[]) {
			const result = cellToItems(row[lang], lang, rubric, pending[lang])
			out[lang].push(...result.items)
			pending[lang] = result.pending
		}
	}
	return out
}

// ── The five short litanies (one source page, boundary rows "- (N) …") ───────

const FIVE_LITANY_IDS = [
	'litany-peace',
	'litany-fathers',
	'litany-place',
	'litany-nature',
	'litany-assemblies',
]

const boundaryNumber = (row: Row): number | null => {
	const n = row.en.match(/^[-\s]*\(\s*([1-5])\s*\)/)?.[1]
	return n ? Number(n) : null
}

function splitFiveLitanies(rows: Row[]): Record<string, Row[]> {
	const out: Record<string, Row[]> = {}
	let current: Row[] | null = null
	for (const row of rows) {
		const id = FIVE_LITANY_IDS[(boundaryNumber(row) ?? 0) - 1]
		if (id) {
			current = []
			out[id] = current
			continue
		}
		// Rows before the first boundary are the shared opening dialogue (Pray. / Stand up
		// for prayer. …) which the service data renders once, not per litany.
		current?.push(row)
	}
	return out
}

// ── Litany for the Nature: season-conditional blocks ─────────────────────────

type NatureGroup = 'waters' | 'plants' | 'fruits' | 'combined' | 'continuation' | null

function classifyNatureRubric(row: Row): NatureGroup {
	const t = `${row.en} ${row.ar}`
	if (/Waters|المياه/.test(t)) return 'waters'
	if (/Plants|الزروع/.test(t)) return 'plants'
	if (/Fruits|الثمار/.test(t)) return 'fruits'
	if (/combined|معاً/.test(t)) return 'combined'
	if (/continues|يكمل/.test(t)) return 'continuation'
	return null
}

function natureBlocks(rows: Row[]): Record<Lang, ConditionalBlock[]> {
	const groups: Partial<Record<Exclude<NatureGroup, null>, Row[]>> = {}
	let current: NatureGroup = null
	for (const row of rows) {
		if (isRubricRow(row)) {
			const group = classifyNatureRubric(row)
			if (group) current = group
			continue
		}
		if (!current) continue
		const group = groups[current] ?? []
		group.push(row)
		groups[current] = group
	}

	// Per-language display titles, used when an out-of-season block is offered standalone
	const SEASON_TITLES: Record<'waters' | 'plants' | 'fruits', Record<Lang, string>> = {
		waters: { en: 'Litany of the Waters', ar: 'أوشية المياه', cop: 'Ⲡⲓⲧⲱⲃϩ ⲛ̀ⲧⲉ ⲛⲓⲙⲱⲟⲩ' },
		plants: { en: 'Litany of the Plants', ar: 'أوشية الزروع', cop: 'Ⲡⲓⲧⲱⲃϩ ⲛ̀ⲧⲉ ⲛⲓⲥⲓϯ' },
		fruits: { en: 'Litany of the Fruits', ar: 'أوشية الثمار', cop: 'Ⲡⲓⲧⲱⲃϩ ⲛ̀ⲧⲉ ⲛⲓⲕⲁⲣⲡⲟⲥ' },
	}

	const out: Record<Lang, ConditionalBlock[]> = { en: [], ar: [], cop: [] }
	for (const lang of ['en', 'ar', 'cop'] as Lang[]) {
		for (const season of ['waters', 'plants', 'fruits'] as const) {
			const section = rowsToSection(groups[season] ?? [])
			out[lang].push({
				when: { season },
				title: SEASON_TITLES[season][lang],
				content: section[lang],
			})
		}
		// The combined variant is dropped: the API resolves the season from the Coptic
		// date, so exactly one seasonal block applies on any given day.
		const continuation = rowsToSection(groups.continuation ?? [])
		out[lang].push({ content: continuation[lang] })
	}
	return out
}

// ── Post-processing ───────────────────────────────────────────────────────────

/** The source pages carry the Matins wording ("keep us this day"); Vespers is prayed at
 * sunset and asks to be kept through the night. */
const NIGHT_WORDING: Record<Lang, [string | RegExp, string]> = {
	en: [/keep (us )?this day without sin/, 'keep us this night without sin'],
	ar: [/في هَ?ذا اليَ?وْ?م/, 'في هَذِهِ اللَّيْلَةِ'],
	cop: ['ϧⲉⲛ ⲡⲁⲓⲉ̀ϩⲟⲟⲩ ⲫⲁⲓ', 'ϧⲉⲛ ⲡⲁⲓⲉ̀ϫⲱⲣϩ ⲫⲁⲓ'],
}

function applyNightWording(items: ContentItem[], lang: Lang): ContentItem[] {
	const [from, to] = NIGHT_WORDING[lang]
	return items.map((item) => {
		const text = getText(item).replace(from, to)
		return typeof item === 'string' ? text : { ...item, text }
	})
}

/** The Trisagion page ends with the lead-in to the Lord's Prayer, which the service
 * data renders as its own section. */
const TRISAGION_TRAILER: Record<Lang, RegExp> = {
	en: /Make us worthy to pray/,
	ar: /إجعلنا مستحقين|اجعلنا مستحقين/,
	cop: /Ⲁ̀ⲣⲓⲧⲉⲛ ⲛ̀ⲉⲙⲡ̀ϣⲁ|ⲁ̀ⲣⲓⲧⲉⲛ ⲛ̀ⲉⲙⲡ̀ϣⲁ/,
}

const LORD_PRAYER_MARKER: Record<Lang, string> = {
	en: 'Our Father who art',
	ar: 'أبانا الذي في السموات',
	cop: 'Ϫⲉ Ⲡⲉⲛⲓⲱⲧ',
}

// ── Fetch & assemble ──────────────────────────────────────────────────────────

async function fetchPage(id: number): Promise<string> {
	const url = `${BASE}/${id}`
	const controller = new AbortController()
	const timeout = setTimeout(() => controller.abort(), 15000)
	try {
		const res = await fetch(url, { signal: controller.signal })
		if (!res.ok) throw new Error(`HTTP ${res.status}`)
		return await res.text()
	} finally {
		clearTimeout(timeout)
	}
}

async function main() {
	const requested = process.argv.slice(2)
	const languages = (requested.length > 0 ? requested : ['en', 'ar', 'cop']) as Lang[]
	if (languages.some((lang) => !['en', 'ar', 'cop'].includes(lang))) {
		throw new Error('Unknown language. Expected one or more of: en, ar, cop')
	}
	const sections: Record<Lang, Record<string, ContentItem[]>> = { en: {}, ar: {}, cop: {} }
	const blockSections: Record<Lang, Record<string, ConditionalBlock[]>> = {
		en: {},
		ar: {},
		cop: {},
	}

	for (const mapping of MAPPINGS) {
		console.log(`Fetching ${mapping.sectionIds.join('/')} (${mapping.id})...`)
		const html = await fetchPage(mapping.id)
		const rows = parseRows(html)

		const soleId = mapping.sectionIds.length === 1 ? mapping.sectionIds[0] : undefined
		if (soleId) {
			const parsed = rowsToSection(rows)
			for (const lang of ['en', 'ar', 'cop'] as Lang[]) {
				sections[lang][soleId] = parsed[lang]
			}
			console.log(`  → ${rows.length} rows`)
		} else {
			const byLitany = splitFiveLitanies(rows)
			for (const [id, litanyRows] of Object.entries(byLitany)) {
				if (id === 'litany-nature') {
					const blocks = natureBlocks(litanyRows)
					for (const lang of ['en', 'ar', 'cop'] as Lang[]) {
						blockSections[lang][id] = blocks[lang]
					}
				} else {
					const parsed = rowsToSection(litanyRows)
					for (const lang of ['en', 'ar', 'cop'] as Lang[]) {
						sections[lang][id] = parsed[lang]
					}
				}
			}
			console.log(`  → ${rows.length} rows across ${Object.keys(byLitany).length} litanies`)
		}

		await new Promise((r) => setTimeout(r, 500))
	}

	for (const lang of ['en', 'ar', 'cop'] as Lang[]) {
		const s = sections[lang]

		const graciously = s['graciously-o-lord']
		if (graciously) s['graciously-o-lord'] = applyNightWording(graciously, lang)

		const trisagion = s.trisagion
		const trisagionLast = trisagion?.[trisagion.length - 1]
		if (trisagion && trisagionLast && TRISAGION_TRAILER[lang].test(getText(trisagionLast))) {
			trisagion.pop()
		}

		const lordPrayer =
			s.thanksgiving?.filter((b) => getText(b).includes(LORD_PRAYER_MARKER[lang])) ?? []
		if (lordPrayer.length > 0) {
			s['lord-prayer-post-trisagion'] = lordPrayer
			s['lord-prayer-pre-absolution'] = lordPrayer
		}
	}

	console.log('\nWriting output files...')
	for (const lang of languages) {
		writeOutput(lang, sections[lang], blockSections[lang])
	}
}

// ── Output ────────────────────────────────────────────────────────────────────

const TITLES: Record<string, { ar: string; cop: string }> = {
	thanksgiving: { ar: 'صلاة الشكر', cop: 'Ϯⲡ̀ⲣⲟⲥⲉⲩⲭⲏ ⲛ̀ⲧⲉ ⲡⲓϣⲉⲡϩ̀ⲙⲟⲧ' },
	'verses-of-cymbals': { ar: 'أرباع الناقوس', cop: 'Ⲛⲓⲣⲉϥϩⲱⲥ ⲛ̀ⲧⲉ ⲛⲓⲕⲩⲙⲃⲁⲗⲟⲛ' },
	'litany-departed': { ar: 'أوشية الراقدين', cop: 'Ⲡⲓⲧⲱⲃϩ ⲉ̀ϫⲉⲛ ⲛⲏⲉⲑⲙⲱⲟⲩⲧ' },
	'litany-sick': { ar: 'أوشية المرضى', cop: 'Ⲡⲓⲧⲱⲃϩ ⲉ̀ϫⲉⲛ ⲛⲏⲉⲧϣⲱⲛⲓ' },
	'litany-travelers': { ar: 'أوشية المسافرين', cop: 'Ⲡⲓⲧⲱⲃϩ ⲉ̀ϫⲉⲛ ⲡⲓⲙⲱⲓⲧ' },
	'litany-oblations': { ar: 'أوشية القرابين', cop: 'Ⲡⲓⲧⲱⲃϩ ⲉ̀ϫⲉⲛ ⲛⲓⲡ̀ⲣⲟⲥⲫⲟⲣⲁ' },
	'graciously-o-lord': { ar: 'تفضل يا رب', cop: 'Ⲁ̀ⲣⲓⲕⲁⲧⲁⲝⲓⲟⲓⲛ Ⲡ̀ϭⲟⲓⲥ' },
	trisagion: { ar: 'الثلاث تقديسات', cop: 'Ⲁ̀ⲅⲓⲟⲥ ⲟ̀ Ⲑⲉⲟⲥ' },
	'lord-prayer-post-trisagion': { ar: 'أبانا الذي', cop: 'Ϫⲉ Ⲡⲉⲛⲓⲱⲧ' },
	'intro-to-creed': { ar: 'بدء قانون الإيمان', cop: 'Ⲧⲉⲛϭⲓⲥⲓ ⲙ̀ⲙⲟ' },
	creed: { ar: 'قانون الإيمان الأرثوذكسي', cop: 'Ⲧⲉⲛⲛⲁϩϯ' },
	'o-god-have-mercy': { ar: 'اللهُمَّ إرحمنا', cop: 'Ϥ̀ⲛⲟⲩϯ ⲛⲁⲓ ⲛⲁⲛ' },
	'litany-gospel': { ar: 'أوشية الإنجيل', cop: 'Ⲡⲓⲧⲱⲃϩ ⲛ̀ⲧⲉ ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ' },
	'another-litany-gospel': { ar: 'أوشية إنجيل أخرى', cop: 'Ⲕⲉ ⲧⲱⲃϩ ⲛ̀ⲧⲉ ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ' },
	'daily-psalm': { ar: 'المزمور', cop: 'Ⲡⲓⲯⲁⲗⲙⲟⲥ' },
	gospel: { ar: 'الإنجيل', cop: 'Ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ' },
	'gospel-response': { ar: 'مرد الإنجيل', cop: 'Ⲡⲓⲟⲩⲱϣⲧ ⲛ̀ⲧⲉ ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ' },
	'litany-peace': { ar: 'أوشية السلام', cop: 'Ⲡⲓⲧⲱⲃϩ ⲛ̀ⲧⲉ ϯϩⲓⲣⲏⲛⲏ' },
	'litany-fathers': { ar: 'أوشية الآباء', cop: 'Ⲡⲓⲧⲱⲃϩ ⲛ̀ⲧⲉ ⲛⲓⲓⲟϯ' },
	'litany-place': { ar: 'أوشية الموضع', cop: 'Ⲡⲓⲧⲱⲃϩ ⲛ̀ⲧⲉ ⲡⲓⲧⲟⲡⲟⲥ' },
	'litany-nature': { ar: 'أوشية الطبيعة', cop: 'Ⲡⲓⲧⲱⲃϩ ⲛ̀ⲧⲉ ϯⲫⲩⲥⲓⲥ' },
	'litany-assemblies': { ar: 'أوشية الإجتماعات', cop: 'Ⲡⲓⲧⲱⲃϩ ⲛ̀ⲧⲉ ⲛⲓⲥⲩⲛⲁⲝⲓⲥ' },
	'lord-prayer-pre-absolution': { ar: 'أبانا الذي', cop: 'Ϫⲉ Ⲡⲉⲛⲓⲱⲧ' },
	conclusion: { ar: 'الختام', cop: 'Ⲡⲓϫⲱⲕ' },
	'short-blessing': { ar: 'البركة القصيرة', cop: 'Ⲡⲓⲥ̀ⲙⲟⲩ ⲉⲧⲕⲟⲩϫⲓ' },
}

// Localized section rubrics (staging notes). Coptic intentionally falls back to English:
// rubrics are directions, not chanted text, and have no liturgical-Coptic convention.
const RUBRICS: Record<string, { ar: string }> = {
	'litany-sick': { ar: 'من أواشي باكر، وتُقال اختيارياً في العشية.' },
	'litany-travelers': { ar: 'من أواشي باكر، وتُقال اختيارياً في العشية.' },
	'litany-oblations': { ar: 'من أواشي باكر، وتُقال اختيارياً في العشية.' },
}

const dataPath = (lang: Lang) =>
	join(import.meta.dirname, '..', 'packages', 'data', 'src', lang, 'incense', 'incense.json')

function writeOutput(
	lang: Lang,
	sections: Record<string, ContentItem[]>,
	blockSections: Record<string, ConditionalBlock[]>,
) {
	// The English file is the structural template (section order, ids, types, roles).
	const template = JSON.parse(readFileSync(dataPath('en'), 'utf-8')).evening
	// Hand-maintained conditional blocks (verses-of-cymbals) carry over per language.
	const existing = existsSync(dataPath(lang))
		? JSON.parse(readFileSync(dataPath(lang), 'utf-8')).evening
		: { sections: [] }

	const convert = (items: ContentItem[]) =>
		lang === 'cop'
			? items.map((item) =>
					typeof item === 'string'
						? item.normalize('NFC')
						: { ...item, text: item.text.normalize('NFC') },
				)
			: items
	const convertBlocks = (blocks: ConditionalBlock[]) =>
		blocks.map((b) => ({ ...b, content: convert(b.content) }))

	const outSections: unknown[] = []
	for (const section of template.sections) {
		const title = lang === 'en' ? section.title : (TITLES[section.id]?.[lang] ?? section.title)
		const rubric = lang === 'ar' ? (RUBRICS[section.id]?.ar ?? section.rubric) : section.rubric
		const base = {
			id: section.id,
			type: section.type,
			role: section.role,
			title,
			...(rubric ? { rubric } : {}),
			...(section.optional ? { optional: true } : {}),
		}

		const generatedBlocks = blockSections[section.id]
		if (section.type === 'daily-psalm' || section.type === 'gospel') {
			outSections.push(base)
		} else if (section.type === 'psalm') {
			outSections.push({ ...base, psalmRef: section.psalmRef })
		} else if (generatedBlocks) {
			outSections.push({ ...base, blocks: convertBlocks(generatedBlocks) })
		} else if (section.blocks) {
			const carried = existing.sections.find((s: { id: string }) => s.id === section.id)
			outSections.push({ ...base, blocks: carried?.blocks ?? section.blocks })
		} else {
			outSections.push({ ...base, content: convert(sections[section.id] ?? []) })
		}
	}

	const names: Record<Lang, { name: string; description: string }> = {
		en: { name: template.name, description: template.description },
		ar: { name: 'رفع بخور عشية', description: 'صلاة رفع بخور عشية تُصلى عند الغروب' },
		cop: {
			name: 'Ⲡⲧⲁⲗⲟ Ⲙⲡⲓⲥ̀ⲑⲟⲓⲛⲟⲩϥⲓ ⲛ̀ⲧⲉ Ϩⲁⲛⲁ̀ⲣⲟⲩϩⲓ',
			description: 'Ⲡⲧⲁⲗⲟ Ⲙⲡⲓⲥ̀ⲑⲟⲓⲛⲟⲩϥⲓ ⲛ̀ⲧⲉ Ϩⲁⲛⲁ̀ⲣⲟⲩϩⲓ',
		},
	}

	const outData = {
		evening: {
			id: 'evening',
			name: names[lang].name,
			...(names[lang].description ? { description: names[lang].description } : {}),
			sections: outSections,
		},
	}

	const outDir = join(import.meta.dirname, '..', 'packages', 'data', 'src', lang, 'incense')
	if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
	writeFileSync(dataPath(lang), `${JSON.stringify(outData, null, 2)}\n`, 'utf-8')

	const filled = outSections.filter(
		(s) =>
			(Array.isArray((s as { content?: unknown[] }).content) &&
				(s as { content: unknown[] }).content.length > 0) ||
			Array.isArray((s as { blocks?: unknown[] }).blocks),
	).length
	console.log(
		`  ${lang.toUpperCase()}: ${filled}/${outSections.length} sections with content → ${dataPath(lang)}`,
	)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
