import { describe, expect, it } from 'vitest'
import { getChapter, getMissingBooks } from '../cop/bible'
import {
	getAgpeyaHourData,
	getAgpeyaHourIds,
	getCommonPrayer,
} from '../en/agpeya'
import { getAgpeyaHourData as getArabicAgpeyaHourData } from '../ar/agpeya'

describe('English Agpeya shared prayers', () => {
	it('uses the complete Thanksgiving Prayer for every hour', () => {
		const thanksgiving = getCommonPrayer('thanksgivingPrayer')

		expect(thanksgiving).not.toBeNull()
		expect(thanksgiving?.content).toHaveLength(4)

		for (const hourId of getAgpeyaHourIds()) {
			expect(getAgpeyaHourData(hourId)?.thanksgiving).toEqual(thanksgiving)
		}
	})
})

describe('Coptic Agpeya Psalms', () => {
	it('includes the complete LXX Psalter without numbering superscriptions as verses', () => {
		expect(getMissingBooks()).not.toContain('Psalms')
		expect(getChapter('Psalms', 151)?.verses.length).toBeGreaterThan(0)

		const psalm50 = getChapter('Psalms', 50)
		expect(psalm50?.verses).toHaveLength(19)
		expect(psalm50?.verses[0].num).toBe(1)
		expect(psalm50?.verses[0].text).toContain('ⲛⲁⲓ ⲛⲏⲓ')
	})
})

describe('Arabic Agpeya', () => {
	it('stores Arabic prose and liturgical Psalms for every Midnight watch', () => {
		const midnight = getArabicAgpeyaHourData('midnight')
		expect(midnight && 'watches' in midnight).toBe(true)
		if (!midnight || !('watches' in midnight)) return

		expect(midnight.opening.content[0]).toMatch(/[\u0600-\u06ff]/u)
		for (const watch of midnight.watches) {
			expect(watch.name).toMatch(/[\u0600-\u06ff]/u)
			expect(watch.litanies?.content[0]).toMatch(/[\u0600-\u06ff]/u)
			expect(watch.psalms?.length).toBe(watch.psalmRefs.length)
		}
		expect(midnight.watches[1].psalmRefs.map(({ psalmNumber }) => psalmNumber)).toEqual([
			119, 120, 121, 122, 123, 124, 125, 126, 127, 128,
		])
		expect(midnight.watches[2].psalmRefs[0].psalmNumber).toBe(129)
	})
})
