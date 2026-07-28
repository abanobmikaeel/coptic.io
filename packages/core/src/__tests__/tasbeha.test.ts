import { describe, expect, it } from 'vitest'
import { includesLateSundayTheotokiaParts } from '../liturgy/context'

describe('Sunday Theotokia eligibility', () => {
	it('includes parts 16–18 from the Resurrection through Hathor', () => {
		expect(includesLateSundayTheotokiaParts(new Date(2025, 3, 19))).toBe(false)
		expect(includesLateSundayTheotokiaParts(new Date(2025, 3, 20))).toBe(true)
		expect(includesLateSundayTheotokiaParts(new Date(2025, 11, 9))).toBe(true)
		expect(includesLateSundayTheotokiaParts(new Date(2025, 11, 10))).toBe(false)
	})
})
