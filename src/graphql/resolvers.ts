import fromGregorian from '../utils/copticDate'
import { getByCopticDate } from '../models/readings'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'
import * as celebrationsService from '../services/celebrations.service'
import * as fastingService from '../services/fasting.service'
import * as synaxariumService from '../services/synaxarium.service'

export const resolvers = {
	Query: {
		// Calendar
		copticDate: (_: any, { date }: { date?: string }) => {
			const parsedDate = date ? new Date(date) : new Date()
			return fromGregorian(parsedDate)
		},

		// Readings
		readings: async (
			_: any,
			{ date, detailed }: { date?: string; detailed?: boolean }
		) => {
			const parsedDate = date ? new Date(date) : new Date()
			const data = await getByCopticDate(parsedDate, detailed || false)
			const celebrations = getStaticCelebrationsForDay(parsedDate)
			const copticDate = fromGregorian(parsedDate)

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

		celebrationsForDate: (_: any, { date }: { date?: string }) => {
			const parsedDate = date ? new Date(date) : new Date()
			return celebrationsService.getCelebrationsForDate(parsedDate)
		},

		upcomingCelebrations: (_: any, { days }: { days?: number }) => {
			return celebrationsService.getUpcomingCelebrations(days || 30)
		},

		// Fasting
		fastingForDate: (_: any, { date }: { date?: string }) => {
			const parsedDate = date ? new Date(date) : new Date()
			return fastingService.getFastingForDate(parsedDate)
		},

		fastingCalendar: (_: any, { year }: { year: number }) => {
			return fastingService.getFastingCalendar(year)
		},

		// Synaxarium
		synaxariumForDate: (
			_: any,
			{ date, detailed }: { date?: string; detailed?: boolean }
		) => {
			const parsedDate = date ? new Date(date) : new Date()
			return synaxariumService.getSynaxariumForDate(
				parsedDate,
				detailed || false
			)
		},

		searchSynaxarium: (
			_: any,
			{ query, limit }: { query: string; limit?: number }
		) => {
			return synaxariumService.searchSynaxarium(query, limit || 50)
		},
	},
}
