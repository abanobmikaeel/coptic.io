import { describe, expect, it, vi } from 'vitest'
import { getByCopticDate } from '../../models/readings'
import { getSynaxariumForDate } from '../../services/synaxarium.service'

vi.mock('../../services/synaxarium.service', () => ({
	getSynaxariumForDate: vi.fn((_date: Date, _detailed: boolean, lang: string) =>
		lang === 'en' ? [{ name: 'English entry' }] : null,
	),
}))

describe('Synaxarium language fallback', () => {
	const date = new Date(2026, 9, 22)

	it('serves labeled English when a day is missing from the Arabic Synaxarium', () => {
		const day = getByCopticDate(date, false, 'ar')
		expect(day.Synaxarium).toEqual([{ name: 'English entry' }])
		expect(day.synaxariumLanguage).toBe('en')
	})

	it('still returns the Arabic reading references for that day', () => {
		expect(getByCopticDate(date, false, 'ar').reference).toBeDefined()
	})

	it('throws when a day is missing in English too', () => {
		vi.mocked(getSynaxariumForDate).mockReturnValue(null)
		expect(() => getByCopticDate(date, false, 'ar')).toThrow('Synaxarium not found')
	})
})
