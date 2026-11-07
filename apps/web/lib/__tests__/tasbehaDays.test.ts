import { alignSection } from '@/components/LiturgicalSection'
import { describe, expect, it } from 'vitest'
import {
	getTasbehaDay,
	hasUnevenSections,
	labelUnavailableSections,
	parseKiahkWeek,
	tasbehaRiteLabel,
} from '../tasbehaDays'
import type { IncenseService } from '../types'

const service = (...sections: object[]) =>
	({ type: 'tasbeha', name: 'Kiahk', sections }) as unknown as IncenseService

const missing = { id: 'hymn', content: [], contentUnavailable: true }
const english = service({ id: 'hymn', content: ['One', 'Two', 'Three'] })
const coptic = service(missing)

describe('labelUnavailableSections', () => {
	it('labels a section no displayed language has, in the reader language', () => {
		const label = (isArabic: boolean) =>
			labelUnavailableSections({ cop: coptic }, isArabic).cop?.sections[0]?.content
		expect(label(false)).toEqual(['Not available in Coptic.'])
		expect(label(true)).toEqual(['غير متوفر بالقبطية.'])
	})

	it('labels each language when none of them has the section', () => {
		const labeled = labelUnavailableSections({ en: service(missing), cop: coptic }, false)
		expect(labeled.en?.sections[0]?.content).toEqual(['Not available in English.'])
		expect(labeled.cop?.sections[0]?.content).toEqual(['Not available in Coptic.'])
	})

	// A label beside a long hymn would anchor proportional alignment to one row.
	it('keeps every row of the hymn when another language has it', () => {
		const labeled = labelUnavailableSections({ en: english, cop: coptic }, false)
		const aligned = alignSection(labeled, 'hymn', ['en', 'cop'])
		expect(aligned?.rows).toHaveLength(3)
		expect(aligned?.activeLangs).toEqual(['en'])
	})
})

describe('hasUnevenSections', () => {
	it('is true when one language lacks what another has', () => {
		expect(hasUnevenSections({ en: english, cop: coptic })).toBe(true)
	})

	it('is false when the languages agree', () => {
		expect(hasUnevenSections({ en: english })).toBe(false)
		expect(hasUnevenSections({ cop: coptic })).toBe(false)
	})
})

describe('parseKiahkWeek', () => {
	it('reads the four weeks', () => {
		expect(['1', '2', '3', '4'].map(parseKiahkWeek)).toEqual([1, 2, 3, 4])
	})

	it.each([undefined, null, '', '0', '5', '1.5', 'two', ['1']])('ignores %j', (value) => {
		expect(parseKiahkWeek(value)).toBeUndefined()
	})
})

describe('tasbehaRiteLabel', () => {
	const monday = getTasbehaDay('monday')

	it('names the cycle being prayed', () => {
		expect(tasbehaRiteLabel(monday, false, 'kiahk')).toMatch(/^Kiahk · /)
		expect(tasbehaRiteLabel(monday, true, 'kiahk')).toMatch(/^كيهك · /)
	})

	it('stays annual by default', () => {
		expect(tasbehaRiteLabel(monday, false)).toMatch(/^Annual · /)
	})
})
