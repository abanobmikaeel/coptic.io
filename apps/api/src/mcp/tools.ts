import { z } from 'zod'

/**
 * The MCP tools exposed at /mcp. Each tool maps its arguments onto an existing
 * REST route, so validation, localization and error envelopes have one owner:
 * the route. Adding a tool means adding an entry here, not new behavior.
 */

const date = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/)
	.optional()
	.describe(
		"Gregorian date as YYYY-MM-DD. Omit for today in UTC; pass the user's local date when you know it.",
	)
const year = z.number().int().describe('Gregorian year, e.g. 2026')
const displayLang = z
	.enum(['en', 'ar', 'es'])
	.optional()
	.describe('Language of names and descriptions (default en)')
const textLang = z
	.enum(['en', 'ar', 'es', 'cop'])
	.optional()
	.describe('Language of the text: en, ar, es, or cop for Coptic (default en)')

type QueryValue = string | number | boolean | undefined

/** Build a route path, dropping unset query parameters. */
export const toPath = (path: string, query: Record<string, QueryValue> = {}): string => {
	const params = new URLSearchParams()
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined) params.set(key, String(value))
	}
	const qs = params.toString()
	return qs ? `${path}?${qs}` : path
}

const segment = (value: string | number | undefined): string =>
	value === undefined ? '' : `/${encodeURIComponent(value)}`

export interface ToolDefinition<Shape extends z.ZodRawShape = z.ZodRawShape> {
	name: string
	title: string
	description: string
	inputSchema: Shape
	path: (args: z.infer<z.ZodObject<Shape>>) => string
	/** Narrow the route's response when it carries more than a model needs. */
	select?: (body: Record<string, unknown>) => unknown
}

const tool = <Shape extends z.ZodRawShape>(definition: ToolDefinition<Shape>) =>
	definition as unknown as ToolDefinition

