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
export const tasbehaRiteLabel = (day: TasbehaDayInfo, isArabic: boolean): string => {
	const tune = day.tune === 'adam' ? (isArabic ? 'آدام' : 'Adam') : isArabic ? 'واطس' : 'Watos'
	const name = isArabic ? day.nameAr : day.name
	const vespers = day.praise === 'vespers' ? (isArabic ? ' عشية' : ' Vespers') : ''
	return isArabic ? `سنوي · ${name}${vespers} (${tune})` : `Annual · ${name}${vespers} (${tune})`
}
