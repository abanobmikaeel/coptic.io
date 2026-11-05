/**
 * Import the Kiahk Psalmody from Tasbeha.org into `{lang}/tasbeha/kiahk.json`.
 *
 *   pnpm import:tasbeha-kiahk
 *
 * This covers the Saturday Vespers Praises and the "7 & 4" hymns only. The rite is much
 * larger: see `getKiahkPsalmodyWeek` for when it applies, and the file's `status`.
 * A column the source leaves empty stays empty and is flagged `contentUnavailable`.
 * Nothing is transliterated or translated to fill it.
 */
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type {
	TasbehaKiahkFile,
	TasbehaLanguage,
	TasbehaSection,
	TasbehaSectionKind,
} from '../src/tasbeha/types'
import { type Lang, parseRows } from './lib/tasbeha-rows'

const BASE_URL = 'https://tasbeha.org/hymn_library/view'
const ACCESSED_AT = new Date().toISOString().slice(0, 10)
const LANGUAGES: TasbehaLanguage[] = ['en', 'cop', 'ar']

interface Definition {
	id: string
	pageId: number
	kind: TasbehaSectionKind
	title: Record<'en' | 'ar', string>
}

const part = (n: number, pageId: number): Definition => ({
	id: `kiahk-saturday-theotokia-part-${n}`,
	pageId,
	kind: 'theotokia',
	title: { en: `Saturday Theotokia, Part ${n}`, ar: `ثيؤطوكية السبت، القطعة ${n}` },
})

const exposition = (week: number, pageId: number): Definition => ({
	id: `kiahk-exposition-week-${week}`,
	pageId,
	kind: 'exposition',
	title: { en: `Exposition of Week ${week}`, ar: `طرح الأسبوع ${week}` },
})

const DEFINITIONS: Definition[] = [
	{
		id: 'kiahk-psali-watos',
		pageId: 101,
		kind: 'psali',
		title: { en: 'Psali Watos', ar: 'إبصالية واطس' },
	},
	{
		id: 'kiahk-another-psali-watos',
		pageId: 102,
		kind: 'psali',
		title: { en: 'Another Psali Watos', ar: 'إبصالية واطس أخرى' },
	},
	{
		id: 'kiahk-madeha-after-psali-watos',
		pageId: 1422,
		kind: 'psali',
		title: { en: 'A Madeha after the Psali Watos', ar: 'مديح بعد إبصالية واطس' },
	},
	{
		id: 'kiahk-watos-theotokias-introduction',
		pageId: 1419,
		kind: 'theotokia',
		title: { en: 'Introduction to the Watos Theotokias', ar: 'مقدمة ثيؤطوكيات الواطس' },
	},
	part(1, 526),
	part(2, 527),
	part(3, 528),
	part(4, 529),
	part(5, 530),
	part(6, 531),
	part(7, 533),
	part(8, 532),
	part(9, 534),
	{
		id: 'kiahk-saturday-watos-hymn',
		pageId: 2737,
		kind: 'theotokia',
		title: { en: 'Saturday: Watos Hymn', ar: 'السبت: مديح واطس' },
	},
	{
		id: 'kiahk-exposition-introduction',
		pageId: 657,
		kind: 'exposition',
		title: { en: 'Introduction to the Exposition', ar: 'مقدمة الطرح' },
	},
	exposition(1, 658),
	exposition(2, 617),
	exposition(3, 659),
	exposition(4, 660),
	{
		id: 'kiahk-third-hoos-adam-psali',
		pageId: 2729,
		kind: 'psali',
		title: { en: 'Adam Psali on the Third Hoos', ar: 'إبصالية آدام على الهوس الثالث' },
	},
	{
		id: 'kiahk-third-hoos-adam-hymn',
		pageId: 2730,
		kind: 'psali',
		title: { en: 'Adam Hymn on the Third Hoos', ar: 'مديح آدام على الهوس الثالث' },
	},
	{
		id: 'kiahk-third-hoos-trinity-hymn',
		pageId: 2704,
		kind: 'psali',
		title: { en: 'A Hymn for the Holy Trinity', ar: 'مديح للثالوث القدوس' },
	},
	{
		id: 'kiahk-fourth-hoos-adam-psali',
		pageId: 2712,
		kind: 'psali',
		title: {
			en: 'Another Adam Psali on the Fourth Hoos',
			ar: 'إبصالية آدام أخرى على الهوس الرابع',
		},
	},
	{
		id: 'kiahk-after-adam-theotokias-hymn',
		pageId: 2728,
		kind: 'psali',
		title: { en: 'Adam Hymn after the Theotokias', ar: 'مديح آدام بعد الثيؤطوكية' },
	},
	{
		id: 'kiahk-monday-adam-hymn',
		pageId: 2738,
		kind: 'psali',
		title: { en: 'Monday: Adam Hymn', ar: 'الإثنين: إبصالية آدام' },
	},
	{
		id: 'kiahk-wednesday-watos-hymn',
		pageId: 2732,
		kind: 'psali',
		title: { en: 'Wednesday: Watos Hymn', ar: 'الأربعاء: إبصالية واطس' },
	},
	{
		id: 'kiahk-wednesday-third-watos-hymn',
		pageId: 2731,
		kind: 'psali',
		title: { en: 'Wednesday: Third Watos Hymn', ar: 'الأربعاء: إبصالية واطس الثالثة' },
	},
	{
		id: 'kiahk-thursday-burning-bush',
		pageId: 2720,
		kind: 'psali',
		title: { en: 'Thursday: The Burning Bush', ar: 'الخميس: العليقة' },
	},
]

