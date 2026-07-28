import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type {
	TasbehaLanguage,
	TasbehaSection,
	TasbehaSectionKind,
	TasbehaServiceData,
} from '../src/tasbeha/types'

const BASE_URL = 'https://tasbeha.org/hymn_library/view'
const ACCESSED_AT = new Date().toISOString().slice(0, 10)

interface SectionDefinition {
	id: string
	pageId: number
	kind: TasbehaSectionKind
	title: Record<'en' | 'ar', string>
	corroboratingUrls?: string[]
	availability?: TasbehaSection['availability']
	stop?: string
	segments?: Array<{
		id: string
		start?: string
		end?: string
		title: Record<'en' | 'ar', string>
	}>
}

// Order follows Tasbeha.org's annual Midnight Praises (Sunday) category. Pages
// which combine several numbered Theotokia parts are split at their published
// English headings so the generated data follows the rite rather than page
// boundaries. Seasonal entries and tune-only variants are intentionally not
// mixed into this annual Sunday/Adam service.
const SECTION_DEFINITIONS: SectionDefinition[] = [
	{ id: 'ten-theno', pageId: 92, kind: 'opening', title: { en: 'Ten-theno', ar: 'تين ثينو' } },
	{
		id: 'first-hoos',
		pageId: 103,
		kind: 'canticle',
		title: { en: 'The First Hoos', ar: 'الهوس الأول' },
		corroboratingUrls: [
			'https://st-takla.org/Lyrics-Spiritual-Songs/Words-of-Coptic-Alhan-Tasbeha-Kodas/Arabic-Coptic-04-Epsalmodia-Tasbeha/Tasbe7a-Coptic-Transliteration-Annual-Psalmody/Praise-Epsalmodya-Tasbeha-004-Hoos-1.html',
		],
	},
	{
		id: 'first-hoos-lobsh',
		pageId: 105,
		kind: 'lobsh',
		title: { en: 'The First Hoos Lobsh', ar: 'لبش الهوس الأول' },
		corroboratingUrls: [
			'https://st-takla.org/Lyrics-Spiritual-Songs/Words-of-Coptic-Alhan-Tasbeha-Kodas/Arabic-Coptic-04-Epsalmodia-Tasbeha/Tasbe7a-Coptic-Transliteration-Annual-Psalmody/Praise-Epsalmodya-Tasbeha-005-Lobsh-First-Canticle.html',
		],
	},
	{
		id: 'second-hoos',
		pageId: 106,
		kind: 'canticle',
		title: { en: 'The Second Hoos', ar: 'الهوس الثاني' },
	},
	{
		id: 'second-hoos-lobsh',
		pageId: 182,
		kind: 'lobsh',
		title: { en: 'The Second Hoos Lobsh', ar: 'لبش الهوس الثاني' },
	},
	{
		id: 'third-hoos',
		pageId: 108,
		kind: 'canticle',
		title: { en: 'The Third Hoos', ar: 'الهوس الثالث' },
	},
	{
		id: 'third-hoos-esmo-epchois',
		pageId: 453,
		kind: 'canticle',
		title: { en: 'The Third Hoos — Esmo Epchois', ar: 'الهوس الثالث — إسمو إبشويس' },
	},
	{
		id: 'three-children-greek-psali',
		pageId: 109,
		kind: 'psali',
		title: { en: 'Psali for the Three Saintly Children', ar: 'إبصالية للثلاثة فتية القديسين' },
	},
	{
		id: 'ten-oueh-ensok',
		pageId: 110,
		kind: 'psali',
		title: { en: 'Ten-oueh Ensok', ar: 'تين أويه إنسوك' },
	},
	{
		id: 'saints-commemoration',
		pageId: 111,
		kind: 'commemoration',
		title: { en: 'The Commemoration of the Saints', ar: 'مجمع القديسين' },
	},
	{
		id: 'virgin-mary-doxology',
		pageId: 25,
		kind: 'doxology',
		title: { en: 'Doxology for the Virgin Mary', ar: 'ذكصولوجية العذراء مريم' },
	},
	{
		id: 'fourth-hoos',
		pageId: 127,
		kind: 'canticle',
		title: { en: 'The Fourth Hoos', ar: 'الهوس الرابع' },
	},
	{
		id: 'first-sunday-psali',
		pageId: 112,
		kind: 'psali',
		title: { en: 'The First Sunday Psali', ar: 'إبصالية الأحد الأولى' },
	},
	{
		id: 'second-sunday-psali',
		pageId: 174,
		kind: 'psali',
		title: { en: 'The Second Sunday Psali', ar: 'إبصالية الأحد الثانية' },
	},
	{
		id: 'theotokia-introduction-leebon',
		pageId: 465,
		kind: 'theotokia',
		title: {
			en: 'Introduction to the Sunday Theotokia — Leebon',
			ar: 'مقدمة ثيؤطوكية الأحد — ليبون',
		},
	},
	{
		id: 'sunday-theotokia',
		pageId: 476,
		kind: 'theotokia',
		title: { en: 'The Sunday Theotokia', ar: 'ثيؤطوكية الأحد' },
		segments: [
			{
				id: 'sunday-theotokia-part-1',
				start: 'The First Part:',
				title: { en: 'Sunday Theotokia — Part 1', ar: 'ثيؤطوكية الأحد — القطعة الأولى' },
			},
			{
				id: 'sunday-theotokia-part-2',
				start: 'The Second Part:',
				title: { en: 'Sunday Theotokia — Part 2', ar: 'ثيؤطوكية الأحد — القطعة الثانية' },
			},
			{
				id: 'sunday-theotokia-part-3',
				start: 'The Third Part:',
				title: { en: 'Sunday Theotokia — Part 3', ar: 'ثيؤطوكية الأحد — القطعة الثالثة' },
			},
			{
				id: 'sunday-theotokia-part-4',
				start: 'The Fourth Part:',
				title: { en: 'Sunday Theotokia — Part 4', ar: 'ثيؤطوكية الأحد — القطعة الرابعة' },
			},
			{
				id: 'sunday-theotokia-part-5',
				start: 'The Fifth Part:',
				title: { en: 'Sunday Theotokia — Part 5', ar: 'ثيؤطوكية الأحد — القطعة الخامسة' },
			},
			{
				id: 'sunday-theotokia-part-6',
				start: 'The Sixth Part:',
				title: { en: 'Sunday Theotokia — Part 6', ar: 'ثيؤطوكية الأحد — القطعة السادسة' },
			},
		],
	},
	{
		id: 'gospel-of-luke',
		pageId: 138,
		kind: 'gospel',
		title: { en: 'The Gospel According to Saint Luke', ar: 'الإنجيل لمعلمنا مار لوقا' },
	},
	{
		id: 'sunday-theotokia-part-7-shere-ne-maria',
		pageId: 139,
		kind: 'theotokia',
		title: {
			en: 'Sunday Theotokia — Part 7: Shere ne Maria',
			ar: 'ثيؤطوكية الأحد — القطعة السابعة: شيري نيه ماريا',
		},
	},
	{
		id: 'sunday-theotokia-part-7-semoti',
		pageId: 452,
		kind: 'theotokia',
		title: {
			en: 'Sunday Theotokia — Part 7: Semoti',
			ar: 'ثيؤطوكية الأحد — القطعة السابعة: سيموتي',
		},
	},
	{
		id: 'sunday-theotokia-part-8',
		pageId: 140,
		kind: 'theotokia',
		title: {
			en: 'Sunday Theotokia — Part 8: Shashf Ensop',
			ar: 'ثيؤطوكية الأحد — القطعة الثامنة: شاشف إنسوب',
		},
		segments: [
			{
				id: 'sunday-theotokia-part-8',
				title: {
					en: 'Sunday Theotokia — Part 8: Shashf Ensop',
					ar: 'ثيؤطوكية الأحد — القطعة الثامنة: شاشف إنسوب',
				},
			},
			{
				id: 'sunday-theotokia-part-9',
				start: 'The Ninth Part:',
				title: { en: 'Sunday Theotokia — Part 9', ar: 'ثيؤطوكية الأحد — القطعة التاسعة' },
			},
		],
	},
	{
		id: 'sunday-theotokia-part-10',
		pageId: 479,
		kind: 'theotokia',
		title: {
			en: 'Sunday Theotokia — Part 10: Teoi Enhekanos',
			ar: 'ثيؤطوكية الأحد — القطعة العاشرة: تي أوي إنهيكانوس',
		},
		segments: [
			{
				id: 'sunday-theotokia-part-10',
				title: {
					en: 'Sunday Theotokia — Part 10: Teoi Enhekanos',
					ar: 'ثيؤطوكية الأحد — القطعة العاشرة: تي أوي إنهيكانوس',
				},
			},
			{
				id: 'sunday-theotokia-part-11',
				start: 'The Eleventh Part:',
				title: { en: 'Sunday Theotokia — Part 11', ar: 'ثيؤطوكية الأحد — القطعة الحادية عشرة' },
			},
			{
				id: 'sunday-theotokia-part-12',
				start: 'The Twelfth Part:',
				title: { en: 'Sunday Theotokia — Part 12', ar: 'ثيؤطوكية الأحد — القطعة الثانية عشرة' },
			},
			{
				id: 'sunday-theotokia-part-13',
				start: 'The Thirteenth Part:',
				title: { en: 'Sunday Theotokia — Part 13', ar: 'ثيؤطوكية الأحد — القطعة الثالثة عشرة' },
			},
			{
				id: 'sunday-theotokia-part-14',
				start: 'The Fourteenth Part:',
				end: 'The Fifteenth Part:',
				title: { en: 'Sunday Theotokia — Part 14', ar: 'ثيؤطوكية الأحد — القطعة الرابعة عشرة' },
			},
		],
	},
	{
		id: 'sunday-theotokia-part-15',
		pageId: 480,
		kind: 'theotokia',
		title: {
			en: 'Sunday Theotokia — Part 15: Aven Pi-arshee-erevs',
			ar: 'ثيؤطوكية الأحد — القطعة الخامسة عشرة: أف إن بي أرشي إريفس',
		},
	},
	{
		id: 'sunday-theotokia-part-16',
		pageId: 481,
		kind: 'theotokia',
		availability: 'resurrection-through-hathor',
		title: {
			en: 'Sunday Theotokia — Part 16: Nim Ghar',
			ar: 'ثيؤطوكية الأحد — القطعة السادسة عشرة: نيم غار',
		},
		segments: [
			{
				id: 'sunday-theotokia-part-16',
				title: {
					en: 'Sunday Theotokia — Part 16: Nim Ghar',
					ar: 'ثيؤطوكية الأحد — القطعة السادسة عشرة: نيم غار',
				},
			},
			{
				id: 'sunday-theotokia-part-17',
				start: 'The Seventeenth Part:',
				title: { en: 'Sunday Theotokia — Part 17', ar: 'ثيؤطوكية الأحد — القطعة السابعة عشرة' },
			},
			{
				id: 'sunday-theotokia-part-18',
				start: 'The Eighteenth Part:',
				title: { en: 'Sunday Theotokia — Part 18', ar: 'ثيؤطوكية الأحد — القطعة الثامنة عشرة' },
			},
		],
	},
	{
		id: 'difnar-introduction-adam',
		pageId: 661,
		kind: 'difnar',
		title: { en: 'Introduction to the Difnar — Adam', ar: 'مقدمة الدفنار — آدام' },
	},
	{
		id: 'adam-theotokias-conclusion',
		pageId: 477,
		kind: 'conclusion',
		title: { en: 'Conclusion of the Adam Theotokias', ar: 'ختام الثيؤطوكيات الآدام' },
	},
	{
		id: 'concluding-litany',
		pageId: 147,
		kind: 'litany',
		title: { en: 'The Concluding Litany', ar: 'طلبة الختام' },
	},
	{
		id: 'morning-doxology',
		pageId: 2716,
		kind: 'doxology',
		title: { en: 'The Morning Doxology', ar: 'ذكصولوجية باكر' },
	},
]

