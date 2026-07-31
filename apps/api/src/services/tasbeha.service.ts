import { includesLateSundayTheotokiaParts } from '@coptic/core/liturgy'
import {
	getTasbehaService as getArabicTasbeha,
	getTasbehaServiceForWeekday as getArabicTasbehaForWeekday,
} from '@coptic/data/ar/tasbeha'
import {
	getTasbehaService as getCopticTasbeha,
	getTasbehaServiceForWeekday as getCopticTasbehaForWeekday,
} from '@coptic/data/cop/tasbeha'
import {
	getTasbehaService as getEnglishTasbeha,
	getTasbehaServiceForWeekday as getEnglishTasbehaForWeekday,
} from '@coptic/data/en/tasbeha'
import type {
	TasbehaCycle,
	TasbehaDayTune,
	TasbehaSectionKind,
	TasbehaServiceData,
	TasbehaServiceId,
	TasbehaSource,
} from '@coptic/data/en/tasbeha'

export type TasbehaTranslation = 'en' | 'ar' | 'cop'

export interface ResolvedTasbehaSection {
	id: string
	type: 'prayer'
	role: 'all'
	kind: TasbehaSectionKind
	title: string
	titleLanguage?: TasbehaTranslation
	content: string[]
	source: TasbehaSource
}

export interface ResolvedTasbehaService {
	type: 'tasbeha'
	id: TasbehaServiceId
	name: string
	description: string
	status: 'complete'
	rite: {
		cycle: TasbehaCycle
		dayTune: TasbehaDayTune
		weekdays: number[]
	}
	sections: ResolvedTasbehaSection[]
}

const byId: Record<TasbehaTranslation, (id?: TasbehaServiceId) => TasbehaServiceData> = {
	en: getEnglishTasbeha,
	ar: getArabicTasbeha,
	cop: getCopticTasbeha,
}

const byWeekday: Record<TasbehaTranslation, (weekday: number) => TasbehaServiceData> = {
	en: getEnglishTasbehaForWeekday,
	ar: getArabicTasbehaForWeekday,
	cop: getCopticTasbehaForWeekday,
}

// Parts 16–18 of the Sunday Theotokia are the only date-limited sections in the
// corpus; every other section is fixed for its day.
function resolve(service: TasbehaServiceData, date: Date): ResolvedTasbehaService {
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
	translation: TasbehaTranslation = 'en',
): ResolvedTasbehaService {
	return resolve(byWeekday[translation](date.getDay()), date)
}

export function getTasbehaById(
	id: TasbehaServiceId,
	translation: TasbehaTranslation = 'en',
	date: Date = new Date(),
): ResolvedTasbehaService {
	return resolve(byId[translation](id), date)
}

export function getSundayTasbeha(
	translation: TasbehaTranslation = 'en',
	date: Date = new Date(),
): ResolvedTasbehaService {
	return getTasbehaById('sunday-midnight-praises', translation, date)
}