// Follows Tasbeha.org's Order of the Saturday Vespers Tasbeha in Kiahk (page 1405), which
// gives the Explanations of each part as well; those are not imported yet. Ni-ethnos
// Teero, the Fourth Hoos, the Sherat and the conclusion point to the annual text.
const SATURDAY_ORDER = [
	'saturday-ni-ethnos-teero',
	'fourth-hoos',
	'kiahk-psali-watos',
	'kiahk-another-psali-watos',
	'kiahk-madeha-after-psali-watos',
	'kiahk-watos-theotokias-introduction',
	...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `kiahk-saturday-theotokia-part-${n}`),
	'kiahk-saturday-watos-hymn',
	'saturday-theotokia-lobsh-sherat',
	'kiahk-exposition-introduction',
	'exposition',
	'watos-theotokias-conclusion',
]

// Where each hymn goes, from its Tasbeha.org title and the order in "Rites of the Month of
// Kiahk" (H.G. Bishop Abraham, Deacons' Day 2019). A day's Arabic hymn follows its Theotokia.
const ADDITIONS: TasbehaKiahkFile['additions'] = [
	{ section: 'kiahk-third-hoos-adam-psali', weekdays: [0], before: 'third-hoos' },
	{ section: 'kiahk-third-hoos-adam-hymn', weekdays: [0], before: 'third-hoos' },
	{ section: 'kiahk-third-hoos-trinity-hymn', weekdays: [0], after: 'third-hoos-esmo-epchois' },
	{ section: 'kiahk-fourth-hoos-adam-psali', weekdays: [0], before: 'fourth-hoos' },
	{
		section: 'kiahk-after-adam-theotokias-hymn',
		weekdays: [0, 1, 2],
		before: 'difnar-introduction-adam',
	},
	{ section: 'kiahk-monday-adam-hymn', weekdays: [1], after: 'monday-theotokia' },
	{ section: 'kiahk-wednesday-watos-hymn', weekdays: [3], after: 'wednesday-theotokia-ti-galilia' },
	{
		section: 'kiahk-wednesday-third-watos-hymn',
		weekdays: [3],
		after: 'kiahk-wednesday-watos-hymn',
	},
	{ section: 'kiahk-thursday-burning-bush', weekdays: [4], after: 'thursday-theotokia' },
]

const fetchSection = async (definition: Definition) => {
	const url = `${BASE_URL}/${definition.pageId}`
	const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
	if (!response.ok) throw new Error(`Tasbeha.org returned ${response.status} for ${url}`)
	const rows = parseRows(await response.text())
	if (rows.length === 0) throw new Error(`${definition.id}: no rows at ${url}`)

	const source = {
		name: 'Tasbeha.org' as const,
		url,
		pageId: definition.pageId,
		accessedAt: ACCESSED_AT,
	}
	return Object.fromEntries(
		LANGUAGES.map((language): [TasbehaLanguage, TasbehaSection] => {
			const cells = rows.map((row) => row[language as Lang])
			const content = cells.filter(Boolean)
			const complete = content.length === rows.length
			if (!complete && content.length > 0) throw new Error(`${definition.id}: partial ${language}`)
			return [
				language,
				{
					id: definition.id,
					title: language === 'ar' ? definition.title.ar : definition.title.en,
					...(language === 'cop' ? { titleLanguage: 'en' as const } : {}),
					kind: definition.kind,
					content,
					source,
					...(complete ? {} : { contentUnavailable: true as const }),
				},
			]
		}),
	) as Record<TasbehaLanguage, TasbehaSection>
}

const fetched: Array<Record<TasbehaLanguage, TasbehaSection>> = []
for (const definition of DEFINITIONS) {
	fetched.push(await fetchSection(definition))
	await new Promise((done) => setTimeout(done, 300))
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
for (const language of LANGUAGES) {
	const isArabic = language === 'ar'
	const data: TasbehaKiahkFile = {
		language,
		status: 'partial',
		nameSuffix: isArabic ? ' في شهر كيهك' : ' in Kiahk',
		description: isArabic
			? 'جزء من تسبحة شهر كيهك: مدائح وإبصاليات الشهر مضافة إلى التسبحة السنوية. الطقس الكيهكي الكامل غير متوفر بعد.'
			: "Part of the Kiahk Psalmody: the month's hymns added to the annual Psalmody. The full Kiahk rite is not available yet.",
		saturdayOrder: SATURDAY_ORDER,
		expositions: [1, 2, 3, 4].map((week) => `kiahk-exposition-week-${week}`),
		additions: ADDITIONS,
		sections: Object.fromEntries(
			fetched.map((section) => [section[language].id, section[language]]),
		),
	}
	const output = resolve(packageRoot, 'src', language, 'tasbeha', 'kiahk.json')
	await writeFile(output, `${JSON.stringify(data, null, '\t')}\n`, 'utf8')
}
console.log(`Imported ${DEFINITIONS.length} Kiahk sections`)
