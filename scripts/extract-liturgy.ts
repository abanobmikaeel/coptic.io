/**
 * Divine Liturgy (St. Basil) data extractor.
 *
 * Pulls the liturgy texts from tasbeha.org's hymn library, where each page lays the
 * three languages out as parallel rows: <div class='row'> with three textcolumn cells
 * (English / Coptic-Unicode / Arabic). Rows are parsed as aligned triples so the three
 * languages stay structurally identical — every non-rubric line in one language has a
 * counterpart in the other two. (Same row-aligned approach as extract-incense.ts.)
 *
 * Structure of the emitted service:
 *   Liturgy of the Word      — thanksgiving, absolution to the son, the day's epistles
 *                              (Pauline/Catholic/Praxis, resolved from the Katameros at
 *                              runtime), Trisagion, litany of the Gospel, psalm & gospel.
 *   Liturgy of the Believers — reconciliation, Anaphora … Confession, post-communion
 *                              prayers (St. Basil).
 *
 * Post-processing:
 *   - The Trisagion page ends with the lead-in to the Lord's Prayer, trimmed here; the
 *     Lord's Prayer sections are derived from the Thanksgiving text (as in the incense
 *     extractor) — after the Trisagion and after the Fraction.
 *   - Page 2594 (The Three Absolutions) carries all three absolutions; only the
 *     Absolution to the Son belongs to the liturgy, so earlier lines are trimmed by
 *     marker. Its Coptic column is empty in the source — the section is English/Arabic
 *     only, and the reader renders no Coptic column for it. Do not invent Coptic text.
 *   - Unlike the incense extractor, no evening wording is applied: the liturgy is a
 *     daytime service and the source wording ("keep us this day") is correct.
 *
 * Coptic section titles fall back to English (titleLanguage: 'en') unless a verified
 * Coptic title already exists in the incense TITLES table — titles are navigation
 * labels, and invented Coptic labels would be unverifiable.
 *
 * Usage:
 *   bun run scripts/extract-liturgy.ts [en|ar|cop ...]
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
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
	/** Parse every row as content, never a staging rubric. For pages whose Coptic column
	 * is legitimately empty (the Three Absolutions), the en+ar/blank-cop heuristic would
	 * misclassify the prayer text itself as rubrics. */
	noRubrics?: boolean
}

const MAPPINGS: Mapping[] = [
	{ id: 1833, sectionIds: ['thanksgiving'] },
	{ id: 2594, sectionIds: ['absolution-to-the-son'], noRubrics: true },
	{ id: 1836, sectionIds: ['trisagion'] },
	{ id: 1842, sectionIds: ['litany-gospel'] },
	{ id: 1843, sectionIds: ['gospel-response'] },
	{ id: 1837, sectionIds: ['intro-to-creed'] },
	{ id: 1852, sectionIds: ['creed'] },
	{ id: 2035, sectionIds: ['reconciliation'] },
	{ id: 2038, sectionIds: ['anaphora'] },
	{ id: 2039, sectionIds: ['agios'] },
	{ id: 2040, sectionIds: ['was-incarnate'] },
	{ id: 2041, sectionIds: ['he-rose'] },
	{ id: 2042, sectionIds: ['institution'] },
	{ id: 2043, sectionIds: ['epiclesis'] },
	{ id: 2044, sectionIds: ['seven-litanies'] },
	{ id: 2045, sectionIds: ['commemoration-saints'] },
	{ id: 2046, sectionIds: ['diptych'] },
	{ id: 2047, sectionIds: ['those-o-lord'] },
	{ id: 2048, sectionIds: ['lead-us'] },
	{ id: 2051, sectionIds: ['intro-fraction'] },
	{ id: 2052, sectionIds: ['fraction'] },
	{ id: 2053, sectionIds: ['prayers-after-fraction'] },
	{ id: 2054, sectionIds: ['confession'] },
	{ id: 2596, sectionIds: ['prayers-before-distribution'] },
	{ id: 2597, sectionIds: ['thanksgiving-after-communion'] },
	{ id: 2598, sectionIds: ['prayer-of-submission'] },
]

