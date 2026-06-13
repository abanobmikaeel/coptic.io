/**
 * Cross-language integrity checks for the incense (Raising of Incense) data.
 *
 * The three language files are parallel texts: a reader displays them side by side,
 * turn by turn. Every non-rubric line in one language must therefore have a counterpart
 * with the same speaker in the other two — a drifted section renders as blank or
 * misaligned columns. Rubric lines (staging directions) are allowed to differ: the
 * Coptic source carries none.
 */
import { describe, expect, it } from 'vitest'
import arData from '../ar/incense/incense.json'
import copData from '../cop/incense/incense.json'
import enData from '../en/incense/incense.json'

type Lang = 'en' | 'ar' | 'cop'

interface Line {
	speaker?: string
	text: string
	isRubric?: boolean
}
type Content = string | Line

interface Block {
	when?: Record<string, unknown>
	content: Content[]
}

interface Section {
	id: string
	type: string
	role: string
	optional?: boolean
	content?: Content[]
	blocks?: Block[]
}

const services: Record<Lang, { sections: Section[] }> = {
	en: enData.evening as { sections: Section[] },
	ar: arData.evening as { sections: Section[] },
	cop: copData.evening as { sections: Section[] },
}
const LANGS: Lang[] = ['en', 'ar', 'cop']

const text = (c: Content): string => (typeof c === 'string' ? c : c.text)
const isRubric = (c: Content): boolean => typeof c === 'object' && c.isRubric === true
const speakers = (content: Content[]): (string | undefined)[] =>
	content.filter((c) => !isRubric(c)).map((c) => (typeof c === 'string' ? undefined : c.speaker))

describe('incense data cross-language parity', () => {
	it('has identical section ids, order, and types', () => {
		const shape = (lang: Lang) => services[lang].sections.map((s) => `${s.id}:${s.type}:${s.role}`)
		expect(shape('ar')).toEqual(shape('en'))
		expect(shape('cop')).toEqual(shape('en'))
	})

	for (const section of services.en.sections) {
		if (!section.content && !section.blocks) continue

		it(`${section.id}: speaker sequences match across languages`, () => {
			const seq = (lang: Lang) => {
				const s = services[lang].sections.find((x) => x.id === section.id)
				if (!s) return null
				if (s.blocks) {
					return s.blocks.map((b) => ({ when: b.when ?? null, speakers: speakers(b.content) }))
				}
				return speakers(s.content ?? [])
			}
			expect(seq('ar')).toEqual(seq('en'))
			expect(seq('cop')).toEqual(seq('en'))
		})
	}

	it('every prayer section has text in every language (a source page that parses to zero rows would write empty content silently)', () => {
		for (const lang of LANGS) {
			for (const section of services[lang].sections) {
				if (!section.content && !section.blocks) continue // scripture sections resolve at runtime
				if (section.content) {
					expect(`${lang}/${section.id}: ${section.content.length} lines`).not.toBe(
						`${lang}/${section.id}: 0 lines`,
					)
				}
				for (const block of section.blocks ?? []) {
					expect(`${lang}/${section.id} block: ${block.content.length} lines`).not.toBe(
						`${lang}/${section.id} block: 0 lines`,
					)
				}
			}
		}
	})

	it('has no adjacent duplicate lines', () => {
		for (const lang of LANGS) {
			for (const section of services[lang].sections) {
				const lists = section.content
					? [section.content]
					: (section.blocks ?? []).map((b) => b.content)
				for (const list of lists) {
					const lines = list.map(text)
					for (let i = 1; i < lines.length; i++) {
						expect(`${section.id}/${lang}: ${lines[i]}`).not.toBe(
							`${section.id}/${lang}: ${lines[i - 1]}`,
						)
					}
				}
			}
		}
	})
})

describe('incense liturgical invariants', () => {
	it('Vespers prays the Departed litany; Sick/Travelers/Oblations are optional Matins extras', () => {
		const byId = new Map(services.en.sections.map((s) => [s.id, s]))
		expect(byId.get('litany-departed')?.optional).toBeUndefined()
		for (const id of ['litany-sick', 'litany-travelers', 'litany-oblations']) {
			expect(byId.get(id)?.optional).toBe(true)
		}
	})

	it('Graciously accord uses the evening wording ("this night") in every language', () => {
		const night: Record<Lang, RegExp> = {
			en: /this night without sin/,
			ar: /اللَّيْلَة|الليلة/,
			cop: /paiejwrh/, // ϧⲉⲛ ⲡⲁⲓⲉ̀ϫⲱⲣϩ in the CS Avva Shenouda ASCII encoding
		}
		for (const lang of LANGS) {
			const section = services[lang].sections.find((s) => s.id === 'graciously-o-lord')
			expect(section?.content?.some((c) => night[lang].test(text(c)))).toBe(true)
		}
	})

	it('Litany for the Nature has one block per season plus the shared continuation', () => {
		for (const lang of LANGS) {
			const section = services[lang].sections.find((s) => s.id === 'litany-nature')
			const whens = (section?.blocks ?? []).map((b) => b.when?.season ?? null)
			expect(whens).toEqual(['waters', 'plants', 'fruits', null])
		}
	})

	it('Verses of Cymbals has mutually exclusive Adam and Watos intros', () => {
		for (const lang of LANGS) {
			const section = services[lang].sections.find((s) => s.id === 'verses-of-cymbals')
			const tunes = (section?.blocks ?? []).map((b) => b.when?.dayTune).filter(Boolean)
			expect(tunes.sort()).toEqual(['adam', 'watos'])
		}
	})

	it('Short Blessing gates the Lord’s-Day blessing on Sunday (weekday 0), not a rubric', () => {
		for (const lang of LANGS) {
			const section = services[lang].sections.find((s) => s.id === 'short-blessing')
			// Conditional section, not flat content
			expect(section?.content).toBeUndefined()
			const whens = (section?.blocks ?? []).map((b) => b.when ?? null)
			expect(whens).toEqual([null, { weekday: 0 }, null])
			// The "On Sunday, add:" guidance is gone — the date drives it now
			const allText = (section?.blocks ?? [])
				.flatMap((b) => b.content)
				.map(text)
				.join(' ')
			expect(allText).not.toMatch(/On Sunday|إذا كان يوم الأحد|And he continues|ثم يكمل/)
		}
	})
})
