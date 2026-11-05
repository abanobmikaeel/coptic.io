import { z } from '@hono/zod-openapi'
import { BIBLE_TRANSLATIONS, type BibleTranslation } from '../types'
import { INVALID_YEAR_MESSAGE, isSupportedYear } from './dateUtils'

/**
 * Cache lifetime for responses that depend on the wall clock ("today", "the current
 * hour"), so the 12h edge cache never serves yesterday's answer.
 */
export const WALL_CLOCK_CACHE_CONTROL = 'public, max-age=120, s-maxage=120'

/** The Bible translation a `lang` input asks for; anything unrecognised reads English. */
export const parseTranslation = (lang?: string): BibleTranslation =>
	BIBLE_TRANSLATIONS.find((translation) => translation === lang) ?? 'en'

/** Languages the calendar, celebrations and fasting are named in. */
export const CALENDAR_LANGUAGES = ['en', 'ar', 'es'] as const
export type CalendarLanguage = (typeof CALENDAR_LANGUAGES)[number]

/** The calendar language a `lang` input asks for; anything unrecognised reads English. */
export const parseCalendarLanguage = (lang?: string): CalendarLanguage =>
	CALENDAR_LANGUAGES.find((language) => language === lang) ?? 'en'

/** A year path parameter, or null when it is not a year the API answers for. */
export const parseYear = (input: string): number | null => {
	const year = Number.parseInt(input, 10)
	return isSupportedYear(year) ? year : null
}

/**
 * A year path parameter as a route schema: handlers receive the number, and an
 * unsupported year answers 400 through the app's validation hook.
 */
export const yearParam = z
	.string()
	.transform((input, ctx) => {
		const year = parseYear(input)
		if (year === null) ctx.addIssue({ code: 'custom', message: INVALID_YEAR_MESSAGE })
		return year ?? z.NEVER
	})
	.openapi({ example: '2026' })
