import {
	getAllSeasonsForYear,
	getFastingPeriodsForYear,
	getLiturgicalDescription,
	getLiturgicalName,
	getLiturgicalSeasonForDate,
	isInFastingPeriod,
} from '@coptic/core'
import { format, isValid, parse } from 'date-fns'
import { Hono } from 'hono'

const season = new Hono()

// Get liturgical season for a specific date or today
season.get('/:date?', async (c) => {
	const dateParam = c.req.param('date')

	// Default to today
	let parsedDate = new Date()
	if (dateParam) {
		parsedDate = parse(dateParam, 'yyyy-MM-dd', new Date())
		if (!isValid(parsedDate)) {
			return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
		}
	}

	const lang = c.req.query('lang') || 'en'
	const currentSeason = getLiturgicalSeasonForDate(parsedDate)
	const isFasting = isInFastingPeriod(parsedDate)

	if (!currentSeason) {
		return c.json({
			date: format(parsedDate, 'yyyy-MM-dd'),
			season: getLiturgicalName('Ordinary Time', lang),
			description: getLiturgicalDescription(
				'Ordinary Time',
				'Regular liturgical time outside major seasons',
				lang,
			),
			isFasting: false,
		})
	}

	return c.json({
		date: format(parsedDate, 'yyyy-MM-dd'),
		season: getLiturgicalName(currentSeason.name, lang),
		description: getLiturgicalDescription(currentSeason.name, currentSeason.description, lang),
		startDate: format(currentSeason.startDate, 'yyyy-MM-dd'),
		endDate: format(currentSeason.endDate, 'yyyy-MM-dd'),
		isFasting,
		type: currentSeason.type,
	})
})

// Get all liturgical seasons for a year
season.get('/year/:year', async (c) => {
	const yearParam = c.req.param('year')
	const year = Number.parseInt(yearParam)

	if (Number.isNaN(year) || year < 1900 || year > 2199) {
		return c.json({ error: 'Invalid year. Must be between 1900 and 2199' }, 400)
	}

	const seasons = getAllSeasonsForYear(year)

	return c.json({
		year,
		seasons: seasons.map((s) => ({
			name: s.name,
			description: s.description,
			startDate: format(s.startDate, 'yyyy-MM-dd'),
			endDate: format(s.endDate, 'yyyy-MM-dd'),
			isFasting: s.isFasting,
			type: s.type,
		})),
	})
})

// Get all fasting periods for a year
season.get('/fasting/:year', async (c) => {
	const yearParam = c.req.param('year')
	const year = Number.parseInt(yearParam)

	if (Number.isNaN(year) || year < 1900 || year > 2199) {
		return c.json({ error: 'Invalid year. Must be between 1900 and 2199' }, 400)
	}

	const fastingPeriods = getFastingPeriodsForYear(year)

	return c.json({
		year,
		fastingPeriods: fastingPeriods.map((f) => ({
			name: f.name,
			description: f.description,
			startDate: format(f.startDate, 'yyyy-MM-dd'),
			endDate: format(f.endDate, 'yyyy-MM-dd'),
			type: f.type,
		})),
	})
})

export default season