// ── Section metadata (the script owns the English template; there is no prior file) ──

type SectionType = 'prayer' | 'litany' | 'creed' | 'gospel' | 'daily-psalm' | 'epistle'
type SectionRole = 'all' | 'priest' | 'deacon' | 'congregation'

interface SectionMeta {
	id: string
	type: SectionType
	role: SectionRole
	/** For epistle sections: which daily reading the API resolves. */
	reading?: 'pauline' | 'catholic' | 'praxis'
	title: string
	/** Arabic title — from the tasbeha.org listing or the standard liturgical name. */
	titleAr: string
	/** Verified Coptic title (reused from the incense TITLES table). Omit to fall back
	 * to the English title with titleLanguage: 'en'. */
	titleCop?: string
}

const SECTIONS: SectionMeta[] = [
	// ── Liturgy of the Word ──
	{
		id: 'thanksgiving',
		type: 'prayer',
		role: 'all',
		title: 'The Thanksgiving Prayer',
		titleAr: 'صلاة الشكر',
		titleCop: 'Ϯⲡ̀ⲣⲟⲥⲉⲩⲭⲏ ⲛ̀ⲧⲉ ⲡⲓϣⲉⲡϩ̀ⲙⲟⲧ',
	},
	{
		id: 'absolution-to-the-son',
		type: 'prayer',
		role: 'priest',
		title: 'The Absolution to the Son',
		titleAr: 'غفران الابن',
	},
	{
		id: 'pauline',
		type: 'epistle',
		role: 'deacon',
		reading: 'pauline',
		title: 'The Pauline Epistle',
		titleAr: 'البولس',
	},
	{
		id: 'catholic',
		type: 'epistle',
		role: 'deacon',
		reading: 'catholic',
		title: 'The Catholic Epistle',
		titleAr: 'الكاثوليكون',
	},
	{
		id: 'praxis',
		type: 'epistle',
		role: 'deacon',
		reading: 'praxis',
		title: 'The Praxis',
		titleAr: 'الإبركسيس',
	},
	{
		id: 'trisagion',
		type: 'prayer',
		role: 'congregation',
		title: 'The Trisagion',
		titleAr: 'الثلاث تقديسات',
		titleCop: 'Ⲁ̀ⲅⲓⲟⲥ ⲟ̀ Ⲑⲉⲟⲥ',
	},
	{
		id: 'lord-prayer-post-trisagion',
		type: 'prayer',
		role: 'congregation',
		title: 'Our Father',
		titleAr: 'أبانا الذي',
		titleCop: 'Ϫⲉ Ⲡⲉⲛⲓⲱⲧ',
	},
	{
		id: 'litany-gospel',
		type: 'litany',
		role: 'all',
		title: 'Litany for the Gospel',
		titleAr: 'أوشية الإنجيل',
		titleCop: 'Ⲡⲓⲧⲱⲃϩ ⲛ̀ⲧⲉ ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ',
	},
	{
		id: 'daily-psalm',
		type: 'daily-psalm',
		role: 'all',
		title: 'Psalm of the Gospel',
		titleAr: 'المزمور',
		titleCop: 'Ⲡⲓⲯⲁⲗⲙⲟⲥ',
	},
	{
		id: 'gospel',
		type: 'gospel',
		role: 'all',
		title: 'The Holy Gospel',
		titleAr: 'الإنجيل',
		titleCop: 'Ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ',
	},
	{
		id: 'gospel-response',
		type: 'prayer',
		role: 'congregation',
		title: 'Gospel Response',
		titleAr: 'مرد الإنجيل',
		titleCop: 'Ⲡⲓⲟⲩⲱϣⲧ ⲛ̀ⲧⲉ ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ',
	},
	{
		id: 'intro-to-creed',
		type: 'prayer',
		role: 'congregation',
		title: 'Introduction to the Creed',
		titleAr: 'بدء قانون الإيمان',
		titleCop: 'Ⲧⲉⲛϭⲓⲥⲓ ⲙ̀ⲙⲟ',
	},
	{
		id: 'creed',
		type: 'creed',
		role: 'congregation',
		title: 'The Orthodox Creed',
		titleAr: 'قانون الإيمان الأرثوذكسي',
		titleCop: 'Ⲧⲉⲛⲛⲁϩϯ',
	},
	// ── Liturgy of the Believers (St. Basil Anaphora) ──
	{
		id: 'reconciliation',
		type: 'prayer',
		role: 'priest',
		title: 'The Prayer of Reconciliation',
		titleAr: 'صلاة الصلح',
	},
	{
		id: 'anaphora',
		type: 'prayer',
		role: 'priest',
		title: 'The Anaphora',
		titleAr: 'الأنافورا',
	},
	{
		id: 'agios',
		type: 'prayer',
		role: 'priest',
		title: 'Agios, Agios, Agios',
		titleAr: 'أجيوس، أجيوس، أجيوس',
	},
	{
		id: 'was-incarnate',
		type: 'prayer',
		role: 'priest',
		title: 'Was Incarnate and Became Man',
		titleAr: 'تجسد وتأنس',
	},
	{
		id: 'he-rose',
		type: 'prayer',
		role: 'priest',
		title: 'He Rose from the Dead',
		titleAr: 'وقام من الأموات',
	},
	{
		id: 'institution',
		type: 'prayer',
		role: 'priest',
		title: 'The Institution Narrative',
		titleAr: 'الصلوات التأسيسية',
	},
	{
		id: 'epiclesis',
		type: 'prayer',
		role: 'priest',
		title: 'The Descent of the Holy Spirit',
		titleAr: 'نزول الروح القدس',
	},
	{
		id: 'seven-litanies',
		type: 'litany',
		role: 'priest',
		title: 'The Seven Short Litanies',
		titleAr: 'السبع أواشي الصغار',
	},
	{
		id: 'commemoration-saints',
		type: 'prayer',
		role: 'priest',
		title: 'The Commemoration of the Saints',
		titleAr: 'مجمع القديسين',
	},
	{
		id: 'diptych',
		type: 'prayer',
		role: 'priest',
		title: 'The Diptych',
		titleAr: 'ترحيم',
	},
	{
		id: 'those-o-lord',
		type: 'prayer',
		role: 'priest',
		title: 'Those, O Lord',
		titleAr: 'أولئك يا رب',
	},
	{
		id: 'lead-us',
		type: 'prayer',
		role: 'priest',
		title: 'Lead Us',
		titleAr: 'اهدنا',
	},
	{
		id: 'intro-fraction',
		type: 'prayer',
		role: 'priest',
		title: 'Introduction to the Fraction',
		titleAr: 'مقدمة القسمة',
	},
	{
		id: 'fraction',
		type: 'prayer',
		role: 'priest',
		title: 'The Fraction',
		titleAr: 'القسمة',
	},
	{
		id: 'lords-prayer',
		type: 'prayer',
		role: 'congregation',
		title: 'Our Father',
		titleAr: 'أبانا الذي في السموات',
		titleCop: 'Ϫⲉ Ⲡⲉⲛⲓⲱⲧ',
	},
	{
		id: 'prayers-after-fraction',
		type: 'prayer',
		role: 'priest',
		title: 'Prayers After the Fraction',
		titleAr: 'صلوات بعد القسمة',
	},
	{
		id: 'confession',
		type: 'prayer',
		role: 'all',
		title: 'The Confession',
		titleAr: 'الإعتراف',
	},
	{
		id: 'prayers-before-distribution',
		type: 'prayer',
		role: 'priest',
		title: 'Prayers Before the Distribution',
		titleAr: 'صلوات قبل التناول',
	},
	{
		id: 'thanksgiving-after-communion',
		type: 'prayer',
		role: 'priest',
		title: 'A Prayer of Thanksgiving',
		titleAr: 'صلاة شكر',
	},
	{
		id: 'prayer-of-submission',
		type: 'prayer',
		role: 'priest',
		title: 'The Prayer of Submission to the Father',
		titleAr: 'صلاة خضوع للآب',
	},
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
	// Labels may carry a parenthetical qualifier ("Priest (inaudibly):"); the base
	// label determines the speaker.
	const base = label?.replace(/\s*\(.*?\)\s*/g, '').trim()
	return base ? SPEAKER_LABELS[lang][base] : undefined
}