const decodeHtml = (value: string): string =>
	value
		.replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
		.replace(/&#x([\da-f]+);/gi, (_, code: string) =>
			String.fromCodePoint(Number.parseInt(code, 16)),
		)
		.replace(/&nbsp;/gi, ' ')
		.replace(/&quot;/gi, '"')
		.replace(/&#0?39;|&apos;/gi, "'")
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')

function textFromColumn(html: string): string {
	return decodeHtml(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''))
		.replace(/[ \t]+/g, ' ')
		.replace(/\s*\n\s*/g, '\n')
		.trim()
		.replace(/(^|\n)\+\s*/g, '$1')
}

function extractParallelRows(html: string): Record<TasbehaLanguage, string[]> {
	const result: Record<TasbehaLanguage, string[]> = { en: [], cop: [], ar: [] }
	const rowPattern =
		/<div class=['"][^'"]*englishtext[^'"]*['"][^>]*>([\s\S]*?)<\/div>\s*<div class=['"][^'"]*coptictext_utf8[^'"]*['"][^>]*>([\s\S]*?)<\/div>\s*<div class=['"][^'"]*arabictext[^'"]*['"][^>]*>([\s\S]*?)<\/div>/gi

	for (const rowMatch of html.matchAll(rowPattern)) {
		const en = textFromColumn(rowMatch[1])
		const cop = textFromColumn(rowMatch[2])
		const ar = textFromColumn(rowMatch[3])
		// Tasbeha pages append English transliteration rows whose Arabic column is
		// blank. Requiring all three source columns preserves alignment.
		if (!en || !cop || !ar) continue
		result.en.push(en)
		result.cop.push(cop)
		result.ar.push(ar)
	}

	return result
}

