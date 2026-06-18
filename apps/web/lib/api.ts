import { API_BASE_URL } from '@/config'
import type {
	CalendarData,
	CalendarMonth,
	Celebration,
	FastingInfo,
	UpcomingCelebration,
} from './types'

async function fetchApi<T>(endpoint: string, revalidate = 3600): Promise<T | null> {
	try {
		const res = await fetch(`${API_BASE_URL}${endpoint}`, {
			next: { revalidate }, // Cache for 1 hour by default
		})
		if (!res.ok) return null
		return res.json()
	} catch (error) {
		console.error(`API error (${endpoint}):`, error)
		return null
	}
}

const langQuery = (lang?: string) => (lang && lang !== 'en' ? `?lang=${lang}` : '')

export const getCalendarData = (date?: string, lang?: string) =>
	fetchApi<CalendarData>(`${date ? `/calendar/${date}` : '/calendar'}${langQuery(lang)}`)

export const getTodayCelebrations = (date?: string, lang?: string) => {
	const d = new Date()
	const today =
		date ||
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
	return fetchApi<Celebration[]>(`/celebrations/${today}${langQuery(lang)}`)
}

export const getUpcomingCelebrations = (days = 60, lang?: string) =>
	fetchApi<UpcomingCelebration[]>(
		`/celebrations/upcoming/list?days=${days}${lang && lang !== 'en' ? `&lang=${lang}` : ''}`,
	)

export const getCalendarMonth = (year: number, month: number) =>
	fetchApi<CalendarMonth>(`/calendar/month/${year}/${month}`)

// Synaxarium
import type { SynaxariumEntry, SynaxariumSearchResult } from './types'

export const searchSynaxarium = (query: string, lang?: string) =>
	fetchApi<SynaxariumSearchResult[]>(
		`/synaxarium/search/query?q=${encodeURIComponent(query)}${lang ? `&lang=${lang}` : ''}`,
	)

export const getSynaxariumByDate = (date: string, detailed = true, lang?: string) => {
	const params = new URLSearchParams()
	if (detailed) params.set('detailed', 'true')
	if (lang) params.set('lang', lang)
	const query = params.toString()
	return fetchApi<SynaxariumEntry[]>(`/synaxarium/${date}${query ? `?${query}` : ''}`)
}

export const getSynaxariumByCopticDate = (copticDate: string, detailed = true, lang?: string) => {
	const params = new URLSearchParams()
	if (detailed) params.set('detailed', 'true')
	if (lang) params.set('lang', lang)
	const query = params.toString()
	return fetchApi<SynaxariumEntry[]>(
		`/synaxarium/coptic/${encodeURIComponent(copticDate)}${query ? `?${query}` : ''}`,
	)
}

// Get calendar data for a specific date (includes Coptic date)
export const getCalendarDate = (date: string) =>
	fetchApi<{ dateString: string; day: number; month: number; monthString: string }>(
		`/calendar/${date}`,
	)

// Reading references (non-detailed endpoint)
export interface ReadingReferences {
	reference?: {
		LPsalm?: string
		LGospel?: string
	}
	/** Localized season name (depends on lang). */
	season?: string
	/** Canonical English season identity — branch on this, not `season`. */
	seasonKey?: string
	seasonDay?: string
	Synaxarium?: string
}

export const getReadingReferences = (date?: string, lang?: string) => {
	const d = new Date()
	const today =
		date ||
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
	return fetchApi<ReadingReferences>(`/readings/${today}${langQuery(lang)}`)
}

export const getFastingForDate = (date?: string, lang?: string) =>
	fetchApi<FastingInfo>(`${date ? `/fasting/${date}` : '/fasting'}${langQuery(lang)}`)
