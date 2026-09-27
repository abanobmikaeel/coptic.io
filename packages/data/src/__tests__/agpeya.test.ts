import { describe, expect, it } from 'vitest'
import { getAgpeyaHourData as getArabicAgpeyaHourData } from '../ar/agpeya'
import arCommon from '../ar/agpeya/common.json'
import { getChapter, getMissingBooks } from '../cop/bible'
import {
	getAgpeyaHour,
	getAgpeyaHourIds,
	getCommonPrayer,
	getAgpeyaHourData as getEnglishAgpeyaHourData,
	isMidnightHour,
} from '../en/agpeya'
import enCommon from '../en/agpeya/common.json'

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

	it("ends each daytime hour with Kyrie, Holy Holy Holy, the Lord's Prayer, its Absolution and the Conclusion, in both languages", () => {
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
								'lords-prayer',
								'hail-to-you',
								'creed-introduction',
								'creed',
								'kyrie41',
								'holy-holy-holy',
								'lords-prayer',
								'compline-absolution',
								'conclusion-of-every-hour',
								'lords-prayer',
							]
						: [
								'kyrie41',
								'holy-holy-holy',
								'lords-prayer',
								`${hourId}-absolution`,
								'conclusion-of-every-hour',
								'lords-prayer',
							]
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
				'lords-prayer',
				'hail-to-you',
				'creed-introduction',
				'creed',
				'kyrie41',
				'holy-holy-holy',
				'lords-prayer',
				'prime-absolution',
				'prime-second-absolution',
				'conclusion-of-every-hour',
				'lords-prayer',
			])
			// The Lord's Prayer is its own section in the ending, not a separate slot.
			expect(prime.lordsPrayer, lang).toBeUndefined()
		}
	})

	// agpeya.org prays the Lord's Prayer once, as its own section, after Holy Holy Holy
	// and the Trisagion; neither may still carry it inline.
	it("prays the Lord's Prayer once, as its own section", () => {
		for (const [lang, getHour] of Object.entries(hours)) {
			for (const hourId of ['prime', ...DAY_HOURS] as const) {
				const hour = getHour(hourId) as { conclusion?: { id: string; content: string[] }[] }
				const ours = /^(Our Father|أبانا الذي)/
				for (const section of hour.conclusion ?? []) {
					const count = section.content.filter((line) => ours.test(line)).length
					expect(count, `${lang} ${hourId} ${section.id}`).toBe(
						section.id === 'lords-prayer' ? 1 : 0,
					)
				}
			}
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

describe('Midnight ending', () => {
	const loaders = { en: getEnglishAgpeyaHourData, ar: getArabicAgpeyaHourData } as const
	const commonOpening = { en: enCommon.sections.opening, ar: arCommon.sections.opening }
	const midnight = (lang: keyof typeof loaders) => {
		const hour = loaders[lang]('midnight')
		if (!hour || !isMidnightHour(hour)) throw new Error(`${lang} midnight missing`)
		return hour
	}

	// agpeya.org and copticchurch.net both close the first and second watches with
	// the 41 Kyrie, Holy Holy Holy and the Lord's Prayer after the litanies; the third
	// watch flows straight into the hour's own ending.
	it('closes the first two watches with Kyrie, Holy Holy Holy and the Lord’s Prayer', () => {
		for (const lang of ['en', 'ar'] as const) {
			const endings = midnight(lang).watches.map((w) => w.conclusion?.map((s) => s.id) ?? [])
			expect(endings, lang).toEqual([
				['kyrie41', 'holy-holy-holy', 'lords-prayer'],
				['kyrie41', 'holy-holy-holy', 'lords-prayer'],
				[],
			])
		}
	})

	// Shared prayers repeated in an ending (such as the Lord's Prayer) must not
	// displace the hour's own opening prayer or a watch's opening.
	it('keeps the hour opening as the Midnight opening, not a repeated shared prayer', () => {
		for (const lang of ['en', 'ar'] as const) {
			const hour = midnight(lang)
			// It begins with the Sign of the Cross, as every hour's introduction does.
			expect(hour.opening.content[0], lang).toBe(commonOpening[lang].content[0])
			for (const watch of hour.watches) expect(watch.opening, `${lang} ${watch.id}`).toBeUndefined()
		}
	})

	it('prays the same ending, in the same order, in English and Arabic', () => {
		const ids = Object.values(loaders).map((getHour) => {
			const hour = getHour('midnight')
			if (!hour || !isMidnightHour(hour)) throw new Error('midnight missing')
			return hour.conclusion?.map((s) => `${s.kind}:${s.id}`)
		})
		expect(ids[0]?.length).toBeGreaterThan(0)
		expect(ids[1]).toEqual(ids[0])
	})

	// The reader titles a section from the data; an untitled prose section would fall
	// back to an English label even in Arabic.
	it('titles every prose section in its own language', () => {
		for (const [lang, getHour] of Object.entries(loaders)) {
			const hour = getHour('midnight')
			if (!hour || !isMidnightHour(hour)) throw new Error(`${lang} midnight missing`)
			for (const section of hour.conclusion ?? []) {
				if (section.kind === 'gospel') continue
				expect(section.title, `${lang} ${section.id}`).toBeTruthy()
			}
		}
	})
})

describe('Gospel conclusion', () => {
	const hours = { en: getEnglishAgpeyaHourData, ar: getArabicAgpeyaHourData } as const
	const DAY_HOURS = ['prime', 'terce', 'sext', 'none', 'vespers', 'compline'] as const

	// agpeya.org and copticchurch.net follow every hour's (and every watch's) gospel with
	// "Glory be to God forever. Amen." and "We worship You, O Christ… for You have come".
	it('follows every gospel with the gospel conclusion, in both languages', () => {
		for (const [lang, getHour] of Object.entries(hours)) {
			for (const hourId of DAY_HOURS) {
				const hour = getHour(hourId)
				if (!hour || isMidnightHour(hour)) throw new Error(`${lang} ${hourId} missing`)
				expect(hour.gospelConclusion?.content, `${lang} ${hourId}`).toHaveLength(2)
			}
			const midnight = getHour('midnight')
			if (!midnight || !isMidnightHour(midnight)) throw new Error(`${lang} midnight missing`)
			for (const watch of midnight.watches) {
				expect(watch.gospelConclusion?.content, `${lang} ${watch.id}`).toHaveLength(2)
			}
		}
	})

	// After the closing midnight Gospel (Luke 2:29-32) both sources say only the doxology.
	it('ends the closing midnight Gospel with the doxology alone', () => {
		for (const [lang, getHour] of Object.entries(hours)) {
			const midnight = getHour('midnight')
			if (!midnight || !isMidnightHour(midnight)) throw new Error(`${lang} midnight missing`)
			const after = midnight.conclusion?.find((s) => s.id === 'midnight-tenouwst')
			expect(after && 'content' in after && after.content, lang).toEqual([
				lang === 'en' ? 'Glory to God forever. Amen.' : 'والمجد لله دائما. أمين.',
			])
		}
	})
})
