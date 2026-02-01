import {
	type AgpeyaHour,
	type AgpeyaHourId,
	getAgpeyaHour as getAgpeyaHourFromData,
	getAgpeyaHourIds,
	getAllAgpeyaHours,
} from '@coptic/data/en'

export type {
	AgpeyaHour,
	AgpeyaHourId,
	AgpeyaVerse,
	AgpeyaPsalm,
	AgpeyaGospel,
	AgpeyaPrayerSection,
	AgpeyaLitany,
} from '@coptic/data/en'

export function getAgpeyaHour(hourId: AgpeyaHourId): AgpeyaHour | null {
	return getAgpeyaHourFromData(hourId)
}

export function getAllHours(): AgpeyaHour[] {
	return getAllAgpeyaHours()
}

export function getHourIds(): AgpeyaHourId[] {
	return getAgpeyaHourIds()
}

export function getCurrentHour(): AgpeyaHourId {
	const currentHour = new Date().getHours()

	// Map hours to prayer times
	if (currentHour >= 0 && currentHour < 6) return 'midnight'
	if (currentHour >= 6 && currentHour < 9) return 'prime'
	if (currentHour >= 9 && currentHour < 12) return 'terce'
	if (currentHour >= 12 && currentHour < 15) return 'sext'
	if (currentHour >= 15 && currentHour < 18) return 'none'
	if (currentHour >= 18 && currentHour < 21) return 'vespers'
	return 'compline'
}
