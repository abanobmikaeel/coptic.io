import {
	getAllSeasonsForYear,
	getFastingPeriodsForYear,
	getLiturgicalDescription,
	getLiturgicalName,
	getLiturgicalSeasonForDate,
	isInFastingPeriod,
} from '@coptic/core'
import { format } from 'date-fns'
import { Hono } from 'hono'
import { requestDate } from '../middleware/request'
import { INVALID_YEAR_MESSAGE } from '../utils/dateUtils'
import { parseYear } from '../utils/request'

const season = new Hono()

// Get liturgical season for a specific date or today
season.get('/:date?', requestDate(), (c) => {
	const { date } = c.var
	const langQuery = c.req.query('lang')
	const lang = langQuery && ['en', 'ar', 'es'].includes(langQuery) ? langQuery : 'en'
	const currentSeason = getLiturgicalSeasonForDate(date)
	const isFasting = isInFastingPeriod(date)

	if (!currentSeason) {
		return c.json({
			date: format(date, 'yyyy-MM-dd'),
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
		date: format(date, 'yyyy-MM-dd'),
		season: getLiturgicalName(currentSeason.name, lang),
		description: getLiturgicalDescription(currentSeason.name, currentSeason.description, lang),
		startDate: format(currentSeason.startDate, 'yyyy-MM-dd'),
		endDate: format(currentSeason.endDate, 'yyyy-MM-dd'),
		isFasting,
		type: currentSeason.type,
	})
})

// Get all liturgical seasons for a year
season.get('/year/:year', (c) => {
	const year = parseYear(c.req.param('year'))
	if (!year) return c.json({ error: INVALID_YEAR_MESSAGE }, 400)

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
season.get('/fasting/:year', (c) => {
	const year = parseYear(c.req.param('year'))
	if (!year) return c.json({ error: INVALID_YEAR_MESSAGE }, 400)

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