function splitRows(
	definition: SectionDefinition,
	rows: Record<TasbehaLanguage, string[]>,
): Array<{
	id: string
	title: Record<'en' | 'ar', string>
	rows: Record<TasbehaLanguage, string[]>
}> {
	if (!definition.segments) return [{ id: definition.id, title: definition.title, rows }]
	const normalizeHeading = (value: string) =>
		value
			.replace(/^The\s+/i, '')
			.replace(/\s+/g, ' ')
			.trim()
			.toLocaleLowerCase('en')
	const headingIndex = (heading: string) => {
		const normalized = normalizeHeading(heading)
		return rows.en.findIndex((row) => normalizeHeading(row).startsWith(normalized))
	}

	return definition.segments.map((segment, index) => {
		const start = segment.start ? headingIndex(segment.start) : 0
		if (start < 0) throw new Error(`${definition.id}: missing segment heading "${segment.start}"`)
		const nextHeading = segment.end ?? definition.segments[index + 1]?.start
		const end = nextHeading ? headingIndex(nextHeading) : rows.en.length
		if (end < 0) throw new Error(`${definition.id}: missing segment heading "${nextHeading}"`)
		const segmentRows = {
			en: rows.en.slice(start, end),
			cop: rows.cop.slice(start, end),
			ar: rows.ar.slice(start, end),
		}
		if (segment.start) {
			for (const language of ['en', 'cop', 'ar'] as const) {
				const [, ...remainder] = segmentRows[language][0].split('\n')
				if (remainder.length > 0) segmentRows[language][0] = remainder.join('\n')
				else segmentRows[language].shift()
			}
		}
		if (segmentRows.en.length === 0) throw new Error(`${segment.id}: empty segment`)
		return { id: segment.id, title: segment.title, rows: segmentRows }
	})
}

