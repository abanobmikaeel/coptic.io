import { describe, expect, it } from 'vitest'
import { getTasbehaService as getArabicTasbeha } from '../ar/tasbeha'
import { getTasbehaService as getCopticTasbeha } from '../cop/tasbeha'
import {
	TASBEHA_SERVICE_IDS as SERVICE_IDS,
	getTasbehaService as getEnglishTasbeha,
	getTasbehaServiceForWeekday,
} from '../en/tasbeha'
import commonEn from '../en/tasbeha/common.json'
import fridayEn from '../en/tasbeha/friday.json'
import mondayEn from '../en/tasbeha/monday.json'
import saturdayEn from '../en/tasbeha/saturday.json'
import sundayEn from '../en/tasbeha/sunday.json'
import thursdayEn from '../en/tasbeha/thursday.json'
import tuesdayEn from '../en/tasbeha/tuesday.json'
import wednesdayEn from '../en/tasbeha/wednesday.json'
import type { TasbehaCommonFile, TasbehaServiceFile } from '../tasbeha/types'

const common = commonEn as unknown as TasbehaCommonFile
const dayFiles = [
	sundayEn,
	mondayEn,
	tuesdayEn,
	wednesdayEn,
	thursdayEn,
	fridayEn,
	saturdayEn,
] as unknown as TasbehaServiceFile[]

describe.each(SERVICE_IDS)('Tasbeha data — %s', (id) => {
	const en = getEnglishTasbeha(id)
	const cop = getCopticTasbeha(id)
	const ar = getArabicTasbeha(id)

	it('keeps English, Coptic, and Arabic sections and rows aligned', () => {
		expect(ar.sections.map(({ id }) => id)).toEqual(en.sections.map(({ id }) => id))
		expect(cop.sections.map(({ id }) => id)).toEqual(en.sections.map(({ id }) => id))
		for (const [index, section] of en.sections.entries()) {
			expect(ar.sections[index].content.length, section.id).toBe(section.content.length)
			expect(cop.sections[index].content.length, section.id).toBe(section.content.length)
		}
	})

	it('contains real text in the declared language', () => {
		expect(en.sections.every(({ content }) => content.every((line) => /[A-Za-z]/.test(line)))).toBe(
			true,
		)
		expect(ar.sections.every(({ content }) => content.every((line) => /[؀-ۿ]/.test(line)))).toBe(
			true,
		)
		// A bare "-" is the source's own placeholder where a row has no Coptic —
		// rubric headings and two rows of the Sherat. Anything else must be Coptic.
		expect(
			cop.sections.every(({ content }) =>
				content.every((line) => /[Ⲁ-⳿]/i.test(line) || line === '-'),
			),
		).toBe(true)
	})

	it('removes Tasbeha.org chant-response markers from displayed text', () => {
		for (const section of [...en.sections, ...cop.sections, ...ar.sections]) {
			expect(
				section.content.some((line) => /(^|\n)\s*\+/.test(line)),
				section.id,
			).toBe(false)
		}
	})

	it('tracks an exact source for every unique section', () => {
		expect(new Set(en.sections.map(({ id }) => id)).size).toBe(en.sections.length)
		for (const section of [...en.sections, ...cop.sections, ...ar.sections]) {
			expect(section.source.url).toBe(
				`https://tasbeha.org/hymn_library/view/${section.source.pageId}`,
			)
			expect(section.source.accessedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
		}
	})

	it('declares the annual cycle with a single weekday', () => {
		expect(en.rite.cycle).toBe('annual')
		expect(en.rite.weekdays).toHaveLength(1)
		expect(en.status).toBe('complete')
		expect(ar.rite).toEqual(en.rite)
		expect(cop.rite).toEqual(en.rite)
		expect(ar.id).toBe(en.id)
		expect(cop.id).toBe(en.id)
	})
})

describe('Tasbeha weekly cycle', () => {
	it('covers all seven days exactly once', () => {
		const weekdays = SERVICE_IDS.flatMap((id) => getEnglishTasbeha(id).rite.weekdays)
		expect([...weekdays].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6])
	})

	it('resolves each weekday to its own service in every language', () => {
		for (const weekday of [0, 1, 2, 3, 4, 5, 6]) {
			const service = getTasbehaServiceForWeekday(weekday)
			expect(service.rite.weekdays, `weekday ${weekday}`).toContain(weekday)
			expect(getArabicTasbeha(service.id).rite.weekdays).toContain(weekday)
			expect(getCopticTasbeha(service.id).rite.weekdays).toContain(weekday)
		}
	})

	it('prays Adam Sunday through Tuesday and Watos Wednesday through Saturday', () => {
		const tuneFor = (weekday: number) => getTasbehaServiceForWeekday(weekday).rite.dayTune
		expect([0, 1, 2].map(tuneFor)).toEqual(['adam', 'adam', 'adam'])
		expect([3, 4, 5, 6].map(tuneFor)).toEqual(['watos', 'watos', 'watos', 'watos'])
	})

	it('gives each weekday its own proper psali and Theotokia', () => {
		for (const weekday of [1, 2, 3, 4, 5, 6]) {
			const service = getTasbehaServiceForWeekday(weekday)
			const ids = service.sections.map(({ id }) => id)
			expect(
				ids.some((id) => id.endsWith('-psali')),
				service.id,
			).toBe(true)
			expect(
				ids.some((id) => id.endsWith('-theotokia')),
				service.id,
			).toBe(true)
		}
	})

	it('takes the tune-correct Theotokia introduction, Difnar and conclusion', () => {
		for (const weekday of [0, 1, 2, 3, 4, 5, 6]) {
			const service = getTasbehaServiceForWeekday(weekday)
			const ids = service.sections.map(({ id }) => id)
			const adam = service.rite.dayTune === 'adam'
			expect(ids, service.id).toContain(
				adam ? 'theotokia-introduction-leebon' : 'watos-theotokias-introduction',
			)
			expect(ids, service.id).toContain(
				adam ? 'difnar-introduction-adam' : 'watos-theotokias-conclusion',
			)
		}
	})

	it('shares the annual frame across the six Midnight Praises', () => {
		const frame = [
			'ten-theno',
			'first-hoos',
			'second-hoos',
			'third-hoos',
			'fourth-hoos',
			'saints-commemoration',
			'concluding-litany',
			'morning-doxology',
		]
		for (const weekday of [0, 1, 2, 3, 4, 5]) {
			const ids = getTasbehaServiceForWeekday(weekday).sections.map(({ id }) => id)
			expect(ids, `weekday ${weekday}`).toEqual(expect.arrayContaining(frame))
		}
	})

	// Saturday is prayed on Saturday evening, so it omits the four canticles and the
	// morning doxology that belong to the Midnight Praise.
	it('serves Saturday as a Vespers Praise rather than a Midnight Praise', () => {
		const saturday = getTasbehaServiceForWeekday(6)
		expect(saturday.id).toBe('saturday-vespers-praises')
		const ids = saturday.sections.map(({ id }) => id)
		expect(ids[0]).toBe('saturday-ni-ethnos-teero')
		expect(ids).toContain('saturday-theotokia-lobsh-sherat')
		expect(ids).not.toContain('ten-theno')
		expect(ids).not.toContain('morning-doxology')
	})
})

