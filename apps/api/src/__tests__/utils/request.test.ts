import { describe, expect, it } from 'vitest'
import { parseTranslation, parseYear } from '../../utils/request'

describe('parseTranslation', () => {
	it.each(['en', 'ar', 'es', 'cop'] as const)('keeps %s', (lang) => {
		expect(parseTranslation(lang)).toBe(lang)
	})

	it.each([undefined, '', 'fr', 'AR', 'english'])('reads %s as English', (lang) => {
		expect(parseTranslation(lang)).toBe('en')
	})
})

describe('parseYear', () => {
	it('parses a supported year', () => {
		expect(parseYear('2026')).toBe(2026)
	})

	it.each(['', 'abc', '1582', '10000', '-5'])('rejects %s', (input) => {
		expect(parseYear(input)).toBeNull()
	})
})
