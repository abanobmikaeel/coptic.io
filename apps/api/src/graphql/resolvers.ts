import { gregorianToCoptic } from '@coptic/core'
import { GraphQLError } from 'graphql'
import * as calendarService from '../services/calendar.service'
import * as celebrationsService from '../services/celebrations.service'
import { getDailyVerse } from '../services/daily-verse.service'
import * as fastingService from '../services/fasting.service'
import { getReadingsForDate } from '../services/readings.service'
import * as synaxariumService from '../services/synaxarium.service'
import {
	INVALID_DATE_MESSAGE,
	INVALID_YEAR_MESSAGE,
	isSupportedYear,
	parseDateInput,
} from '../utils/dateUtils'
import { parseTranslation } from '../utils/request'

const parseDate = (date?: string): Date => {
	try {
		return parseDateInput(date)
	} catch {
		throw new GraphQLError(INVALID_DATE_MESSAGE, {
			extensions: { code: 'BAD_USER_INPUT' },
		})
	}
}

const assertYear = (year: number) => {
	if (!isSupportedYear(year)) {
		throw new GraphQLError(INVALID_YEAR_MESSAGE, {
			extensions: { code: 'BAD_USER_INPUT' },
		})
	}
}

export const resolvers = {
	Query: {
		// Calendar
		copticDate: (_: unknown, { date }: { date?: string }) => {
			const parsedDate = parseDate(date)
			return gregorianToCoptic(parsedDate)
		},

		calendarMonth: (_: unknown, { year, month }: { year: number; month: number }) => {
			assertYear(year)
			return calendarService.getCalendarMonth(year, month)
		},

		// Readings
		readings: (
			_: unknown,
			{ date, detailed, lang }: { date?: string; detailed?: boolean; lang?: string },
		) => getReadingsForDate(parseDate(date), detailed ?? false, parseTranslation(lang)),

		dailyVerse: (_: unknown, { date, lang }: { date?: string; lang?: string }) =>
			getDailyVerse(parseDate(date), parseTranslation(lang)),

		// Celebrations
		allCelebrations: () => {
			return celebrationsService.getAllCelebrations()
		},

		celebrationsForDate: (_: unknown, { date }: { date?: string }) => {
			const parsedDate = parseDate(date)
			return celebrationsService.getCelebrationsForDate(parsedDate)
		},

		upcomingCelebrations: (_: unknown, { days }: { days?: number }) => {
			return celebrationsService.getUpcomingCelebrations(days ?? 30)
		},

		// Fasting
		fastingForDate: (_: unknown, { date }: { date?: string }) => {
			const parsedDate = parseDate(date)
			return fastingService.getFastingForDate(parsedDate)
		},

		fastingCalendar: (_: unknown, { year }: { year: number }) => {
			assertYear(year)
			return fastingService.getFastingCalendar(year)
		},

		// Synaxarium
		synaxariumForDate: (_: unknown, { date, detailed }: { date?: string; detailed?: boolean }) => {
			const parsedDate = parseDate(date)
			return synaxariumService.getSynaxariumForDate(parsedDate, detailed || false)
		},

		searchSynaxarium: (_: unknown, { query, limit }: { query: string; limit?: number }) => {
			return synaxariumService.searchSynaxarium(query, limit ?? 50)
		},
	},
}