export const tools: ToolDefinition[] = [
	tool({
		name: 'get_coptic_date',
		title: 'Coptic date',
		description: 'Convert a Gregorian date to its date on the Coptic calendar.',
		inputSchema: { date, lang: displayLang },
		path: (a) => toPath(`/api/calendar${segment(a.date)}`, { lang: a.lang }),
	}),
	tool({
		name: 'get_calendar_month',
		title: 'Calendar month',
		description:
			'A Gregorian month, day by day, with each Coptic date and whether it is a fasting day.',
		inputSchema: { year, month: z.number().int().min(1).max(12).describe('Month, 1-12') },
		path: (a) => `/api/calendar/month/${a.year}/${a.month}`,
	}),
	tool({
		name: 'get_daily_readings',
		title: 'Daily readings',
		description:
			'The Katameros readings for a day: Vespers, Matins, Pauline and Catholic Epistles, Acts, Psalm and Gospel of the Liturgy. Returns references only unless includeText is true.',
		inputSchema: {
			date,
			lang: textLang,
			includeText: z.boolean().optional().describe('Include the full Scripture text'),
		},
		path: (a) =>
			toPath(`/api/readings${segment(a.date)}`, {
				lang: a.lang,
				detailed: a.includeText || undefined,
			}),
	}),
	tool({
		name: 'get_fasting',
		title: 'Fasting status',
		description: 'Whether a day is a fasting day in the Coptic Orthodox Church, and which fast.',
		inputSchema: { date, lang: displayLang },
		path: (a) => toPath(`/api/fasting${segment(a.date)}`, { lang: a.lang }),
	}),
	tool({
		name: 'get_fasting_calendar',
		title: 'Fasting calendar',
		description: 'Every fasting day in a Gregorian year.',
		inputSchema: { year },
		path: (a) => `/api/fasting/calendar/${a.year}`,
	}),
	tool({
		name: 'get_liturgical_season',
		title: 'Liturgical season',
		description:
			'The liturgical season a day falls in (for example Great Lent, the Holy Fifty Days, Kiahk), with its start and end dates.',
		inputSchema: { date, lang: displayLang },
		path: (a) => toPath(`/api/season${segment(a.date)}`, { lang: a.lang }),
	}),
	tool({
		name: 'get_fasting_periods',
		title: 'Fasting periods',
		description: 'The fasting periods of a Gregorian year with their start and end dates.',
		inputSchema: { year },
		path: (a) => `/api/season/fasting/${a.year}`,
	}),
	tool({
		name: 'get_celebrations',
		title: 'Feasts on a day',
		description: 'Feasts and celebrations that fall on a day.',
		inputSchema: { date, lang: displayLang },
		path: (a) => toPath(`/api/celebrations${segment(a.date)}`, { lang: a.lang }),
	}),
	tool({
		name: 'get_upcoming_celebrations',
		title: 'Upcoming feasts',
		description: 'Feasts and celebrations in the coming days, counted from today in UTC.',
		inputSchema: {
			days: z.number().int().min(1).max(365).optional().describe('Days ahead (default 30)'),
			lang: displayLang,
		},
		path: (a) => toPath('/api/celebrations/upcoming/list', { days: a.days, lang: a.lang }),
	}),
	tool({
		name: 'get_synaxarium',
		title: 'Synaxarium',
		description:
			'The saints and events commemorated in the Synaxarium on a day. Returns names only unless includeText is true.',
		inputSchema: {
			date,
			lang: z.enum(['en', 'ar']).optional().describe('Language (default en)'),
			includeText: z.boolean().optional().describe('Include the full commemoration text'),
		},
		path: (a) =>
			toPath(`/api/synaxarium${segment(a.date)}`, {
				lang: a.lang,
				detailed: a.includeText || undefined,
			}),
	}),
	tool({
		name: 'search_synaxarium',
		title: 'Search the Synaxarium',
		description:
			'Find saints and events in the Synaxarium by name, with the day each is commemorated.',
		inputSchema: { query: z.string().min(1).describe('Name to search for, e.g. "Mary"') },
		path: (a) => toPath('/api/synaxarium/search/query', { q: a.query }),
	}),
	tool({
		name: 'get_agpeya_hour',
		title: 'Agpeya hour',
		description:
			'The full prayers of one canonical hour of the Agpeya (Book of Hours), in the order they are prayed. For the Midnight hour use get_midnight_watch.',
		inputSchema: {
			hour: z
				.enum(['prime', 'terce', 'sext', 'none', 'vespers', 'compline'])
				.describe('The canonical hour'),
			lang: textLang,
		},
		path: (a) => toPath(`/api/agpeya/${a.hour}`, { lang: a.lang, include: 'sections' }),
		// `sections` repeats the named fields in prayed order; returning both would double
		// the payload, so keep the hour's header and its sections.
		select: ({ id, name, englishName, traditionalTime, introduction, sections }) => ({
			id,
			name,
			englishName,
			traditionalTime,
			introduction,
			sections,
		}),
	}),
	tool({
		name: 'get_midnight_watch',
		title: 'Agpeya Midnight watch',
		description:
			'The full prayers of one of the three watches of the Agpeya Midnight hour. The hour is prayed as watch 1, 2 then 3.',
		inputSchema: {
			watch: z.enum(['1', '2', '3']).describe('The watch: 1, 2 or 3'),
			lang: textLang,
		},
		path: (a) => toPath(`/api/agpeya/midnight/watch/${a.watch}`, { lang: a.lang }),
	}),
	tool({
		name: 'search',
		title: 'Search',
		description:
			'Search the Bible, the Synaxarium and the Agpeya together. Accepts Bible references ("John 3:16"), words, saint names and hour names.',
		inputSchema: {
			query: z.string().min(1).describe('What to search for'),
			categories: z
				.array(z.enum(['bible', 'synaxarium', 'agpeya']))
				.optional()
				.describe('Limit the search to these categories (default all)'),
			limit: z
				.number()
				.int()
				.min(1)
				.max(20)
				.optional()
				.describe('Results per category (default 5)'),
		},
		path: (a) =>
			toPath('/api/search', { q: a.query, categories: a.categories?.join(','), limit: a.limit }),
	}),
]
