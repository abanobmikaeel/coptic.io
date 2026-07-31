import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type {
	TasbehaCommonFile,
	TasbehaCycle,
	TasbehaDayTune,
	TasbehaLanguage,
	TasbehaSection,
	TasbehaSectionKind,
	TasbehaServiceFile,
	TasbehaServiceId,
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

	// Weekday propers. Every weekday shares the annual frame above and swaps in its
	// own psali and Theotokia (with that Theotokia's lobsh). Adam days and Watos days
	// take different Theotokia introductions, Difnar introductions and conclusions,
	// so those are defined once here and referenced per service.
	{
		id: 'watos-theotokias-introduction',
		pageId: 1928,
		kind: 'theotokia',
		title: {
			en: 'Introduction to the Watos Theotokias',
			ar: 'مقدمة الثيؤطوكيات الواطس',
		},
	},
	{
		id: 'watos-theotokias-conclusion',
		pageId: 1929,
		kind: 'conclusion',
		title: { en: 'Conclusion of the Watos Theotokias', ar: 'ختام الثيؤطوكيات الواطس' },
	},
	{
		id: 'difnar-introduction-watos',
		pageId: 656,
		kind: 'difnar',
		title: { en: 'Introduction to the Difnar — Watos', ar: 'مقدمة الدفنار — واطس' },
	},

	{
		id: 'monday-psali',
		pageId: 352,
		kind: 'psali',
		title: { en: 'The Monday Psali', ar: 'إبصالية الإثنين' },
	},
	{
		id: 'monday-theotokia',
		pageId: 353,
		kind: 'theotokia',
		title: { en: 'The Monday Theotokia — Adam', ar: 'ثيؤطوكية الإثنين — آدام' },
	},
	{
		id: 'monday-theotokia-lobsh',
		pageId: 449,
		kind: 'lobsh',
		title: { en: 'The Monday Theotokia Lobsh', ar: 'لبش ثيؤطوكية الإثنين' },
	},

	{
		id: 'tuesday-psali',
		pageId: 351,
		kind: 'psali',
		title: { en: 'The Tuesday Psali', ar: 'إبصالية الثلاثاء' },
	},
	{
		id: 'tuesday-theotokia',
		pageId: 467,
		kind: 'theotokia',
		title: { en: 'The Tuesday Theotokia — Adam', ar: 'ثيؤطوكية الثلاثاء — آدام' },
	},
	{
		id: 'tuesday-theotokia-lobsh',
		pageId: 468,
		kind: 'lobsh',
		title: { en: 'The Tuesday Theotokia Lobsh', ar: 'لبش ثيؤطوكية الثلاثاء' },
	},

	{
		id: 'wednesday-psali',
		pageId: 356,
		kind: 'psali',
		title: { en: 'The Wednesday Psali', ar: 'إبصالية الأربعاء' },
	},
	{
		id: 'wednesday-theotokia',
		pageId: 469,
		kind: 'theotokia',
		title: { en: 'The Wednesday Theotokia — Watos', ar: 'ثيؤطوكية الأربعاء — واطس' },
	},
	{
		id: 'wednesday-theotokia-ti-galilia',
		pageId: 473,
		kind: 'theotokia',
		title: {
			en: 'Wednesday Theotokia — Part 7: Ti-galili-a',
			ar: 'ثيؤطوكية الأربعاء — القطعة السابعة: تي جاليليا',
		},
	},
	{
		id: 'wednesday-theotokia-lobsh',
		pageId: 470,
		kind: 'lobsh',
		title: { en: 'The Wednesday Theotokia Lobsh', ar: 'لبش ثيؤطوكية الأربعاء' },
	},

	{
		id: 'thursday-psali',
		pageId: 466,
		kind: 'psali',
		title: { en: 'The Thursday Psali', ar: 'إبصالية الخميس' },
	},
	{
		id: 'thursday-theotokia',
		pageId: 471,
		kind: 'theotokia',
		title: { en: 'The Thursday Theotokia — Watos', ar: 'ثيؤطوكية الخميس — واطس' },
	},
	{
		id: 'thursday-theotokia-lobsh',
		pageId: 472,
		kind: 'lobsh',
		title: { en: 'The Thursday Theotokia Lobsh', ar: 'لبش ثيؤطوكية الخميس' },
	},

	{
		id: 'friday-psali',
		pageId: 384,
		kind: 'psali',
		title: { en: 'The Friday Psali', ar: 'إبصالية الجمعة' },
	},
	{
		id: 'friday-theotokia',
		pageId: 146,
		kind: 'theotokia',
		title: { en: 'The Friday Theotokia — Watos', ar: 'ثيؤطوكية الجمعة — واطس' },
	},
	{
		id: 'friday-theotokia-lobsh',
		pageId: 457,
		kind: 'lobsh',
		title: { en: 'The Friday Theotokia Lobsh', ar: 'لبش ثيؤطوكية الجمعة' },
	},

	// Saturday is the Vespers Praise, prayed on Saturday evening. Its order is
	// attested by Tasbeha.org's Kiahk order-of-service page (view/1405), which lays
	// out the same frame: Psalm 116, the Fourth Hoos, the psali, the Theotokia with
	// its Sherat, then the conclusion. It has no four canticles and no morning
	// doxology — those belong to the Midnight Praise.
	{
		id: 'saturday-ni-ethnos-teero',
		pageId: 454,
		kind: 'opening',
		title: {
			en: 'The Beginning of the Vespers Praise — Ni-ethnos Teero',
			ar: 'بدء تسبحة عشية — ني إثنوس تيرو',
		},
	},
	{
		id: 'saturday-psali',
		pageId: 362,
		kind: 'psali',
		title: { en: 'The Saturday Psali', ar: 'إبصالية السبت' },
	},
	{
		id: 'saturday-theotokia',
		pageId: 359,
		kind: 'theotokia',
		title: { en: 'The Saturday Theotokia — Watos', ar: 'ثيؤطوكية السبت — واطس' },
	},
	{
		id: 'saturday-theotokia-lobsh-sherat',
		pageId: 450,
		kind: 'lobsh',
		title: {
			en: 'The Saturday Theotokia Lobsh — The Sherat',
			ar: 'لبش ثيؤطوكية السبت — الشيرات',
		},
	},
]

