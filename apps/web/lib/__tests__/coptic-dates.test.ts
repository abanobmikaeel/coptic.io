import { describe, expect, it } from 'vitest'
import {
	canonicalizeCopticDate,
	copticDateFromSegment,
	copticDateSegments,
	copticDateToSegment,
} from '../coptic-dates'

describe('copticDateFromSegment', () => {
	it('decodes a hyphenated segment to a "{day} {month}" string', () => {
		expect(copticDateFromSegment('15-Toba')).toBe('15 Toba')
	})

	it('decodes the first month', () => {
		expect(copticDateFromSegment('1-Tout')).toBe('1 Tout')
	})
})

describe('copticDateToSegment', () => {
	it('encodes a "{day} {month}" string as a hyphenated segment', () => {
		expect(copticDateToSegment('15 Toba')).toBe('15-Toba')
	})

	it('round-trips through copticDateFromSegment', () => {
		const segment = '15-Toba'
		expect(copticDateToSegment(copticDateFromSegment(segment))).toBe(segment)
	})
})

describe('copticDateSegments', () => {
	it('enumerates every pre-rendered Coptic day (12×30 + 5 Nasie = 365)', () => {
		expect(copticDateSegments()).toHaveLength(365)
	})

	it('starts at 1-Tout and ends at 5-Nasie', () => {
		const segments = copticDateSegments()
		expect(segments[0]).toBe('1-Tout')
		expect(segments[segments.length - 1]).toBe('5-Nasie')
	})

	it('omits the Nasie leap day (only the scraper-on-demand 6-Nasie is valid)', () => {
		expect(copticDateSegments()).not.toContain('6-Nasie')
	})
})

describe('canonicalizeCopticDate', () => {
	it('returns the canonical form for already-canonical input', () => {
		expect(canonicalizeCopticDate('15 Toba')).toBe('15 Toba')
	})

	it('fixes month casing ("15 toba" → "15 Toba")', () => {
		expect(canonicalizeCopticDate('15 toba')).toBe('15 Toba')
		expect(canonicalizeCopticDate('15 BARAMHAT')).toBe('15 Baramhat')
	})

	it('strips leading zeros ("05 Toba" → "5 Toba")', () => {
		expect(canonicalizeCopticDate('05 Toba')).toBe('5 Toba')
	})

	it('trims surrounding whitespace', () => {
		expect(canonicalizeCopticDate('  15   Toba  ')).toBe('15 Toba')
	})

	it('accepts the Nasie leap day (6 Nasie)', () => {
		expect(canonicalizeCopticDate('6 Nasie')).toBe('6 Nasie')
	})

	it('rejects out-of-range days', () => {
		expect(canonicalizeCopticDate('0 Toba')).toBeNull()
		expect(canonicalizeCopticDate('31 Toba')).toBeNull()
		expect(canonicalizeCopticDate('7 Nasie')).toBeNull()
	})

	it('rejects unknown months', () => {
		expect(canonicalizeCopticDate('15 Foo')).toBeNull()
	})

	it('rejects malformed input', () => {
		expect(canonicalizeCopticDate('Toba')).toBeNull()
		expect(canonicalizeCopticDate('15')).toBeNull()
		expect(canonicalizeCopticDate('Toba 15')).toBeNull()
		expect(canonicalizeCopticDate('')).toBeNull()
	})
})
