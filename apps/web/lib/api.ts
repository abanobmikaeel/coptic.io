import { toDateKey } from '@coptic/core'
import { api, cacheFor, dataOrNull } from './client'

// Cache for 1 hour by default
const HOUR = cacheFor(3600)

type DisplayLang = 'en' | 'ar' | 'es'
const displayLang = (lang?: string): DisplayLang | undefined =>
	lang === 'ar' || lang === 'es' ? lang : undefined

export const getCalendarData = (date?: string, lang?: string) =>
	dataOrNull(
		date
			? api.GET('/api/calendar/{date}', { params: { path: { date }, query: { lang } }, ...HOUR })
			: api.GET('/api/calendar', { params: { query: { lang } }, ...HOUR }),
	)

export const getTodayCelebrations = (date?: string, lang?: string) =>
	dataOrNull(
		api.GET('/api/celebrations/{date}', {
			params: { path: { date: date || toDateKey(new Date()) }, query: { lang: displayLang(lang) } },
			...HOUR,
		}),
	)

export const getUpcomingCelebrations = (days = 60, lang?: string) =>
	dataOrNull(
		api.GET('/api/celebrations/upcoming/list', {
			params: { query: { days, lang: displayLang(lang) } },
			...HOUR,
		}),
	)

export const getCalendarMonth = (year: number, month: number) =>
	dataOrNull(
		api.GET('/api/calendar/month/{year}/{month}', {
			params: { path: { year: String(year), month: String(month) } },
			...HOUR,
		}),
	)

// Synaxarium

export const searchSynaxarium = (query: string) =>
	dataOrNull(api.GET('/api/synaxarium/search/query', { params: { query: { q: query } }, ...HOUR }))

const synaxariumLang = (lang?: string) => (lang === 'ar' ? 'ar' : lang === 'en' ? 'en' : undefined)

export const getSynaxariumByDate = (date: string, detailed = true, lang?: string) =>
	dataOrNull(
		api.GET('/api/synaxarium/{date}', {
			params: {
				path: { date },
				query: { detailed: detailed ? 'true' : undefined, lang: synaxariumLang(lang) },
			},
			...HOUR,
		}),
	)

export const getSynaxariumByCopticDate = (copticDate: string, detailed = true, lang?: string) =>
	dataOrNull(
		api.GET('/api/synaxarium/coptic/{copticDate}', {
			params: {
				path: { copticDate },
				query: { detailed: detailed ? 'true' : undefined, lang: synaxariumLang(lang) },
			},
			...HOUR,
		}),
	)

// Get calendar data for a specific date (includes Coptic date)
export const getCalendarDate = (date: string) =>
	dataOrNull(api.GET('/api/calendar/{date}', { params: { path: { date } }, ...HOUR }))

// Reading references (non-detailed endpoint)
export const getReadingReferences = (date?: string, lang?: string) =>
	dataOrNull(
		api.GET('/api/readings/{date}', {
			params: { path: { date: date || toDateKey(new Date()) }, query: { lang } },
			...HOUR,
		}),
	)

export type ReadingReferences = NonNullable<Awaited<ReturnType<typeof getReadingReferences>>>

export const getFastingForDate = (date?: string, lang?: string) =>
	dataOrNull(
		date
			? api.GET('/api/fasting/{date}', {
					params: { path: { date }, query: { lang: displayLang(lang) } },
					...HOUR,
				})
			: api.GET('/api/fasting', { params: { query: { lang: displayLang(lang) } }, ...HOUR }),
	)
