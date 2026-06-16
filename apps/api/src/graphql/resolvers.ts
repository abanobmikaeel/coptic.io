import { gregorianToCoptic } from '@coptic/core'
import { getByCopticDate, warmTranslation } from '../models/readings'
import * as calendarService from '../services/calendar.service'
import * as celebrationsService from '../services/celebrations.service'
import * as fastingService from '../services/fasting.service'
import * as synaxariumService from '../services/synaxarium.service'
import type { BibleTranslation } from '../types'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'
import { parseLocalDate } from '../utils/dateUtils'

const toTranslation = (lang?: string): BibleTranslation =>
	lang === 'ar' ? 'ar' : lang === 'es' ? 'es' : lang === 'cop' ? 'cop' : 'en'

/**
 * Parse a YYYY-MM-DD argument as a local date (matching the REST routes).
 * `new Date("2026-02-22")` parses as UTC midnight, which shifts the day in
 * timezones behind UTC — using parseLocalDate keeps GraphQL and REST in sync.
 * Defaults to today when no date is supplied; throws on a malformed string.
 */
const parseDateArg = (date?: string): Date => {
	if (!date) return new Date()
	const parsed = parseLocalDate(date)
	if (!parsed) throw new Error('Invalid date format. Use YYYY-MM-DD')
	return parsed
}

export const resolvers = {
	Query: {
		// Calendar
		copticDate: (_: unknown, { date }: { date?: string }) => {
			return gregorianToCoptic(parseDateArg(date))
		},

		calendarMonth: (_: unknown, { year, month }: { year: number; month: number }) => {
			return calendarService.getCalendarMonth(year, month)
		},

		// Readings
		readings: async (
			_: unknown,
			{ date, detailed, lang }: { date?: string; detailed?: boolean; lang?: string },
		) => {
			const parsedDate = parseDateArg(date)
			const translation = toTranslation(lang)
			if (detailed) await warmTranslation(translation)
			const data = getByCopticDate(parsedDate, detailed || false, translation)
			const celebrations = getStaticCelebrationsForDay(parsedDate)
			const copticDate = gregorianToCoptic(parsedDate)

			return {
				...data,
				celebrations,
				fullDate: copticDate,
			}
		},

		// Celebrations
		allCelebrations: () => {
			return celebrationsService.getAllCelebrations()
		},

		celebrationsForDate: (_: unknown, { date }: { date?: string }) => {
			return celebrationsService.getCelebrationsForDate(parseDateArg(date))
		},

		upcomingCelebrations: (_: unknown, { days }: { days?: number }) => {
			return celebrationsService.getUpcomingCelebrations(days || 30)
		},

		// Fasting
		fastingForDate: (_: unknown, { date }: { date?: string }) => {
			return fastingService.getFastingForDate(parseDateArg(date))
		},

		fastingCalendar: (_: unknown, { year }: { year: number }) => {
			return fastingService.getFastingCalendar(year)
		},

		// Synaxarium
		synaxariumForDate: (_: unknown, { date, detailed }: { date?: string; detailed?: boolean }) => {
			return synaxariumService.getSynaxariumForDate(parseDateArg(date), detailed || false)
		},

		searchSynaxarium: (_: unknown, { query, limit }: { query: string; limit?: number }) => {
			return synaxariumService.searchSynaxarium(query, limit || 50)
		},
	},
}