async function fetchSection(
	definition: SectionDefinition,
): Promise<Array<Record<TasbehaLanguage, TasbehaSection>>> {
	const url = `${BASE_URL}/${definition.pageId}`
	const response = await fetch(url)
	if (!response.ok) throw new Error(`Tasbeha.org returned ${response.status} for ${url}`)
	const rows = extractParallelRows(await response.text())
	if (definition.stop) {
		const stop = rows.en.findIndex((row) => row.startsWith(definition.stop as string))
		if (stop < 0) throw new Error(`${definition.id}: missing stop heading "${definition.stop}"`)
		rows.en = rows.en.slice(0, stop)
		rows.cop = rows.cop.slice(0, stop)
		rows.ar = rows.ar.slice(0, stop)
	}
	if (
		rows.en.length === 0 ||
		rows.en.length !== rows.cop.length ||
		rows.en.length !== rows.ar.length
	) {
		throw new Error(
			`${definition.id}: invalid parallel rows (en=${rows.en.length}, cop=${rows.cop.length}, ar=${rows.ar.length})`,
		)
	}

	const source = {
		name: 'Tasbeha.org' as const,
		url,
		pageId: definition.pageId,
		accessedAt: ACCESSED_AT,
		...(definition.corroboratingUrls ? { corroboratingUrls: definition.corroboratingUrls } : {}),
	}
	return splitRows(definition, rows).map((segment) => ({
		en: {
			id: segment.id,
			title: segment.title.en,
			kind: definition.kind,
			content: segment.rows.en,
			source,
			...(definition.availability ? { availability: definition.availability } : {}),
		},
		ar: {
			id: segment.id,
			title: segment.title.ar,
			kind: definition.kind,
			content: segment.rows.ar,
			source,
			...(definition.availability ? { availability: definition.availability } : {}),
		},
		cop: {
			id: segment.id,
			title: segment.title.en,
			titleLanguage: 'en',
			kind: definition.kind,
			content: segment.rows.cop,
			source,
			...(definition.availability ? { availability: definition.availability } : {}),
		},
	}))
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(scriptDir, '..')
const sections = (await Promise.all(SECTION_DEFINITIONS.map(fetchSection))).flat()

for (const language of ['en', 'cop', 'ar'] as const) {
	const service: TasbehaServiceData = {
		id: 'sunday-midnight-praises',
		language,
		name: language === 'ar' ? 'تسبحة نصف الليل ليوم الأحد' : 'Sunday Midnight Praises',
		description:
			language === 'ar'
				? 'النصوص الثابتة الكاملة للإبصلمودية السنوية لنصف الليل ليوم الأحد (آدام).'
				: 'The complete fixed annual Sunday (Adam) Midnight Psalmody.',
		rite: { cycle: 'annual', dayTune: 'adam', weekdays: [0] },
		status: 'complete',
		sections: sections.map((section) => section[language]),
	}
	const output = resolve(packageRoot, 'src', language, 'tasbeha', 'sunday.json')
	await mkdir(dirname(output), { recursive: true })
	await writeFile(output, `${JSON.stringify(service, null, '\t')}\n`, 'utf8')
}

console.log(`Imported ${sections.length} aligned English/Coptic/Arabic Tasbeha sections.`)