// The generated files are deduplicated: a section prayed on more than one day is
// written once to common.json and referenced by id. These guard that shape, so a
// future import cannot quietly reintroduce the duplication.
describe('Tasbeha storage layout', () => {
	it('stores no section in both a day file and common.json', () => {
		for (const file of dayFiles) {
			for (const section of file.sections) {
				expect(common.sections[section.id], `${file.id} duplicates ${section.id}`).toBeUndefined()
			}
		}
	})

	it('keeps only genuinely shared sections in common.json', () => {
		const uses = new Map<string, number>()
		for (const file of dayFiles) {
			for (const id of new Set(file.order)) uses.set(id, (uses.get(id) ?? 0) + 1)
		}
		for (const id of Object.keys(common.sections)) {
			expect(uses.get(id) ?? 0, `${id} is in common.json`).toBeGreaterThan(1)
		}
		// …and conversely, nothing shared is left sitting in a day file.
		for (const file of dayFiles) {
			for (const section of file.sections) {
				expect(uses.get(section.id), `${section.id} in ${file.id}`).toBe(1)
			}
		}
	})

	it('resolves every id in every order, with nothing unused', () => {
		const referenced = new Set(dayFiles.flatMap((file) => file.order))
		for (const file of dayFiles) {
			const propers = new Set(file.sections.map(({ id }) => id))
			for (const id of file.order) {
				expect(
					propers.has(id) || id in common.sections,
					`${file.id} refers to unresolved ${id}`,
				).toBe(true)
			}
			// Every stored proper must actually be prayed.
			for (const id of propers) expect(file.order, file.id).toContain(id)
		}
		for (const id of Object.keys(common.sections)) expect(referenced.has(id), id).toBe(true)
	})

	it('composes services whose section order matches the stored order', () => {
		for (const file of dayFiles) {
			const composed = getEnglishTasbeha(file.id)
			expect(
				composed.sections.map(({ id }) => id),
				file.id,
			).toEqual(file.order)
		}
	})

	it('returns the same cached instance on repeated reads', () => {
		expect(getEnglishTasbeha('monday-midnight-praises')).toBe(
			getEnglishTasbeha('monday-midnight-praises'),
		)
	})
})

describe('Tasbeha data — Sunday specifics', () => {
	const en = getEnglishTasbeha()

	it('defaults to the Sunday Midnight Praises', () => {
		expect(en.id).toBe('sunday-midnight-praises')
	})

	it('contains the complete fixed Sunday sequence', () => {
		expect(en.status).toBe('complete')
		expect(en.sections.map(({ id }) => id)).toEqual(
			expect.arrayContaining([
				'first-sunday-psali',
				'second-sunday-psali',
				'sunday-theotokia-part-1',
				'gospel-of-luke',
				'sunday-theotokia-part-18',
				'difnar-introduction-adam',
				'concluding-litany',
				'morning-doxology',
			]),
		)
		expect(en.sections.at(-1)?.id).toBe('morning-doxology')
		expect(en.sections.find(({ id }) => id === 'sunday-theotokia-part-9')?.content[0]).toMatch(
			/You are called/,
		)
		expect(en.sections.find(({ id }) => id === 'sunday-theotokia-part-14')?.content).not.toContain(
			'The Fifteenth Part:',
		)
	})

	it('labels the date-limited late Sunday Theotokia parts', () => {
		for (const part of [16, 17, 18]) {
			expect(
				en.sections.find(({ id }) => id === `sunday-theotokia-part-${part}`)?.availability,
			).toBe('resurrection-through-hathor')
		}
		expect(
			en.sections.find(({ id }) => id === 'sunday-theotokia-part-15')?.availability,
		).toBeUndefined()
	})

	it('keeps the annual cycle and Adam/Watos tune as separate rite dimensions', () => {
		expect(en.rite).toEqual({ cycle: 'annual', dayTune: 'adam', weekdays: [0] })
	})

	it('records independent verification for the first imported canticle and lobsh', () => {
		for (const id of ['first-hoos', 'first-hoos-lobsh']) {
			const section = en.sections.find((candidate) => candidate.id === id)
			expect(section?.source.corroboratingUrls?.[0]).toContain('st-takla.org')
		}
	})
})
