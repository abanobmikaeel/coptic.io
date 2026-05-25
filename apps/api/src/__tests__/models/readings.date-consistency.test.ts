import { describe, expect, it } from 'vitest'
import { getByCopticDate } from '../../models/readings'

describe('readings date consistency', () => {
	it('should not return Day field in reference object', async () => {
		const result = await getByCopticDate(new Date('2026-05-20'))
		if (result?.reference) {
			expect(result.reference).not.toHaveProperty('Day')
		}
	})

	it('fullDate should be correct for the queried date', async () => {
		const result = await getByCopticDate(new Date('2026-05-20'), false)
		if (result?.fullDate) {
			expect(result.fullDate.dateString).toBe('Bashans 13')
			expect(result.fullDate.month).toBe(9)
			expect(result.fullDate.day).toBe(13)
			expect(result.fullDate.monthString).toBe('Bashans')
		}
	})
})
