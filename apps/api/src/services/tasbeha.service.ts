import { getKiahkPsalmodyWeek, includesLateSundayTheotokiaParts } from '@coptic/core/liturgy'
import {
	getKiahkTasbehaService as getArabicKiahkTasbeha,
	getTasbehaService as getArabicTasbeha,
	getTasbehaServiceForWeekday as getArabicTasbehaForWeekday,
} from '@coptic/data/ar/tasbeha'
import type { ServiceLanguage } from '@coptic/data/content'
import {
	getKiahkTasbehaService as getCopticKiahkTasbeha,
	getTasbehaService as getCopticTasbeha,
	getTasbehaServiceForWeekday as getCopticTasbehaForWeekday,
} from '@coptic/data/cop/tasbeha'
import {
	getKiahkTasbehaService as getEnglishKiahkTasbeha,
	getTasbehaService as getEnglishTasbeha,
	getTasbehaServiceForWeekday as getEnglishTasbehaForWeekday,
} from '@coptic/data/en/tasbeha'
import type { TasbehaServiceData, TasbehaServiceId } from '@coptic/data/en/tasbeha'
import type { TasbehaResponse } from '../schemas'

const byId: Record<ServiceLanguage, (id?: TasbehaServiceId) => TasbehaServiceData> = {
	en: getEnglishTasbeha,
	ar: getArabicTasbeha,
	cop: getCopticTasbeha,
}

const byWeekday: Record<ServiceLanguage, (weekday: number) => TasbehaServiceData> = {
	en: getEnglishTasbehaForWeekday,
	ar: getArabicTasbehaForWeekday,
	cop: getCopticTasbehaForWeekday,
}

const kiahkById: Record<
	ServiceLanguage,
	(id: TasbehaServiceId, week: number) => TasbehaServiceData
> = {
	en: getEnglishKiahkTasbeha,
	ar: getArabicKiahkTasbeha,
	cop: getCopticKiahkTasbeha,
}

/** The service as prayed on `date`: in Kiahk, the month's Psalmody in place of the annual. */
function inSeason(
	service: TasbehaServiceData,
	date: Date,
	translation: ServiceLanguage,
): TasbehaServiceData {
	const week = getKiahkPsalmodyWeek(date)
	return week ? kiahkById[translation](service.id, week) : service
}

// Parts 16–18 of the Sunday Theotokia are the only date-limited sections in the
// corpus; every other section is fixed for its day.
function resolve(service: TasbehaServiceData, date: Date): TasbehaResponse {
	const includeLateTheotokia = includesLateSundayTheotokiaParts(date)
	return {
		type: 'tasbeha',
		id: service.id,
		name: service.name,
		description: service.description,
		status: service.status,
		rite: {
			cycle: service.rite.cycle,
			dayTune: service.rite.dayTune,
			weekdays: service.rite.weekdays,
		},
		sections: service.sections
			.filter(
				(section) => section.availability !== 'resurrection-through-hathor' || includeLateTheotokia,
			)
			.map(({ availability: _availability, ...section }) => ({
				...section,
				type: 'prayer',
				role: 'all',
			})),
	}
}

/** The service prayed on `date`'s day of the week. */
export function getTasbehaForDate(
	date: Date = new Date(),
	translation: ServiceLanguage = 'en',
): TasbehaResponse {
	return resolve(inSeason(byWeekday[translation](date.getDay()), date, translation), date)
}

export function getTasbehaById(
	id: TasbehaServiceId,
	translation: ServiceLanguage = 'en',
	date: Date = new Date(),
): TasbehaResponse {
	return resolve(inSeason(byId[translation](id), date, translation), date)
}

export function getSundayTasbeha(
	translation: ServiceLanguage = 'en',
	date: Date = new Date(),
): TasbehaResponse {
	return getTasbehaById('sunday-midnight-praises', translation, date)
}

// Saturday's Praise is a Vespers Praise, so the day names do not map onto service
// ids by a single suffix.
const SERVICE_BY_DAY = {
	sunday: 'sunday-midnight-praises',
	monday: 'monday-midnight-praises',
	tuesday: 'tuesday-midnight-praises',
	wednesday: 'wednesday-midnight-praises',
	thursday: 'thursday-midnight-praises',
	friday: 'friday-midnight-praises',
	saturday: 'saturday-vespers-praises',
} as const satisfies Record<string, TasbehaServiceId>

export type TasbehaDay = keyof typeof SERVICE_BY_DAY
export const TASBEHA_DAYS = Object.keys(SERVICE_BY_DAY) as [TasbehaDay, ...TasbehaDay[]]

/** The Psalmody prayed on the named weekday. */
export function getTasbehaForDay(
	day: TasbehaDay,
	translation: ServiceLanguage = 'en',
	date: Date = new Date(),
): TasbehaResponse {
	return getTasbehaById(SERVICE_BY_DAY[day], translation, date)
}
