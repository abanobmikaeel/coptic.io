import { getReadingReferences } from './api'

/** True when the given liturgical season label refers to Great Lent. */
export const isLentSeason = (season?: string): boolean => !!season && /lent/i.test(season)

/** Whether today falls in Great Lent (used to surface Lent-only offerings). */
export async function isLentSeasonNow(): Promise<boolean> {
	try {
		const refs = await getReadingReferences()
		return isLentSeason(refs?.season)
	} catch {
		return false
	}
}
