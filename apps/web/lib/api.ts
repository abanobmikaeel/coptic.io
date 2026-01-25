import { API_BASE_URL } from '@/config'
import type { CalendarData, CalendarMonth, Celebration, UpcomingCelebration } from './types'

async function fetchApi<T>(endpoint: string): Promise<T | null> {
	try {
		const res = await fetch(`${API_BASE_URL}${endpoint}`, { cache: 'no-store' })
		if (!res.ok) return null
		return res.json()
	} catch (error) {
		console.error(`API error (${endpoint}):`, error)
		return null
	}
}

export const getCalendarData = () => fetchApi<CalendarData>('/calendar')

export const getTodayCelebrations = () => {
	const today = new Date().toISOString().split('T')[0]
	return fetchApi<Celebration[]>(`/celebrations/${today}`)
}

export const getUpcomingCelebrations = (days = 60) =>
	fetchApi<UpcomingCelebration[]>(`/celebrations/upcoming/list?days=${days}`)

export const getCalendarMonth = (year: number, month: number) =>
	fetchApi<CalendarMonth>(`/calendar/month/${year}/${month}`)
