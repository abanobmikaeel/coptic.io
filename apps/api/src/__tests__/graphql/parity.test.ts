import { describe, expect, it } from 'vitest'
import { app } from '../../index'

/**
 * Every GraphQL query must answer exactly what its REST route answers. GraphQL sends
 * null where REST omits a field, so nulls are dropped on both sides; a field REST
 * serves that the query does not select fails the comparison, which is what keeps
 * the hand-written schema in step with REST.
 */

const gql = async (query: string) => {
	const res = await app.request('/graphql', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ query }),
	})
	return (await res.json()) as { data?: Record<string, unknown>; errors?: { message: string }[] }
}

const rest = async (path: string) => {
	const res = await app.request(path)
	expect(res.status, path).toBe(200)
	return res.json()
}

const dropNulls = (value: unknown): unknown => {
	if (Array.isArray(value)) return value.map(dropNulls)
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value)
				.filter(([, v]) => v !== null)
				.map(([k, v]) => [k, dropNulls(v)]),
		)
	}
	return value
}

const expectParity = async (query: string, field: string, path: string) => {
	const [{ data, errors }, expected] = await Promise.all([gql(`{ ${query} }`), rest(path)])
	expect(errors).toBeUndefined()
	expect(dropNulls(data?.[field])).toEqual(dropNulls(expected))
}

const COPTIC_DATE = 'dateString day month year monthString'
const CELEBRATION = 'id name type category isMoveable month celebratedOnEve'
const SYNAXARIUM = 'id name url text sourceRef'
const SLOTS = [
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
]
const READING_DETAIL = 'bookName chapters { chapterNum verses { num text } }'
const READINGS = `reference { id ${SLOTS.join(' ')} }
	${SLOTS.map((slot) => `${slot} { ${READING_DETAIL} }`).join(' ')}
	Synaxarium { ${SYNAXARIUM} } synaxariumLanguage celebrations { ${CELEBRATION} }
	season seasonKey seasonDay cycle readingsAvailable fullDate { ${COPTIC_DATE} }`

describe('GraphQL matches REST', () => {
	describe('calendar', () => {
		it.each(['en', 'ar', 'es'])('copticDate in %s', (lang) =>
			expectParity(
				`copticDate(date: "2026-09-11", lang: "${lang}") { ${COPTIC_DATE} }`,
				'copticDate',
				`/api/calendar/2026-09-11?lang=${lang}`,
			),
		)

		it('calendarMonth', () =>
			expectParity(
				`calendarMonth(year: 2026, month: 4) { year month monthName
					days { gregorianDate copticDate { ${COPTIC_DATE} } fasting { isFasting fastType description } }
					copticMonths { month monthString year startDay } }`,
				'calendarMonth',
				'/api/calendar/month/2026/4',
			))
	})

	describe('readings', () => {
		// An annual weekday, a Sunday and a Holy Fifty day, in an LTR and an RTL language
		it.each([
			['2026-10-27', 'en', false],
			['2026-11-01', 'ar', true],
			['2026-04-20', 'en', true],
		])('readings for %s in %s (detailed: %s)', (date, lang, detailed) =>
			expectParity(
				`readings(date: "${date}", lang: "${lang}", detailed: ${detailed}) { ${READINGS} }`,
				'readings',
				`/api/readings/${date}?lang=${lang}${detailed ? '&detailed=true' : ''}`,
			),
		)

		it.each(['en', 'ar'])('dailyVerse in %s', (lang) =>
			expectParity(
				`dailyVerse(date: "2026-10-27", lang: "${lang}") { verse { book chapter verse text }
					reference readingSlot readingReference language requestedLanguage fallback
					season seasonKey fullDate { ${COPTIC_DATE} } }`,
				'dailyVerse',
				`/api/verse/2026-10-27?lang=${lang}`,
			),
		)
	})

	describe('celebrations', () => {
		it('allCelebrations', () =>
			expectParity(`allCelebrations { ${CELEBRATION} }`, 'allCelebrations', '/api/celebrations'))

		it.each(['en', 'ar', 'es'])('celebrationsForDate in %s', (lang) =>
			expectParity(
				`celebrationsForDate(date: "2027-01-07", lang: ${lang}) { ${CELEBRATION} }`,
				'celebrationsForDate',
				`/api/celebrations/2027-01-07?lang=${lang}`,
			),
		)

		it.each(['en', 'ar'])('upcomingCelebrations in %s', (lang) =>
			expectParity(
				`upcomingCelebrations(days: 60, lang: ${lang}) { date copticDate { ${COPTIC_DATE} }
					celebrations { ${CELEBRATION} } }`,
				'upcomingCelebrations',
				`/api/celebrations/upcoming/list?days=60&lang=${lang}`,
			),
		)
	})

	describe('fasting', () => {
		// Inside the Nativity Fast, so the localized description is exercised
		it.each(['en', 'ar', 'es'])('fastingForDate in %s', (lang) =>
			expectParity(
				`fastingForDate(date: "2026-12-20", lang: ${lang}) { isFasting fastType description }`,
				'fastingForDate',
				`/api/fasting/2026-12-20?lang=${lang}`,
			),
		)

		it('fastingCalendar', () =>
			expectParity(
				`fastingCalendar(year: 2026) { date copticDate { ${COPTIC_DATE} } fastType description }`,
				'fastingCalendar',
				'/api/fasting/calendar/2026',
			))
	})

	describe('synaxarium', () => {
		it.each(['en', 'ar'])('synaxariumForDate in %s', (lang) =>
			expectParity(
				`synaxariumForDate(date: "2026-10-27", detailed: true, lang: ${lang}) { ${SYNAXARIUM} }`,
				'synaxariumForDate',
				`/api/synaxarium/2026-10-27?detailed=true&lang=${lang}`,
			),
		)

		it('searchSynaxarium', () =>
			expectParity(
				`searchSynaxarium(query: "Mark") { date copticDate { dateString day monthString }
					entry { url name } }`,
				'searchSynaxarium',
				'/api/synaxarium/search/query?q=Mark',
			))
	})
})

describe('GraphQL rejects what REST rejects', () => {
	it.each([
		['celebrationsForDate(lang: fr) { name }', 'lang'],
		['calendarMonth(year: 2026, month: 13) { month }', 'month'],
		['upcomingCelebrations(days: 0) { date }', 'days'],
	])('%s', async (query) => {
		const { errors } = await gql(`{ ${query} }`)
		expect(errors?.length).toBeGreaterThan(0)
	})
})