// The frame every annual Midnight Praise shares, before the day's own psali and
// Theotokia, and after them.
const MIDNIGHT_OPENING = [
	'ten-theno',
	'first-hoos',
	'first-hoos-lobsh',
	'second-hoos',
	'second-hoos-lobsh',
	'third-hoos',
	'third-hoos-esmo-epchois',
	'three-children-greek-psali',
	'ten-oueh-ensok',
	'saints-commemoration',
	'virgin-mary-doxology',
	'fourth-hoos',
]
const midnightClosing = (tune: TasbehaDayTune) => [
	tune === 'adam' ? 'difnar-introduction-adam' : 'difnar-introduction-watos',
	tune === 'adam' ? 'adam-theotokias-conclusion' : 'watos-theotokias-conclusion',
	'concluding-litany',
	'morning-doxology',
]
const theotokiaIntroduction = (tune: TasbehaDayTune) =>
	tune === 'adam' ? 'theotokia-introduction-leebon' : 'watos-theotokias-introduction'

interface ServiceDefinition {
	id: TasbehaServiceId
	file: string
	cycle: TasbehaCycle
	dayTune: TasbehaDayTune
	weekdays: number[]
	name: Record<'en' | 'ar', string>
	description: Record<'en' | 'ar', string>
	/** Section definition ids, in the order they are prayed. */
	order: string[]
}

