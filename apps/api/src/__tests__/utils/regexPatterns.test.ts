import { describe, expect, it } from 'vitest'
import {
	multiChapterRange,
	oneChapterPattern,
	oneChapterPatternExact,
	oneVersePattern,
	verseRangePattern,
	verseWithCommas,
} from '../../utils/regexPatterns'

describe('Regex Patterns', () => {
	describe('oneChapterPattern', () => {
		it('should match single chapter references', () => {
			expect(oneChapterPattern.test('Psalms 119')).toBe(true)
			expect(oneChapterPattern.test('Genesis 1')).toBe(true)
			expect(oneChapterPattern.test('1 John 3')).toBe(true)
			expect(oneChapterPattern.test('2 Peter 1')).toBe(true)
		})

		it('should require space between book name and chapter', () => {
			expect(oneChapterPattern.test('Psalms 119')).toBe(true)
			expect(oneChapterPattern.test('Psalms119')).toBe(false)
		})

		it('should not match invalid formats', () => {
			expect(oneChapterPattern.test('Psalms')).toBe(false)
			expect(oneChapterPattern.test('119')).toBe(false)
		})
	})

	describe('oneChapterPatternExact', () => {
		it('should match exact single chapter references', () => {
			expect(oneChapterPatternExact.test('Psalms 119')).toBe(true)
			expect(oneChapterPatternExact.test('Genesis 1')).toBe(true)
		})

		it('should not match if there is extra text', () => {
			expect(oneChapterPatternExact.test('Psalms 119 extra')).toBe(false)
			expect(oneChapterPatternExact.test('prefix Psalms 119')).toBe(false)
		})
	})

	describe('oneVersePattern', () => {
		it('should match single verse references', () => {
			expect(oneVersePattern.test('Psalms 119:96')).toBe(true)
			expect(oneVersePattern.test('Genesis 1:1')).toBe(true)
			expect(oneVersePattern.test('1 John 3:16')).toBe(true)
		})

		it('should not match chapter-only references', () => {
			expect(oneVersePattern.test('Psalms 119')).toBe(false)
		})

		it('should not match without verse number', () => {
			expect(oneVersePattern.test('Psalms 119:')).toBe(false)
		})
	})

	describe('verseRangePattern', () => {
		it('should match verse ranges', () => {
			expect(verseRangePattern.test('Psalms 119:96-97')).toBe(true)
			expect(verseRangePattern.test('Genesis 1:1-3')).toBe(true)
			expect(verseRangePattern.test('John 3:16-18')).toBe(true)
		})

		it('should not match single verse without range', () => {
			expect(verseRangePattern.test('Psalms 119:96')).toBe(false)
		})

		it('should NOT match multi-chapter ranges (regression test)', () => {
			// BUG FIX: Previously matched these loosely, causing parsing errors
			expect(verseRangePattern.test('Acts 15:36-16:5')).toBe(false)
			expect(verseRangePattern.test('2 Peter 1:19-2:8')).toBe(false)
			expect(verseRangePattern.test('Matthew 4:23-5:16')).toBe(false)
		})
	})

	describe('verseWithCommas', () => {
		it('should match verses that start with verse pattern and contain comma', () => {
			expect(verseWithCommas.test('Psalms 119:96,')).toBe(true)
			expect(verseWithCommas.test('Genesis 1:1,')).toBe(true)
		})

		it('should not match verses without commas', () => {
			expect(verseWithCommas.test('Psalms 119:96-97')).toBe(false)
			expect(verseWithCommas.test('Psalms 119:96')).toBe(false)
		})
	})

	describe('multiChapterRange', () => {
		it('should match multi-chapter ranges', () => {
			expect(multiChapterRange.test('2 Peter 1:19-2:8')).toBe(true)
			expect(multiChapterRange.test('Matthew 1:1-2:5')).toBe(true)
			expect(multiChapterRange.test('Acts 15:36-16:5')).toBe(true)
			expect(multiChapterRange.test('Matthew 4:23-5:16')).toBe(true)
		})

		it('should not match single chapter ranges', () => {
			expect(multiChapterRange.test('Psalms 119:96-97')).toBe(false)
		})

		it('should not match single verses', () => {
			expect(multiChapterRange.test('Psalms 119:96')).toBe(false)
		})

		it('should not match chapter-only references', () => {
			expect(multiChapterRange.test('Psalms 119')).toBe(false)
		})
	})
})
