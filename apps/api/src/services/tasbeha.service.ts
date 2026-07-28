import { includesLateSundayTheotokiaParts } from '@coptic/core/liturgy'
import { getTasbehaService as getArabicTasbeha } from '@coptic/data/ar/tasbeha'
import { getTasbehaService as getCopticTasbeha } from '@coptic/data/cop/tasbeha'
import { getTasbehaService as getEnglishTasbeha } from '@coptic/data/en/tasbeha'
import type { TasbehaDayTune, TasbehaSectionKind, TasbehaSource } from '@coptic/data/en/tasbeha'

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
	id: 'sunday-midnight-praises'
	name: string
	description: string
	status: 'complete'
	rite: {
		cycle: 'annual'
		dayTune: TasbehaDayTune
		weekdays: number[]
	}
	sections: ResolvedTasbehaSection[]
}

export function getSundayTasbeha(
	translation: TasbehaTranslation = 'en',
	date: Date = new Date(),
): ResolvedTasbehaService {
	const service =
		translation === 'ar'
			? getArabicTasbeha()
			: translation === 'cop'
				? getCopticTasbeha()
				: getEnglishTasbeha()
	const includeLateTheotokia = includesLateSundayTheotokiaParts(date)
	return {
		type: 'tasbeha',
		id: service.id,
		name: service.name,
		description: service.description,
		status: service.status,
		rite: {
			cycle: 'annual',
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
