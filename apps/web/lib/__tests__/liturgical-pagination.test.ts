import { describe, expect, it } from 'vitest'
import {
	computePageBreaks,
	mapSharedPage,
} from '../../components/LiturgicalSection/pagination'
import { type FlatLine, alignByRubric } from '../../components/LiturgicalSection/turns'

const line = (text: string, isRubric = false): FlatLine => ({
	text,
	isRubric,
	isNewSpeakerGroup: false,
})

describe('liturgical pagination', () => {
	it('fills pages using every measured content line', () => {
		expect(computePageBreaks([[30, 30, 30, 30]], 100, 4)).toEqual([0, 3, 4])
	})

	it('handles continuous verses that share the same visual line', () => {
		expect(computePageBreaks([[30, 0, 30, 0, 30]], 65, 5)).toEqual([0, 4, 5])
	})

	it('moves a trailing rubric to the page containing the text it advises', () => {
		expect(computePageBreaks([[40, 40, 40]], 100, 3, [false, true, false])).toEqual([
			0, 1, 3,
		])
	})

	it('keeps shorter translations visible across shared navigation', () => {
		expect([0, 1, 2, 3].map((page) => mapSharedPage(page, 4, 1))).toEqual([0, 0, 0, 0])
		expect([0, 1, 2, 3].map((page) => mapSharedPage(page, 4, 2))).toEqual([0, 0, 1, 1])
	})
})

describe('rubric alignment', () => {
	it('does not align or pad ordinary multilingual prayer text', () => {
		const content = {
			en: [line('English prayer')],
			ar: [line('Arabic prayer one'), line('Arabic prayer two')],
		}

		expect(alignByRubric(content, ['en', 'ar'])).toBe(content)
	})

	it('adds alignment only when a line is explicitly marked as a rubric', () => {
		const aligned = alignByRubric(
			{
				en: [line('Instruction', true), line('Prayer')],
				ar: [line('Prayer')],
			},
			['en', 'ar'],
		)

		expect(aligned.ar[0]).toMatchObject({ isRubric: true, isSpacer: true })
		expect(aligned.ar[1].text).toBe('Prayer')
	})
})
