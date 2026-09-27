import { describe, expect, it } from 'vitest'
import { getAgpeyaHourData as getArabicAgpeyaHourData } from '../ar/agpeya'
import { getChapter, getMissingBooks } from '../cop/bible'
import {
	getAgpeyaHour,
	getAgpeyaHourIds,
	getCommonPrayer,
	getAgpeyaHourData as getEnglishAgpeyaHourData,
} from '../en/agpeya'

describe('English Agpeya shared prayers', () => {
	it('prays the one shared Thanksgiving Prayer at every hour', () => {
		const thanksgiving = getCommonPrayer('thanksgiving-prayer')

		expect(thanksgiving).not.toBeNull()
		expect(thanksgiving?.content).toHaveLength(4)

		// Sharing is by reference since the split: every hour names the same
		// section id, so the text cannot drift hour to hour the way it once did.
		for (const hourId of getAgpeyaHourIds()) {
			expect(getAgpeyaHour(hourId)?.parts).toContainEqual(thanksgiving)
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

describe('Agpeya concluding sequence', () => {
	const DAY_HOURS = ['terce', 'sext', 'none', 'vespers', 'compline'] as const
	const hours = { en: getEnglishAgpeyaHourData, ar: getArabicAgpeyaHourData }

	it('ends each daytime hour with Kyrie, Holy Holy Holy, its Absolution and the Conclusion, in both languages', () => {
		for (const [lang, getHour] of Object.entries(hours)) {
			for (const hourId of DAY_HOURS) {
				const hour = getHour(hourId)
				if (!hour || 'watches' in hour) throw new Error(`${lang} ${hourId} missing`)

				// Compline carries "Graciously O Lord", then the Trisagion, the Hail to
				// Saint Mary and the Creed before the Kyrie.
				const expected =
					hourId === 'compline'
						? [
								'compline-graciously',
								'trisagion',
								'hail-to-you',
								'creed-introduction',
								'creed',
								'kyrie41',
								'holy-holy-holy',
								'compline-absolution',
								'conclusion-of-every-hour',
							]
						: ['kyrie41', 'holy-holy-holy', `${hourId}-absolution`, 'conclusion-of-every-hour']
				expect(
					hour.conclusion?.map((s) => s.id),
					`${lang} ${hourId}`,
				).toEqual(expected)
				expect(hour.closing, `${lang} ${hourId}`).toBeUndefined()
			}
		}
	})

	it('prays the Kyrie forty-one times', () => {
		for (const [lang, getHour] of Object.entries(hours)) {
			const kyrie = (
				getHour('terce') as { conclusion?: { id: string; content: string[] }[] }
			).conclusion?.find((s) => s.id === 'kyrie41')
			const phrase = lang === 'en' ? /Lord have mercy\./g : /يا رب ارحم\./g
			expect(kyrie?.content.join(' ').match(phrase), lang).toHaveLength(41)
		}
	})

	it('prays Prime from the litanies through both absolutions and the Conclusion', () => {
		for (const [lang, getHour] of Object.entries(hours)) {
			const prime = getHour('prime') as { conclusion?: { id: string }[]; lordsPrayer?: unknown }
			expect(
				prime.conclusion?.map((s) => s.id),
				lang,
			).toEqual([
				'gloria',
				'trisagion',
				'hail-to-you',
				'creed-introduction',
				'creed',
				'kyrie41',
				'holy-holy-holy',
				'prime-absolution',
				'prime-second-absolution',
				'conclusion-of-every-hour',
			])
			// The Lord's Prayer is prayed within the Trisagion and Holy Holy Holy now
			expect(prime.lordsPrayer, lang).toBeUndefined()
		}
	})

	it('keeps the Arabic free of legacy ASCII-font Coptic', () => {
		const prime = getArabicAgpeyaHourData('prime') as {
			litanies: { content: string[] }
			conclusion?: { content: string[] }[]
		}
		const text = [...prime.litanies.content, ...(prime.conclusion ?? []).flatMap((s) => s.content)]
		expect(text.filter((line) => /[A-Za-z`]/.test(line))).toEqual([])
	})

	// Regression: English once ended these hours in prayers that aren't the absolutions
	it.each([
		['terce', /^O God of all compassion, and Lord of all comfort/],
		['sext', /^We thank You, our King, the Almighty/],
		['none', /^God, Father, the Father of our Lord/],
		['vespers', /^We thank You, our compassionate king/],
		['compline', /^Lord, all our sins which we committed against You in this day/],
	] as const)('prays the %s absolution from the source', (hourId, opening) => {
		const hour = getEnglishAgpeyaHourData(hourId) as {
			conclusion?: { id: string; content: string[] }[]
		}
		const absolution = hour.conclusion?.find((s) => s.id === `${hourId}-absolution`)
		expect(absolution?.content[0]).toMatch(opening)
	})
})
