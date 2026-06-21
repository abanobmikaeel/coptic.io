import { gregorianToCoptic } from '@coptic/core'
import { getByCopticDate, warmTranslation } from '../models/readings'
import * as calendarService from '../services/calendar.service'
import * as celebrationsService from '../services/celebrations.service'
import * as fastingService from '../services/fasting.service'
import * as synaxariumService from '../services/synaxarium.service'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'
import { parseDateInput } from '../utils/dateUtils'

export const resolvers = {
	Query: {
		// Calendar
		copticDate: (_: unknown, { date }: { date?: string }) => {
			const parsedDate = parseDateInput(date)
			return gregorianToCoptic(parsedDate)
		},

		calendarMonth: (_: unknown, { year, month }: { year: number; month: number }) => {
			return calendarService.getCalendarMonth(year, month)
		},

		// Readings
		readings: async (_: unknown, { date, detailed }: { date?: string; detailed?: boolean }) => {
			const parsedDate = parseDateInput(date)
			if (detailed) await warmTranslation('en')
			const data = getByCopticDate(parsedDate, detailed || false)
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
			const parsedDate = parseDateInput(date)
			return celebrationsService.getCelebrationsForDate(parsedDate)
		},

		upcomingCelebrations: (_: unknown, { days }: { days?: number }) => {
			return celebrationsService.getUpcomingCelebrations(days || 30)
		},

		// Fasting
		fastingForDate: (_: unknown, { date }: { date?: string }) => {
			const parsedDate = parseDateInput(date)
			return fastingService.getFastingForDate(parsedDate)
		},

		fastingCalendar: (_: unknown, { year }: { year: number }) => {
			return fastingService.getFastingCalendar(year)
		},

		// Synaxarium
		synaxariumForDate: (_: unknown, { date, detailed }: { date?: string; detailed?: boolean }) => {
			const parsedDate = parseDateInput(date)
			return synaxariumService.getSynaxariumForDate(parsedDate, detailed || false)
		},

		searchSynaxarium: (_: unknown, { query, limit }: { query: string; limit?: number }) => {
			return synaxariumService.searchSynaxarium(query, limit || 50)
		},
	},
}
