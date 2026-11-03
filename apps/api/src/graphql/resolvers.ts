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
import { type CalendarLanguage, parseCalendarLanguage, parseTranslation } from '../utils/request'

const badInput = (message: string) =>
	new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } })

const parseDate = (date?: string): Date => {
	try {
		return parseDateInput(date)
	} catch {
		throw badInput(INVALID_DATE_MESSAGE)
	}
}

const assertYear = (year: number) => {
	if (!isSupportedYear(year)) throw badInput(INVALID_YEAR_MESSAGE)
}

const MONTH_MESSAGE = 'Invalid month. Must be between 1 and 12'
const DAYS_MESSAGE = 'Days must be between 1 and 365'

type Lang<L> = { lang?: L }

export const resolvers = {
	Query: {
		// Calendar
		copticDate: (_: unknown, { date, lang }: { date?: string; lang?: string }) =>
			calendarService.getCopticDate(parseDate(date), parseCalendarLanguage(lang)),

		calendarMonth: (_: unknown, { year, month }: { year: number; month: number }) => {
			assertYear(year)
			if (!Number.isInteger(month) || month < 1 || month > 12) throw badInput(MONTH_MESSAGE)
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
		allCelebrations: () => celebrationsService.getAllCelebrations(),

		celebrationsForDate: (_: unknown, { date, lang }: { date?: string } & Lang<CalendarLanguage>) =>
			celebrationsService.getCelebrationsForDate(parseDate(date), lang),

		upcomingCelebrations: (
			_: unknown,
			{ days, lang }: { days?: number } & Lang<CalendarLanguage>,
		) => {
			if (days !== undefined && (days < 1 || days > 365)) throw badInput(DAYS_MESSAGE)
			return celebrationsService.getUpcomingCelebrations(days, lang)
		},

		// Fasting
		fastingForDate: (_: unknown, { date, lang }: { date?: string } & Lang<CalendarLanguage>) =>
			fastingService.getFastingForDate(parseDate(date), lang),

		fastingCalendar: (_: unknown, { year }: { year: number }) => {
			assertYear(year)
			return fastingService.getFastingCalendar(year)
		},

		// Synaxarium
		synaxariumForDate: (
			_: unknown,
			{ date, detailed, lang }: { date?: string; detailed?: boolean } & Lang<'en' | 'ar'>,
		) => synaxariumService.getSynaxariumForDate(parseDate(date), detailed ?? false, lang),

		searchSynaxarium: (_: unknown, { query, limit }: { query: string; limit?: number }) =>
			synaxariumService.searchSynaxarium(query, limit ?? 50),
	},
}
