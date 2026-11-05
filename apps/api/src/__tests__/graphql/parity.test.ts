import { describe, expect, it } from 'vitest'
import { app } from '../../index'

/**
 * Every GraphQL query must answer exactly what its REST route answers. GraphQL sends
 * null where REST omits a field, so nulls are dropped on both sides, and REST's
 * plain-string lines are read as GraphQL's { text } lines. A field REST
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

// Drops nulls, and writes a plain-string prayed line as GraphQL types it: { text }
const normalize = (value: unknown, key = ''): unknown => {
	if (Array.isArray(value)) {
		return value.map((item) =>
			key === 'content' && typeof item === 'string' ? { text: item } : normalize(item),
		)
	}
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value)
				.filter(([, v]) => v !== null)
				.map(([k, v]) => [k, normalize(v, k)]),
		)
	}
	return value
}

const expectParity = async (query: string, field: string, path: string) => {
	const [{ data, errors }, expected] = await Promise.all([gql(`{ ${query} }`), rest(path)])
	expect(errors).toBeUndefined()
	expect(normalize(data?.[field])).toEqual(normalize(expected))
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

const VERSE = 'num text'
const LINE = 'text speaker isRubric isResponse coptic'
const PRAYER = `title content { ${LINE} } inline`
const PSALM = `title reference rubric verses { ${VERSE} }`
const GOSPEL = `reference rubric verses { ${VERSE} }`
const PART_FIELDS = `id kind title rubric inline content { ${LINE} } reference verses { ${VERSE} }
	theme prayer psalmsIntro psalmsRubric`
const PART = `${PART_FIELDS} sections { ${PART_FIELDS} }`
const WATCH = `id name theme opening { ${PRAYER} } psalmsIntro psalms { ${PSALM} } gospel { ${GOSPEL} }
	gospelConclusion { ${PRAYER} } litanies { ${PRAYER} } closing { ${PRAYER} } conclusion { ${PART} }`
const HOUR = `id name englishName traditionalTime introduction opening { ${PRAYER} }
	hourIntro { ${PRAYER} } comeLetUsWorship { ${PRAYER} } thanksgiving { ${PRAYER} }
	introductoryPsalm { ${PSALM} } psalmsIntro psalms { ${PSALM} } gospel { ${GOSPEL} }
	gospelConclusion { ${PRAYER} } litanies { ${PRAYER} } lordsPrayer { ${PRAYER} }
	thanksgivingAfter { ${PRAYER} } closing { ${PRAYER} } conclusion { ${PART} }
	watches { ${WATCH} } sections { ${PART} }`
const SERVICE = `type name date copticDate { ${COPTIC_DATE} } sections { id type role title titleLanguage
	rubric optional content { ${LINE} } reference verses { ${VERSE} } }`
const TASBEHA = `type id name description status rite { cycle dayTune weekdays }
	sections { id type role kind title titleLanguage contentUnavailable content { ${LINE} }
	source { name url pageId accessedAt corroboratingUrls } }`
const PERIOD = 'name description startDate endDate type isFasting'
const LENT_DAY = `dayOffset dayNumber part weekNumber weekTheme day title references
	sermons { title preacher youtubeUrl thumbnail } sundayHolyGospelReading date
	resolvedReferences { reference readings { ${READING_DETAIL} } }`
const SEARCH = `results { bible { type book chapter verse text url score }
	synaxarium { type name date copticDate summary url score }
	agpeya { type id name englishName traditionalTime url score } } query totalCount`

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
	describe('season', () => {
		// Inside Great Lent and in Ordinary Time
		it.each([
			['2026-03-01', 'en'],
			['2026-03-01', 'ar'],
			['2026-09-20', 'es'],
		])('season for %s in %s', (date, lang) =>
			expectParity(
				`season(date: "${date}", lang: "${lang}") { date season description startDate endDate isFasting type }`,
				'season',
				`/api/season/${date}?lang=${lang}`,
			),
		)

		it('seasonsForYear', () =>
			expectParity(
				`seasonsForYear(year: 2026) { year seasons { ${PERIOD} } }`,
				'seasonsForYear',
				'/api/season/year/2026',
			))

		it('fastingPeriods', () =>
			expectParity(
				`fastingPeriods(year: 2026) { year fastingPeriods { ${PERIOD} } }`,
				'fastingPeriods',
				'/api/season/fasting/2026',
			))
	})

	describe('lent', () => {
		it('lentSchedule', () =>
			expectParity(
				`lentSchedule(year: 2026) { year easterDate lentStart lentEnd days { ${LENT_DAY} } }`,
				'lentSchedule',
				'/api/lent/schedule/2026',
			))

		it.each(['en', 'ar'])('detailed lentDay in %s', (lang) =>
			expectParity(
				`lentDay(date: "2026-03-02", detailed: true, lang: "${lang}") { ${LENT_DAY} }`,
				'lentDay',
				`/api/lent/2026-03-02?detailed=true&lang=${lang}`,
			),
		)

		it('lentDay is null where REST answers 404', async () => {
			const [{ data, errors }, res] = await Promise.all([
				gql('{ lentDay(date: "2026-09-20") { date } }'),
				app.request('/api/lent/2026-09-20'),
			])
			expect(errors).toBeUndefined()
			expect(data?.lentDay).toBeNull()
			expect(res.status).toBe(404)
		})
	})

	describe('search', () => {
		it.each([
			['search(query: "John 3:16")', '/api/search?q=John%203:16'],
			[
				'search(query: "Mark", limit: 10, categories: [synaxarium, agpeya])',
				'/api/search?q=Mark&limit=10&categories=synaxarium,agpeya',
			],
		])('%s', (call, path) => expectParity(`${call} { ${SEARCH} }`, 'search', path))
	})

	describe('agpeya', () => {
		it.each([
			['prime', 'en', 'septuagint'],
			['prime', 'ar', 'septuagint'],
			['sext', 'es', 'bible'],
			['midnight', 'en', 'septuagint'],
			['midnight', 'ar', 'septuagint'],
		])('agpeyaHour %s in %s from the %s psalter', (hour, lang, psalms) =>
			expectParity(
				`agpeyaHour(hour: ${hour}, lang: ${lang}, psalms: ${psalms}, includeSections: true) { ${HOUR} }`,
				'agpeyaHour',
				`/api/agpeya/${hour}?lang=${lang}&psalms=${psalms}&include=sections`,
			),
		)

		it('agpeyaHours', () =>
			expectParity(`agpeyaHours(lang: ar) { ${HOUR} }`, 'agpeyaHours', '/api/agpeya/hours?lang=ar'))

		it('currentAgpeyaHour', () =>
			expectParity(`currentAgpeyaHour { ${HOUR} }`, 'currentAgpeyaHour', '/api/agpeya'))

		it.each([
			[1, 'en'],
			[2, 'ar'],
		])('agpeyaWatch %s in %s', (watch, lang) =>
			expectParity(
				`agpeyaWatch(watch: ${watch}, lang: ${lang}) { ${WATCH} }`,
				'agpeyaWatch',
				`/api/agpeya/midnight/watch/${watch}?lang=${lang}`,
			),
		)

		it('agpeyaTranslations', async () => {
			const [{ data }, expected] = await Promise.all([
				gql('{ agpeyaTranslations }'),
				rest('/api/agpeya/translations'),
			])
			expect(data?.agpeyaTranslations).toEqual(expected.available)
		})
	})

	describe('incense and the Liturgy', () => {
		it.each([
			['evening', 'en', ''],
			['evening', 'ar', 'martyrs,saint-mary'],
			['morning', 'cop', ''],
		])('incense %s in %s with [%s]', (time, lang, commemorations) =>
			expectParity(
				`incense(time: ${time}, date: "2026-06-01", lang: ${lang},
					commemorations: ${JSON.stringify(commemorations ? commemorations.split(',') : [])}) { ${SERVICE} }`,
				'incense',
				`/api/incense/${time}?date=2026-06-01&lang=${lang}${commemorations ? `&commemorations=${commemorations}` : ''}`,
			),
		)

		it('incenseCommemorations', async () => {
			const [{ data }, expected] = await Promise.all([
				gql('{ incenseCommemorations }'),
				rest('/api/incense/commemorations'),
			])
			expect(data?.incenseCommemorations).toEqual(expected.commemorations)
		})

		it.each(['en', 'ar', 'cop'])('liturgy in %s', (lang) =>
			expectParity(
				`liturgy(date: "2026-06-01", lang: ${lang}) { ${SERVICE} }`,
				'liturgy',
				`/api/liturgy/basil?date=2026-06-01&lang=${lang}`,
			),
		)
	})

	describe('tasbeha', () => {
		it.each(['en', 'ar', 'cop'])('tasbeha in %s', (lang) =>
			expectParity(
				`tasbeha(date: "2026-07-27", lang: ${lang}) { ${TASBEHA} }`,
				'tasbeha',
				`/api/tasbeha?date=2026-07-27&lang=${lang}`,
			),
		)

		it('sundayTasbeha', () =>
			expectParity(
				`sundayTasbeha(date: "2026-07-26", lang: ar) { ${TASBEHA} }`,
				'sundayTasbeha',
				'/api/tasbeha/sunday?date=2026-07-26&lang=ar',
			))

		it.each(['en', 'cop'])('tasbeha in Kiahk in %s', (lang) =>
			expectParity(
				`tasbeha(date: "2026-12-19", lang: ${lang}) { ${TASBEHA} }`,
				'tasbeha',
				`/api/tasbeha?date=2026-12-19&lang=${lang}`,
			),
		)

		it('tasbehaForDay', () =>
			expectParity(
				`tasbehaForDay(day: saturday, date: "2026-07-25") { ${TASBEHA} }`,
				'tasbehaForDay',
				'/api/tasbeha/saturday?date=2026-07-25',
			))
	})
})

describe('GraphQL rejects what REST rejects', () => {
	it.each([
		['celebrationsForDate(lang: fr) { name }', 'lang'],
		['calendarMonth(year: 2026, month: 13) { month }', 'month'],
		['upcomingCelebrations(days: 0) { date }', 'days'],
		['search(query: "John", limit: 51) { query }', 'limit'],
		['agpeyaWatch(watch: 4) { id }', 'watch'],
		['incense(time: evening, lang: es) { name }', 'lang'],
	])('%s', async (query) => {
		const { errors } = await gql(`{ ${query} }`)
		expect(errors?.length).toBeGreaterThan(0)
	})
})
