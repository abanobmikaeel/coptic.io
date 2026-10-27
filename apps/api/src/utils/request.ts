import { BIBLE_TRANSLATIONS, type BibleTranslation } from '../types'
import { isSupportedYear } from './dateUtils'

/**
 * Cache lifetime for responses that depend on the wall clock ("today", "the current
 * hour"), so the 12h edge cache never serves yesterday's answer.
 */
export const WALL_CLOCK_CACHE_CONTROL = 'public, max-age=120, s-maxage=120'

/** The Bible translation a `lang` input asks for; anything unrecognised reads English. */
export const parseTranslation = (lang?: string): BibleTranslation =>
	BIBLE_TRANSLATIONS.find((translation) => translation === lang) ?? 'en'

/** A year path parameter, or null when it is not a year the API answers for. */
export const parseYear = (input: string): number | null => {
	const year = Number.parseInt(input, 10)
	return isSupportedYear(year) ? year : null
}
