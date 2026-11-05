import type { IncenseService } from './types'

// The seven services of the annual Psalmody, in the order the API exposes them at
// /tasbeha/{day}. Sunday–Friday are Midnight Praises; Saturday is the Vespers
// Praise, prayed on Saturday evening. Adam is prayed Sunday–Tuesday and Watos
// Wednesday–Saturday, matching getDayTune in @coptic/core.

export type TasbehaDayId =
	| 'sunday'
	| 'monday'
	| 'tuesday'
	| 'wednesday'
	| 'thursday'
	| 'friday'
	| 'saturday'

export interface TasbehaDayInfo {
	id: TasbehaDayId
	/** `Date.getDay()` — 0 is Sunday. */
	weekday: number
	name: string
	nameAr: string
	tune: 'adam' | 'watos'
	praise: 'midnight' | 'vespers'
}

export const TASBEHA_DAYS: TasbehaDayInfo[] = [
	{ id: 'sunday', weekday: 0, name: 'Sunday', nameAr: 'الأحد', tune: 'adam', praise: 'midnight' },
	{ id: 'monday', weekday: 1, name: 'Monday', nameAr: 'الإثنين', tune: 'adam', praise: 'midnight' },
	{
		id: 'tuesday',
		weekday: 2,
		name: 'Tuesday',
		nameAr: 'الثلاثاء',
		tune: 'adam',
		praise: 'midnight',
	},
	{
		id: 'wednesday',
		weekday: 3,
		name: 'Wednesday',
		nameAr: 'الأربعاء',
		tune: 'watos',
		praise: 'midnight',
	},
	{
		id: 'thursday',
		weekday: 4,
		name: 'Thursday',
		nameAr: 'الخميس',
		tune: 'watos',
		praise: 'midnight',
	},
	{ id: 'friday', weekday: 5, name: 'Friday', nameAr: 'الجمعة', tune: 'watos', praise: 'midnight' },
	{
		id: 'saturday',
		weekday: 6,
		name: 'Saturday',
		nameAr: 'السبت',
		tune: 'watos',
		praise: 'vespers',
	},
]

export const TASBEHA_DAY_IDS = TASBEHA_DAYS.map(({ id }) => id)

export const isTasbehaDayId = (value: unknown): value is TasbehaDayId =>
	TASBEHA_DAY_IDS.includes(value as TasbehaDayId)

export const getTasbehaDay = (id: TasbehaDayId): TasbehaDayInfo =>
	TASBEHA_DAYS.find((day) => day.id === id) ?? TASBEHA_DAYS[0]

export const getTasbehaDayForWeekday = (weekday: number): TasbehaDayInfo =>
	TASBEHA_DAYS.find((day) => day.weekday === weekday) ?? TASBEHA_DAYS[0]

/** The service prayed today, by the caller's clock. */
export const getCurrentTasbehaDay = (): TasbehaDayId =>
	getTasbehaDayForWeekday(new Date().getDay()).id

/** "Midnight Praises" / "Vespers Praise" — how the day's service is named. */
export const tasbehaPraiseLabel = (day: TasbehaDayInfo, isArabic: boolean): string =>
	day.praise === 'vespers'
		? isArabic
			? 'تسبحة عشية'
			: 'Vespers Praise'
		: isArabic
			? 'تسبحة نصف الليل'
			: 'Midnight Praises'

/** "Annual · Wednesday (Watos)" — the rite line shown in the reader header. */
export const tasbehaRiteLabel = (
	day: TasbehaDayInfo,
	isArabic: boolean,
	cycle?: string,
): string => {
	const tune = day.tune === 'adam' ? (isArabic ? 'آدام' : 'Adam') : isArabic ? 'واطس' : 'Watos'
	const name = isArabic ? day.nameAr : day.name
	const vespers = day.praise === 'vespers' ? (isArabic ? ' عشية' : ' Vespers') : ''
	const season = cycle === 'kiahk' ? ['كيهك', 'Kiahk'] : ['سنوي', 'Annual']
	return isArabic
		? `${season[0]} · ${name}${vespers} (${tune})`
		: `${season[1]} · ${name}${vespers} (${tune})`
}

const UNAVAILABLE: Record<string, { en: string; ar: string }> = {
	en: { en: 'Not available in English.', ar: 'غير متوفر بالإنجليزية.' },
	cop: { en: 'Not available in Coptic.', ar: 'غير متوفر بالقبطية.' },
}

/**
 * Says so in the text of a section none of the displayed languages has, which would
 * otherwise be blank. A section another language has stays empty here: the aligner then
 * leaves that language out of it, where a one-line label would anchor the alignment and
 * pack the whole hymn into a single row.
 */
export const labelUnavailableSections = (
	servicesByLang: Partial<Record<string, IncenseService>>,
	isArabic: boolean,
): Partial<Record<string, IncenseService>> => {
	const services = Object.values(servicesByLang).filter((service) => service !== undefined)
	const isMissingEverywhere = (id: string) =>
		services.every((service) => service.sections.find((s) => s.id === id)?.contentUnavailable)

	return Object.fromEntries(
		Object.entries(servicesByLang).map(([lang, service]) => {
			const label = UNAVAILABLE[lang]
			if (!service || !label) return [lang, service]
			const sections = service.sections.map((section) =>
				section.contentUnavailable && isMissingEverywhere(section.id)
					? { ...section, content: [isArabic ? label.ar : label.en] }
					: section,
			)
			return [lang, { ...service, sections }]
		}),
	)
}

/** Whether a displayed language lacks a section that another one has. */
export const hasUnevenSections = (
	servicesByLang: Partial<Record<string, IncenseService>>,
): boolean => {
	const services = Object.values(servicesByLang).filter((service) => service !== undefined)
	return services.some(({ sections }) =>
		sections.some(
			({ id, contentUnavailable }) =>
				contentUnavailable &&
				services.some(
					(other) =>
						other.sections.find((section) => section.id === id)?.contentUnavailable !== true,
				),
		),
	)
}
