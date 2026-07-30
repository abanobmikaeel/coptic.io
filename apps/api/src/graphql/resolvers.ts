import { getLiturgicalName, gregorianToCoptic, localizeCopticDate } from '@coptic/core'
import { localizeReference } from '@coptic/data'
import { GraphQLError } from 'graphql'
import { getByCopticDate, warmTranslation } from '../models/readings'
import * as calendarService from '../services/calendar.service'
import * as celebrationsService from '../services/celebrations.service'
import * as fastingService from '../services/fasting.service'
import * as synaxariumService from '../services/synaxarium.service'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'
import {
	INVALID_DATE_MESSAGE,
	INVALID_YEAR_MESSAGE,
	isSupportedYear,
	parseDateInput,
} from '../utils/dateUtils'

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

const READING_REFERENCE_KEYS = [
	'Prophecies',
	'VPsalm',
	'VGospel',
	'MPsalm',
	'MGospel',
	'Pauline',
	'Catholic',
	'Acts',
	'LPsalm',
	'LGospel',
	'EPPsalm',
	'EPGospel',
] as const

const localizeReferenceObject = (reference: Record<string, unknown>, lang: string) => {
	const out: Record<string, unknown> = { ...reference }
	for (const key of READING_REFERENCE_KEYS) {
		if (typeof out[key] === 'string') out[key] = localizeReference(out[key] as string, lang)
	}
	return out
}

const toBibleTranslation = (lang?: string): 'en' | 'ar' | 'es' | 'cop' =>
	lang === 'ar' ? 'ar' : lang === 'es' ? 'es' : lang === 'cop' ? 'cop' : 'en'

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
		readings: async (
			_: unknown,
			{ date, detailed, lang }: { date?: string; detailed?: boolean; lang?: string },
		) => {
			const parsedDate = parseDate(date)
			const translation = toBibleTranslation(lang)
			if (detailed) await warmTranslation(translation)
			const data = getByCopticDate(parsedDate, detailed || false, translation)
			const celebrations = getStaticCelebrationsForDay(parsedDate)
			const fullDate = localizeCopticDate(gregorianToCoptic(parsedDate), translation)

			return {
				...data,
				...(data.reference
					? { reference: localizeReferenceObject(data.reference, translation) }
					: {}),
				...(data.season
					? { season: getLiturgicalName(data.season, translation), seasonKey: data.season }
					: {}),
				celebrations,
				fullDate,
			}
		},

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
