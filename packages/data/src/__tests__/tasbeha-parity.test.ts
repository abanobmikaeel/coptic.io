import { describe, expect, it } from 'vitest'
import { getTasbehaService as getArabicTasbeha } from '../ar/tasbeha'
import { getTasbehaService as getCopticTasbeha } from '../cop/tasbeha'
import { getTasbehaService as getEnglishTasbeha } from '../en/tasbeha'

describe('Tasbeha data', () => {
	const en = getEnglishTasbeha()
	const cop = getCopticTasbeha()
	const ar = getArabicTasbeha()

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
		expect(
			ar.sections.every(({ content }) => content.every((line) => /[\u0600-\u06ff]/.test(line))),
		).toBe(true)
		expect(
			cop.sections.every(({ content }) =>
				content.every((line) => /[\u2c80-\u2cff]/i.test(line) || line === '-'),
			),
		).toBe(true)
		expect(
			cop.sections.flatMap(({ content }) => content).filter((line) => line === '-'),
		).toHaveLength(1)
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
		expect(ar.rite).toEqual(en.rite)
		expect(cop.rite).toEqual(en.rite)
	})

	it('records independent verification for the first imported canticle and lobsh', () => {
		for (const id of ['first-hoos', 'first-hoos-lobsh']) {
			const section = en.sections.find((candidate) => candidate.id === id)
			expect(section?.source.corroboratingUrls?.[0]).toContain('st-takla.org')
		}
	})
})
