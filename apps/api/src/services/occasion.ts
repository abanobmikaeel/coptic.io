import { getLiturgicalContext } from '@coptic/core'
import type { OccasionContext } from '@coptic/data/content'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'

// Normalize a celebration name into a stable key the JSON block conditions can match.
export const toCommemorationKey = (name: string): string =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')

/**
 * The occasion a service is prayed on, for conditional block resolution.
 *
 * The calendar facts come from @coptic/core; the day's commemorations and feasts come
 * from the existing celebration calendar rather than being recomputed — e.g. every
 * Coptic 29th → "annunciation-nativity-and-resurrection", Tobi 6 → "circumcision-feast".
 * Moveable feasts ("pentecost") join the fixed ones. Commemorations the reader selected
 * (their church's patron saint) are composed on top.
 */
export function buildOccasion(date: Date, selectedCommemorations: string[] = []): OccasionContext {
	const liturgical = getLiturgicalContext(date)
	const celebrations = getStaticCelebrationsForDay(date) ?? []
	return {
		dayTune: liturgical.dayTune,
		season: liturgical.natureSeason,
		festalSeason: liturgical.festalSeason,
		weekday: liturgical.dayOfWeek,
		commemorations: [
			...celebrations.map((c) => toCommemorationKey(c.name)),
			...selectedCommemorations,
		],
		feasts: [
			...celebrations
				.filter((c) => c.type.toLowerCase().includes('feast'))
				.map((c) => toCommemorationKey(c.name)),
			...liturgical.moveableFeasts
				.filter((f) => f.type !== 'fast')
				.map((f) => toCommemorationKey(f.name)),
		],
	}
}