// Adam is prayed Sunday–Tuesday and Watos Wednesday–Saturday, matching the tune
// split in @coptic/core's liturgical context.
const midnightPraises = (
	id: TasbehaServiceId,
	file: string,
	weekday: number,
	tune: TasbehaDayTune,
	day: Record<'en' | 'ar', string>,
	propers: string[],
): ServiceDefinition => ({
	id,
	file,
	cycle: 'annual',
	dayTune: tune,
	weekdays: [weekday],
	name: {
		en: `${day.en} Midnight Praises`,
		ar: `تسبحة نصف الليل ليوم ${day.ar}`,
	},
	description: {
		en: `The complete fixed annual ${day.en} (${tune === 'adam' ? 'Adam' : 'Watos'}) Midnight Psalmody.`,
		ar: `النصوص الثابتة الكاملة للإبصلمودية السنوية لنصف الليل ليوم ${day.ar} (${tune === 'adam' ? 'آدام' : 'واطس'}).`,
	},
	order: [
		...MIDNIGHT_OPENING,
		...propers.slice(0, 1),
		theotokiaIntroduction(tune),
		...propers.slice(1),
		...midnightClosing(tune),
	],
})

const SERVICE_DEFINITIONS: ServiceDefinition[] = [
	// Sunday's propers are the two Sunday psalies and the eighteen-part Sunday
	// Theotokia, whose Gospel sits between its sixth and seventh parts. It has no
	// single lobsh, unlike the weekday Theotokias.
	{
		...midnightPraises(
			'sunday-midnight-praises',
			'sunday',
			0,
			'adam',
			{ en: 'Sunday', ar: 'الأحد' },
			[],
		),
		name: { en: 'Sunday Midnight Praises', ar: 'تسبحة نصف الليل ليوم الأحد' },
		description: {
			en: 'The complete fixed annual Sunday (Adam) Midnight Psalmody.',
			ar: 'النصوص الثابتة الكاملة للإبصلمودية السنوية لنصف الليل ليوم الأحد (آدام).',
		},
		order: [
			...MIDNIGHT_OPENING,
			'first-sunday-psali',
			'second-sunday-psali',
			'theotokia-introduction-leebon',
			'sunday-theotokia',
			'gospel-of-luke',
			'sunday-theotokia-part-7-shere-ne-maria',
			'sunday-theotokia-part-7-semoti',
			'sunday-theotokia-part-8',
			'sunday-theotokia-part-10',
			'sunday-theotokia-part-15',
			'sunday-theotokia-part-16',
			...midnightClosing('adam'),
		],
	},
	midnightPraises('monday-midnight-praises', 'monday', 1, 'adam', { en: 'Monday', ar: 'الإثنين' }, [
		'monday-psali',
		'monday-theotokia',
		'monday-theotokia-lobsh',
	]),
	midnightPraises(
		'tuesday-midnight-praises',
		'tuesday',
		2,
		'adam',
		{ en: 'Tuesday', ar: 'الثلاثاء' },
		['tuesday-psali', 'tuesday-theotokia', 'tuesday-theotokia-lobsh'],
	),
	midnightPraises(
		'wednesday-midnight-praises',
		'wednesday',
		3,
		'watos',
		{ en: 'Wednesday', ar: 'الأربعاء' },
		[
			'wednesday-psali',
			'wednesday-theotokia',
			'wednesday-theotokia-ti-galilia',
			'wednesday-theotokia-lobsh',
		],
	),
	midnightPraises(
		'thursday-midnight-praises',
		'thursday',
		4,
		'watos',
		{ en: 'Thursday', ar: 'الخميس' },
		['thursday-psali', 'thursday-theotokia', 'thursday-theotokia-lobsh'],
	),
	midnightPraises('friday-midnight-praises', 'friday', 5, 'watos', { en: 'Friday', ar: 'الجمعة' }, [
		'friday-psali',
		'friday-theotokia',
		'friday-theotokia-lobsh',
	]),
	{
		id: 'saturday-vespers-praises',
		file: 'saturday',
		cycle: 'annual',
		dayTune: 'watos',
		weekdays: [6],
		name: { en: 'Saturday Vespers Praises', ar: 'تسبحة عشية ليوم السبت' },
		description: {
			en: 'The complete fixed annual Saturday (Watos) Vespers Praise, prayed on Saturday evening.',
			ar: 'النصوص الثابتة الكاملة لتسبحة عشية السنوية ليوم السبت (واطس).',
		},
		order: [
			'saturday-ni-ethnos-teero',
			'fourth-hoos',
			'saturday-psali',
			'watos-theotokias-introduction',
			'saturday-theotokia',
			'saturday-theotokia-lobsh-sherat',
			'difnar-introduction-watos',
			'watos-theotokias-conclusion',
		],
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

const definitionsById = new Map(SECTION_DEFINITIONS.map((d) => [d.id, d]))
for (const service of SERVICE_DEFINITIONS) {
	for (const id of service.order) {
		if (!definitionsById.has(id)) throw new Error(`${service.id}: unknown section "${id}"`)
	}
}

// The annual frame is shared by every service, so each page is fetched once and
// reused across the services that pray it.
const referenced = [...new Set(SERVICE_DEFINITIONS.flatMap((service) => service.order))]
const fetched = await Promise.all(
	referenced.map(
		async (id) => [id, await fetchSection(definitionsById.get(id) as SectionDefinition)] as const,
	),
)
const sectionsByDefinition = new Map(fetched)

// Expand each service to the section ids it prays, in order. A definition may yield
// several sections (the Sunday Theotokia's numbered parts), so order is built from
// the resolved sections rather than from definition ids.
const orderByService = new Map(
	SERVICE_DEFINITIONS.map((service) => [
		service.id,
		service.order.flatMap((definitionId) =>
			(
				sectionsByDefinition.get(definitionId) as Array<Record<TasbehaLanguage, TasbehaSection>>
			).map((section) => section.en.id),
		),
	]),
)

const sectionsById = new Map(
	[...sectionsByDefinition.values()].flat().map((section) => [section.en.id, section] as const),
)

// Most of the annual Psalmody is prayed on more than one day. Those sections are
// written once to common.json and referenced by id, so a day file carries only its
// own propers — the alternative duplicates the whole frame seven times.
const useCount = new Map<string, number>()
for (const order of orderByService.values()) {
	for (const id of new Set(order)) useCount.set(id, (useCount.get(id) ?? 0) + 1)
}
const isCommon = (id: string) => (useCount.get(id) ?? 0) > 1
const commonIds = [...useCount.keys()].filter(isCommon)

for (const language of ['en', 'cop', 'ar'] as const) {
	const common: TasbehaCommonFile = {
		language,
		sections: Object.fromEntries(
			commonIds.map((id) => [
				id,
				(sectionsById.get(id) as Record<TasbehaLanguage, TasbehaSection>)[language],
			]),
		),
	}
	const output = resolve(packageRoot, 'src', language, 'tasbeha', 'common.json')
	await mkdir(dirname(output), { recursive: true })
	await writeFile(output, `${JSON.stringify(common, null, '\t')}\n`, 'utf8')
}

for (const service of SERVICE_DEFINITIONS) {
	const order = orderByService.get(service.id) as string[]
	const propers = order.filter((id) => !isCommon(id))
	for (const language of ['en', 'cop', 'ar'] as const) {
		const data: TasbehaServiceFile = {
			id: service.id,
			language,
			name: language === 'ar' ? service.name.ar : service.name.en,
			description: language === 'ar' ? service.description.ar : service.description.en,
			rite: { cycle: service.cycle, dayTune: service.dayTune, weekdays: service.weekdays },
			status: 'complete',
			order,
			sections: propers.map(
				(id) => (sectionsById.get(id) as Record<TasbehaLanguage, TasbehaSection>)[language],
			),
		}
		const output = resolve(packageRoot, 'src', language, 'tasbeha', `${service.file}.json`)
		await mkdir(dirname(output), { recursive: true })
		await writeFile(output, `${JSON.stringify(data, null, '\t')}\n`, 'utf8')
	}
	console.log(
		`${service.id}: ${order.length} sections (${propers.length} proper, ${order.length - propers.length} shared)`,
	)
}

console.log(
	`Imported ${referenced.length} Tasbeha.org pages into ${SERVICE_DEFINITIONS.length} services: ${commonIds.length} shared sections in common.json, ${sectionsById.size - commonIds.length} proper across the day files.`,
)
