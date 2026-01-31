import { describe, expect, it } from 'vitest'
import { getReading, getByCopticDate } from '../../models/readings'

describe('Arabic Bible Translation', () => {
	describe('getReading with Arabic translation', () => {
		it('should return Arabic text for Genesis 1:1', () => {
			const reading = getReading('Genesis 1:1', 'ar')
			expect(reading).not.toBeNull()
			expect(reading?.bookName).toBe('Genesis')
			expect(reading?.chapters[0]?.verses[0]?.text).toContain('ٱلْبَدْءِ')
		})

		it('should return Arabic text for a verse range', () => {
			const reading = getReading('John 3:16-17', 'ar')
			expect(reading).not.toBeNull()
			expect(reading?.chapters[0]?.verses).toHaveLength(2)
			// Verify Arabic text is present (contains Arabic characters)
			const text = reading?.chapters[0]?.verses[0]?.text || ''
			expect(text).toMatch(/[\u0600-\u06FF]/)
		})

		it('should return Arabic text for a chapter range', () => {
			const reading = getReading('Psalms 23', 'ar')
			expect(reading).not.toBeNull()
			expect(reading?.chapters[0]?.verses.length).toBeGreaterThan(0)
		})

		it('should return English text by default', () => {
			const reading = getReading('Genesis 1:1')
			expect(reading).not.toBeNull()
			expect(reading?.chapters[0]?.verses[0]?.text).toContain('In the beginning')
		})

		it('should return English text with explicit en parameter', () => {
			const reading = getReading('Genesis 1:1', 'en')
			expect(reading).not.toBeNull()
			expect(reading?.chapters[0]?.verses[0]?.text).toContain('In the beginning')
		})
	})

	describe('getByCopticDate with translation', () => {
		it('should return Arabic readings when translation is ar', () => {
			const date = new Date('2025-01-31')
			const result = getByCopticDate(date, true, 'ar')

			// Check that we get readings and they contain Arabic text
			expect(result).toBeDefined()

			// Check at least one reading section has Arabic text
			const pauline = result.Pauline
			if (pauline && pauline.length > 0) {
				const text = pauline[0]?.chapters[0]?.verses[0]?.text || ''
				expect(text).toMatch(/[\u0600-\u06FF]/)
			}
		})

		it('should return English readings by default', () => {
			const date = new Date('2025-01-31')
			const result = getByCopticDate(date, true)

			expect(result).toBeDefined()

			// Check that readings contain English text (Latin characters)
			const pauline = result.Pauline
			if (pauline && pauline.length > 0) {
				const text = pauline[0]?.chapters[0]?.verses[0]?.text || ''
				expect(text).toMatch(/[a-zA-Z]/)
			}
		})
	})
})