/** Parse one cell into content items. See extract-incense.ts for the full contract:
 * speaker labels start attributed turns, leading unlabeled text is a staging rubric,
 * a colon-ended or parenthesized line before prayer text is an inline rubric, and a
 * label-only cell carries its speaker forward to this language's next non-empty cell
 * (the source sometimes splits a turn across rows).
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
		if (i === 0 && segment.speaker === undefined && segments.length > 1) {
			if (segment.lines.length > 0) items.push({ text: segment.lines.join(' '), isRubric: true })
			continue
		}
		if (i === 0 && segment.lines.length === 0) continue

		const segLines = [...segment.lines]
		const prefix = segLines[0]
		if (segLines.length > 1 && prefix && (/:$/.test(prefix) || /^\(.*\)$/.test(prefix))) {
			items.push({ text: prefix, isRubric: true })
			segLines.shift()
		}

		const text = segLines.join(' ').replace(/ {2,}/g, ' ').trim()
		if (!text) {
			nextPending = segment.speaker ?? nextPending
			continue
		}
		const speaker = segment.speaker ?? nextPending
		items.push(speaker ? { speaker, text } : text)
		nextPending = undefined
	}

	return { items, pending: nextPending }
}

function rowsToSection(rows: Row[], noRubrics = false): Record<Lang, ContentItem[]> {
	const out: Record<Lang, ContentItem[]> = { en: [], ar: [], cop: [] }
	const pending: Record<Lang, Speaker | undefined> = {
		en: undefined,
		ar: undefined,
		cop: undefined,
	}
	for (const row of rows) {
		const rubric = !noRubrics && isRubricRow(row)
		for (const lang of ['en', 'ar', 'cop'] as Lang[]) {
			const result = cellToItems(row[lang], lang, rubric, pending[lang])
			out[lang].push(...result.items)
			pending[lang] = result.pending
		}
	}
	return out
}

// ── Post-processing ───────────────────────────────────────────────────────────

const getText = (item: ContentItem): string => (typeof item === 'string' ? item : item.text)

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

/** Page 2594 carries all three absolutions; the liturgy prays only the Absolution to
 * the Son, so everything before its opening line is dropped. */
