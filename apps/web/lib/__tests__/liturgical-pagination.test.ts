import { describe, expect, it } from 'vitest'
import { type AlignedRow, alignSection } from '../../components/LiturgicalSection/align'
import {
	computeFixedPageBreaks,
	computePageBreaks,
} from '../../components/LiturgicalSection/pagination'
import type { LiturgicalContent } from '../../components/LiturgicalSection/turns'
import type { IncenseService, Verse } from '../types'

describe('liturgical pagination', () => {
	it('keeps paired hymn rows on fixed two-row pages', () => {
		expect(computeFixedPageBreaks(5, 2)).toEqual([0, 2, 4, 5])
	})

	it('fills pages using every measured row', () => {
		expect(computePageBreaks([30, 30, 30, 30], 100)).toEqual([0, 3, 4])
	})

	it('gives an oversized single row its own page without deadlocking', () => {
		expect(computePageBreaks([500, 30, 30], 100)).toEqual([0, 1, 3])
	})

	it('moves a trailing rubric to the page containing the text it advises', () => {
		expect(computePageBreaks([40, 40, 40], 100, [false, true, false])).toEqual([0, 1, 3])
	})
})

// ── alignSection ─────────────────────────────────────────────────────────────

const service = (
	content?: LiturgicalContent[],
	verses?: Verse[],
	sectionId = 'sec',
): IncenseService => ({
	type: 'incense',
	name: 'Test',
	date: '2026-07-05',
	copticDate: { day: 1, month: 1, year: 1742, monthString: 'Tout', dateString: 'Tout 1, 1742' },
	sections: [
		{
			id: sectionId,
			type: verses ? 'psalm' : 'prayer',
			role: 'all',
			title: 'Test',
			content,
			verses,
		},
	],
})

const verses = (count: number, prefix: string): Verse[] =>
	Array.from({ length: count }, (_, i) => ({ num: i + 1, text: `${prefix}${i + 1}` }))

const cellTexts = (row: AlignedRow, lang: 'en' | 'ar' | 'cop') =>
	(row.cells[lang] ?? []).map((l) => l.text)

describe('alignSection', () => {
	it('pairs parallel texts line for line, with rubric rows only for languages that carry them', () => {
		const aligned = alignSection(
			{
				en: service([{ text: 'Bow before the altar', isRubric: true }, 'Prayer A', 'Prayer B']),
				cop: service(['Ⲁ', 'Ⲃ']),
			},
			'sec',
			['en', 'cop'],
		)
		expect(aligned).not.toBeNull()
		const rows = aligned!.rows
		expect(rows).toHaveLength(3)
		expect(rows[0].isRubric).toBe(true)
		expect(cellTexts(rows[0], 'en')).toEqual(['Bow before the altar'])
		expect(rows[0].cells.cop).toBeUndefined()
		expect(cellTexts(rows[1], 'en')).toEqual(['Prayer A'])
		expect(cellTexts(rows[1], 'cop')).toEqual(['Ⲁ'])
	})

	it('groups proportionally when verse divisions differ (Agpeya Psalm 5: 12 vs 21)', () => {
		const aligned = alignSection(
			{ en: service(undefined, verses(12, 'en')), ar: service(undefined, verses(21, 'ar')) },
			'sec',
			['en', 'ar'],
		)
		const rows = aligned!.rows
		// The shorter translation anchors one row per verse.
		expect(rows).toHaveLength(12)
		for (const row of rows) {
			expect(row.cells.en).toHaveLength(1)
			expect(row.cells.ar!.length).toBeGreaterThanOrEqual(1)
			expect(row.cells.ar!.length).toBeLessThanOrEqual(2)
		}
		// Concatenating the cells reproduces the full Arabic text in order.
		const arAll = rows.flatMap((r) => cellTexts(r, 'ar'))
		expect(arAll).toEqual(verses(21, 'ar').map((v) => v.text))
	})

	it('groups unequal prose without empty cells (Prime opening: 3 vs 10)', () => {
		const aligned = alignSection(
			{
				en: service(['e1', 'e2', 'e3']),
				ar: service(['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10']),
			},
			'sec',
			['en', 'ar'],
		)
		const rows = aligned!.rows
		expect(rows).toHaveLength(3)
		for (const row of rows) {
			expect(row.cells.en).toHaveLength(1)
			expect(row.cells.ar!.length).toBeGreaterThan(0)
		}
		expect(rows.flatMap((r) => cellTexts(r, 'ar'))).toHaveLength(10)
	})

	it('drops languages with no content from activeLangs', () => {
		const aligned = alignSection(
			{ en: service(['e1']), cop: service(undefined, [], 'other') },
			'sec',
			['en', 'cop'],
		)
		expect(aligned!.activeLangs).toEqual(['en'])
	})

	it('returns null when no language has content', () => {
		expect(alignSection({ en: service(undefined, [], 'other') }, 'sec', ['en'])).toBeNull()
	})

	it('preserves verse numbers and single-language sections', () => {
		const aligned = alignSection({ en: service(undefined, verses(3, 'v')) }, 'sec', ['en'])
		expect(aligned!.rows).toHaveLength(3)
		expect(aligned!.rows.map((r) => r.cells.en![0].num)).toEqual([1, 2, 3])
	})
})
