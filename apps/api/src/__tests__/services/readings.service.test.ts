import { describe, expect, it } from 'vitest'
import { getCelebrationsForDate } from '../../services/celebrations.service'
import { getReadingsForDate } from '../../services/readings.service'

const names = (celebrations: { name: string }[] | null) => celebrations?.map((c) => c.name)

describe('getReadingsForDate celebrations', () => {
	// Regression: the readings response once listed only fixed-date celebrations, in English
	it.each([
		['Easter', new Date(2026, 3, 12)],
		['Pentecost', new Date(2026, 4, 31)],
	])('includes the moveable feast of %s', async (feast, date) => {
		const readings = await getReadingsForDate(date, false, 'en')
		expect(names(readings.celebrations)).toContain(feast)
	})

	it.each([new Date(2026, 0, 7), new Date(2026, 3, 12)])(
		'names celebrations as the celebrations route does on %s',
		async (date) => {
			const readings = await getReadingsForDate(date, false, 'ar')
			expect(names(readings.celebrations)).toEqual(names(getCelebrationsForDate(date, 'ar')))
		},
	)

	it('localizes the Nativity in Arabic', async () => {
		const readings = await getReadingsForDate(new Date(2026, 0, 7), false, 'ar')
		const arabic = names(readings.celebrations)?.filter((name) => /[\u0600-\u06FF]/.test(name))
		expect(arabic).toHaveLength(2)
	})

	it('is null on a day without celebrations', async () => {
		const readings = await getReadingsForDate(new Date(2026, 9, 27), false, 'en')
		expect(readings.celebrations).toBeNull()
	})
})