const ABSOLUTION_START: Record<Lang, RegExp> = {
	en: /O Master, Lord Jesus Christ, the only-begotten/,
	ar: /أيها السيد الرب يسوع/,
	cop: /$^/, // no Coptic text in the source for this section
}

function trimToMarker(items: ContentItem[], marker: RegExp): ContentItem[] {
	const start = items.findIndex((item) => marker.test(getText(item)))
	return start < 0 ? [] : items.slice(start)
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

	for (const mapping of MAPPINGS) {
		const id = mapping.sectionIds[0] as string
		console.log(`Fetching ${id} (${mapping.id})...`)
		const html = await fetchPage(mapping.id)
		const rows = parseRows(html)
		const parsed = rowsToSection(rows, mapping.noRubrics)
		for (const lang of ['en', 'ar', 'cop'] as Lang[]) {
			sections[lang][id] = parsed[lang]
		}
		console.log(`  → ${rows.length} rows`)
		await new Promise((r) => setTimeout(r, 500))
	}

	for (const lang of ['en', 'ar', 'cop'] as Lang[]) {
		const s = sections[lang]

		const trisagion = s.trisagion
		const trisagionLast = trisagion?.[trisagion.length - 1]
		if (trisagion && trisagionLast && TRISAGION_TRAILER[lang].test(getText(trisagionLast))) {
			trisagion.pop()
		}

		const lordPrayer =
			s.thanksgiving?.filter((b) => getText(b).includes(LORD_PRAYER_MARKER[lang])) ?? []
		if (lordPrayer.length > 0) {
			s['lord-prayer-post-trisagion'] = lordPrayer
			s['lords-prayer'] = lordPrayer
		}

		if (s['absolution-to-the-son']) {
			s['absolution-to-the-son'] = trimToMarker(s['absolution-to-the-son'], ABSOLUTION_START[lang])
		}
	}

	console.log('\nWriting output files...')
	for (const lang of languages) {
		writeOutput(lang, sections[lang])
	}
}

