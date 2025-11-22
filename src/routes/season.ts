import { Hono } from 'hono'
import {
	getLiturgicalSeasonForDate,
	getAllSeasonsForYear,
	isInFastingPeriod,
	getFastingPeriodsForYear,
} from '../utils/calculations/getLiturgicalSeason'

const season = new Hono()

// Get liturgical season for a specific date or today
season.get('/:date?', async (c) => {
	try {
		const dateParam = c.req.param('date')

		// Default to today
		let parsedDate = new Date()
		if (dateParam) {
			parsedDate = new Date(dateParam)
			// Validate date
			if (isNaN(parsedDate.getTime())) {
				return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
			}
		}

		const season = getLiturgicalSeasonForDate(parsedDate)
		const isFasting = isInFastingPeriod(parsedDate)

		if (!season) {
			return c.json({
				date: parsedDate.toISOString().split('T')[0],
				season: 'Ordinary Time',
				description: 'Regular liturgical time outside major seasons',
				isFasting: false,
			})
		}

		return c.json({
			date: parsedDate.toISOString().split('T')[0],
			season: season.name,
			description: season.description,
			startDate: season.startDate.toISOString().split('T')[0],
			endDate: season.endDate.toISOString().split('T')[0],
			isFasting,
			type: season.type,
		})
	} catch (error) {
		console.error('Error fetching liturgical season:', error)
		return c.json(
			{
				error:
					error instanceof Error ? error.message : 'Failed to fetch liturgical season',
			},
			500
		)
	}
})

// Get all liturgical seasons for a year
season.get('/year/:year', async (c) => {
	try {
		const yearParam = c.req.param('year')
		const year = parseInt(yearParam)

		if (isNaN(year) || year < 1900 || year > 2199) {
			return c.json(
				{ error: 'Invalid year. Must be between 1900 and 2199' },
				400
			)
		}

		const seasons = getAllSeasonsForYear(year)

		return c.json({
			year,
			seasons: seasons.map((s) => ({
				name: s.name,
				description: s.description,
				startDate: s.startDate.toISOString().split('T')[0],
				endDate: s.endDate.toISOString().split('T')[0],
				isFasting: s.isFasting,
				type: s.type,
			})),
		})
	} catch (error) {
		console.error('Error fetching seasons for year:', error)
		return c.json(
			{
				error: error instanceof Error ? error.message : 'Failed to fetch seasons',
			},
			500
		)
	}
})

// Get all fasting periods for a year
season.get('/fasting/:year', async (c) => {
	try {
		const yearParam = c.req.param('year')
		const year = parseInt(yearParam)

		if (isNaN(year) || year < 1900 || year > 2199) {
			return c.json(
				{ error: 'Invalid year. Must be between 1900 and 2199' },
				400
			)
		}

		const fastingPeriods = getFastingPeriodsForYear(year)

		return c.json({
			year,
			fastingPeriods: fastingPeriods.map((f) => ({
				name: f.name,
				description: f.description,
				startDate: f.startDate.toISOString().split('T')[0],
				endDate: f.endDate.toISOString().split('T')[0],
				type: f.type,
			})),
		})
	} catch (error) {
		console.error('Error fetching fasting periods:', error)
		return c.json(
			{
				error:
					error instanceof Error ? error.message : 'Failed to fetch fasting periods',
			},
			500
		)
	}
})

export default season
