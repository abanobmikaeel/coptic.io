import type { ContentLine, ServiceLanguage } from '@coptic/data/content'
import type { AgpeyaHourId } from '@coptic/data/en/agpeya'
import { GraphQLError } from 'graphql'
import * as agpeyaService from '../services/agpeya.service'
import { warmTranslation } from '../services/bible/data'
import * as calendarService from '../services/calendar.service'
import * as celebrationsService from '../services/celebrations.service'
import { getDailyVerse } from '../services/daily-verse.service'
import * as fastingService from '../services/fasting.service'
import { getAvailableCommemorations, getIncenseForDate } from '../services/incense.service'
import { getLentDay, getLentSchedule } from '../services/lent.service'
import { getLiturgyForDate } from '../services/liturgy.service'
import { getReadingsForDate } from '../services/readings.service'
import { type SearchCategory, search } from '../services/search'
import { getFastingPeriods, getSeasonForDate, getSeasonsForYear } from '../services/season.service'
import * as synaxariumService from '../services/synaxarium.service'
import {
	type TasbehaDay,
	getSundayTasbeha,
	getTasbehaForDate,
	getTasbehaForDay,
} from '../services/tasbeha.service'
import type { BibleTranslation } from '../types'
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
type AgpeyaArgs = Lang<BibleTranslation> & { psalms?: agpeyaService.PsalmSource }

// Scripture loads on demand in Workers, so every query that prints it warms the
// translation first, as the REST routes do through the bibleTranslation middleware.
const withBible = async <T>(lang: BibleTranslation, read: () => T): Promise<T> => {
	await warmTranslation(lang)
	return read()
}

// REST sends a line said by everyone as a plain string; GraphQL types every line
const line = (value: string | ContentLine): ContentLine =>
	typeof value === 'string' ? { text: value } : value

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

		// Season
		season: (_: unknown, { date, lang }: { date?: string; lang?: string }) =>
			getSeasonForDate(parseDate(date), parseCalendarLanguage(lang)),

		seasonsForYear: (_: unknown, { year }: { year: number }) => {
			assertYear(year)
			return getSeasonsForYear(year)
		},

		fastingPeriods: (_: unknown, { year }: { year: number }) => {
			assertYear(year)
			return getFastingPeriods(year)
		},

		// Lent
		lentSchedule: (_: unknown, { year = new Date().getFullYear() }: { year?: number }) => {
			assertYear(year)
			return getLentSchedule(year)
		},

		lentDay: (
			_: unknown,
			{ date, detailed, lang }: { date?: string; detailed?: boolean; lang?: string },
		) => getLentDay(parseDate(date), detailed ?? false, parseTranslation(lang)),

		// Search
		search: (
			_: unknown,
			{
				query,
				limit = 5,
				categories,
			}: { query: string; limit?: number; categories?: SearchCategory[] },
		) => {
			if (!query.trim()) throw badInput('Search query is required')
			if (limit < 1 || limit > 50) throw badInput('Limit must be between 1 and 50')
			return search({ query, limit, categories })
		},

		// Agpeya
		agpeyaHour: (
			_: unknown,
			{
				hour,
				lang = 'en',
				psalms,
				includeSections,
			}: AgpeyaArgs & { hour: AgpeyaHourId; includeSections?: boolean },
		) =>
			withBible(lang, () =>
				agpeyaService.getAgpeyaHour(hour, lang, psalms, { sections: includeSections ?? false }),
			),

		currentAgpeyaHour: (_: unknown, { lang = 'en', psalms }: AgpeyaArgs) =>
			withBible(lang, () =>
				agpeyaService.getAgpeyaHour(agpeyaService.getCurrentHour(), lang, psalms),
			),

		agpeyaHours: (_: unknown, { lang = 'en', psalms }: AgpeyaArgs) =>
			withBible(lang, () => agpeyaService.getAllHours(lang, psalms)),

		agpeyaWatch: (_: unknown, { watch, lang = 'en', psalms }: AgpeyaArgs & { watch: number }) => {
			if (![1, 2, 3].includes(watch)) throw badInput('Watch must be 1, 2 or 3')
			const id = String(watch) as agpeyaService.MidnightWatchId
			return withBible(lang, () => agpeyaService.getMidnightWatch(id, lang, psalms))
		},

		agpeyaTranslations: () => agpeyaService.getAvailableTranslations(),

		// Incense and the Liturgy
		incense: (
			_: unknown,
			{
				time,
				date,
				lang = 'en',
				commemorations = [],
			}: Lang<ServiceLanguage> & {
				time: 'evening' | 'morning'
				date?: string
				commemorations?: string[]
			},
		) => withBible(lang, () => getIncenseForDate(parseDate(date), time, lang, commemorations)),

		incenseCommemorations: () => getAvailableCommemorations('evening'),

		liturgy: (_: unknown, { date, lang = 'en' }: { date?: string } & Lang<ServiceLanguage>) =>
			withBible(lang, () => getLiturgyForDate(parseDate(date), 'basil', lang)),

		// Tasbeha
		tasbeha: (_: unknown, { date, lang }: { date?: string } & Lang<ServiceLanguage>) =>
			getTasbehaForDate(parseDate(date), lang),

		sundayTasbeha: (_: unknown, { date, lang }: { date?: string } & Lang<ServiceLanguage>) =>
			getSundayTasbeha(lang, parseDate(date)),

		tasbehaForDay: (
			_: unknown,
			{ day, date, lang }: { day: TasbehaDay; date?: string } & Lang<ServiceLanguage>,
		) => getTasbehaForDay(day, lang, parseDate(date)),
	},

	ContentLine: {
		text: (value: string | ContentLine) => line(value).text,
		speaker: (value: string | ContentLine) => line(value).speaker,
		isRubric: (value: string | ContentLine) => line(value).isRubric,
		isResponse: (value: string | ContentLine) => line(value).isResponse,
		coptic: (value: string | ContentLine) => line(value).coptic,
	},
}