// ── Output ────────────────────────────────────────────────────────────────────

const NAMES: Record<Lang, { name: string; description: string }> = {
	en: {
		name: 'The Divine Liturgy of St. Basil',
		description:
			'The Divine Liturgy of St. Basil — the Liturgy of the Word and the Liturgy of the Believers',
	},
	ar: {
		name: 'القداس الباسيلي',
		description: 'القداس الإلهي للقديس باسيليوس — قداس الكلمة وقداس المؤمنين',
	},
	cop: {
		name: 'The Divine Liturgy of St. Basil',
		description:
			'The Divine Liturgy of St. Basil — the Liturgy of the Word and the Liturgy of the Believers',
	},
}

const dataPath = (lang: Lang) =>
	join(import.meta.dirname, '..', 'packages', 'data', 'src', lang, 'liturgy', 'liturgy.json')

function writeOutput(lang: Lang, sections: Record<string, ContentItem[]>) {
	const convert = (items: ContentItem[]) =>
		lang === 'cop'
			? items.map((item) =>
					typeof item === 'string'
						? item.normalize('NFC')
						: { ...item, text: item.text.normalize('NFC') },
				)
			: items

	const outSections: unknown[] = []
	for (const meta of SECTIONS) {
		const titleCop = meta.titleCop
		const title =
			lang === 'en' ? meta.title : lang === 'ar' ? meta.titleAr : (titleCop ?? meta.title)
		const base: Record<string, unknown> = {
			id: meta.id,
			type: meta.type,
			role: meta.role,
			title,
			...(lang === 'cop' && !titleCop ? { titleLanguage: 'en' } : {}),
			...(meta.reading ? { reading: meta.reading } : {}),
		}

		if (meta.type === 'daily-psalm' || meta.type === 'gospel' || meta.type === 'epistle') {
			outSections.push(base) // scripture resolves from the Katameros at runtime
		} else {
			outSections.push({ ...base, content: convert(sections[meta.id] ?? []) })
		}
	}

	const outData = {
		basil: {
			id: 'basil',
			name: NAMES[lang].name,
			description: NAMES[lang].description,
			sections: outSections,
		},
	}

	const outDir = join(import.meta.dirname, '..', 'packages', 'data', 'src', lang, 'liturgy')
	if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
	writeFileSync(dataPath(lang), `${JSON.stringify(outData, null, 2)}\n`, 'utf-8')

	const filled = outSections.filter(
		(s) =>
			Array.isArray((s as { content?: unknown[] }).content) &&
			(s as { content: unknown[] }).content.length > 0,
	).length
	console.log(
		`  ${lang.toUpperCase()}: ${filled}/${outSections.length} sections with content → ${dataPath(lang)}`,
	)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
