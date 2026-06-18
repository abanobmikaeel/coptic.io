import type { CopticDate } from '../types/date'
import { COPTIC_MONTHS } from '../types/date'

/**
 * Localized names for canonical Coptic calendar / liturgical values.
 *
 * Core owns the English identities (month names, season/fast names) it
 * generates, so it also owns their translations — the "language pack" that
 * every client (web, native, MCP) and the API can share. Strings are keyed by
 * the canonical English value core itself produces; unknown keys fall back to
 * the input, so callers always get a usable string.
 */

export type NameLang = 'en' | 'ar' | 'es'

const toLang = (lang: string): NameLang =>
	lang === 'ar' ? 'ar' : lang === 'es' ? 'es' : 'en'

// Coptic months 1–13. Spanish has no distinct Coptic month forms, so it reuses
// the English transliteration.
const COPTIC_MONTH_NAMES: Record<NameLang, readonly string[]> = {
	en: COPTIC_MONTHS,
	es: COPTIC_MONTHS,
	ar: [
		'توت',
		'بابه',
		'هاتور',
		'كيهك',
		'طوبة',
		'أمشير',
		'برمهات',
		'برموده',
		'بشنس',
		'بؤونة',
		'أبيب',
		'مسرى',
		'نسيء',
	],
}

const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

/** Convert ASCII digits in a string/number to Arabic-Indic digits. */
export const toArabicDigits = (value: string | number): string =>
	String(value).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)])

/** Localized Coptic month name for a 1-based month index. */
export const getCopticMonthName = (month: number, lang = 'en'): string => {
	const list = COPTIC_MONTH_NAMES[toLang(lang)] ?? COPTIC_MONTHS
	return list[month - 1] ?? COPTIC_MONTHS[month - 1] ?? ''
}

/** Return a Coptic date with its `dateString`/`monthString` localized. */
export const localizeCopticDate = (date: CopticDate, lang = 'en'): CopticDate => {
	const l = toLang(lang)
	const monthString = getCopticMonthName(date.month, l)
	const dateString =
		l === 'ar'
			? `${monthString} ${toArabicDigits(date.day)}، ${toArabicDigits(date.year)}`
			: `${monthString} ${date.day}, ${date.year}`
	return { ...date, monthString, dateString }
}

// Season / fast / feast names keyed by the canonical English name core emits.
const LITURGICAL_NAMES: Record<Exclude<NameLang, 'en'>, Record<string, string>> = {
	ar: {
		'Fast of Nineveh': 'صوم نينوى',
		'Great Lent': 'الصوم الكبير',
		'Holy Week': 'أسبوع الآلام',
		'Paschal Season': 'زمن الخماسين المقدّسة',
		"Apostles' Fast": 'صوم الرسل',
		'Nativity Fast': 'صوم الميلاد',
		'Wednesday Fast': 'صوم الأربعاء',
		'Friday Fast': 'صوم الجمعة',
		'St. Mary Fast': 'صوم العذراء',
		'Fast of the Virgin Mary': 'صوم العذراء',
		'Ordinary Time': ' السنوي ',
	},
	es: {
		'Fast of Nineveh': 'Ayuno de Nínive',
		'Great Lent': 'Gran Cuaresma',
		'Holy Week': 'Semana Santa',
		'Paschal Season': 'Tiempo Pascual',
		"Apostles' Fast": 'Ayuno de los Apóstoles',
		'Nativity Fast': 'Ayuno de Navidad',
		'Wednesday Fast': 'Ayuno del miércoles',
		'Friday Fast': 'Ayuno del viernes',
		'St. Mary Fast': 'Ayuno de la Virgen María',
		'Fast of the Virgin Mary': 'Ayuno de la Virgen María',
		'Ordinary Time': 'Tiempo Ordinario',
	},
}

const LITURGICAL_DESCRIPTIONS: Record<Exclude<NameLang, 'en'>, Record<string, string>> = {
	ar: {
		'Fast of Nineveh': 'صوم ثلاثة أيام تذكارًا لتوبة أهل نينوى',
		'Great Lent': 'الصوم الكبير المقدّس استعدادًا لعيد القيامة',
		'Holy Week': 'أسبوع آلام السيد المسيح',
		'Paschal Season': 'خمسون يومًا من الفرح من القيامة إلى العنصرة',
		"Apostles' Fast": 'صوم من العنصرة إلى عيد الرسل',
		'Nativity Fast': 'صوم الميلاد استعدادًا لعيد الميلاد المجيد',
		'Ordinary Time': 'زمن عادي خارج المواسم الكبرى',
	},
	es: {},
}

/** Localized season/fast/feast name; falls back to the English name. */
export const getLiturgicalName = (englishName: string, lang = 'en'): string => {
	const l = toLang(lang)
	if (l === 'en') return englishName
	return LITURGICAL_NAMES[l]?.[englishName] ?? englishName
}

/** Localized season/fast description; falls back to the provided English text. */
export const getLiturgicalDescription = (
	englishName: string,
	englishDescription: string,
	lang = 'en',
): string => {
	const l = toLang(lang)
	if (l === 'en') return englishDescription
	return LITURGICAL_DESCRIPTIONS[l]?.[englishName] ?? englishDescription
}
