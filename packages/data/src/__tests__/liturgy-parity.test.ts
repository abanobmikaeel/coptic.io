/**
 * Cross-language integrity checks for the Divine Liturgy (St. Basil) data.
 *
 * The three language files are parallel texts: a reader displays them side by side,
 * turn by turn. Every non-rubric line in one language must therefore have a counterpart
 * with the same speaker in the others — a drifted section renders as blank or
 * misaligned columns. Rubric lines (staging directions) are allowed to differ: the
 * Coptic source carries none.
 *
 * One source gap is pinned, not patched: the Three Absolutions page on tasbeha.org has
 * no Coptic column, so `absolution-to-the-son` is English/Arabic only. Coptic content
 * must not be invented to fill it — the reader simply shows no Coptic column there.
 */
import { describe, expect, it } from 'vitest'
import arData from '../ar/liturgy/liturgy.json'
import copData from '../cop/liturgy/liturgy.json'
import enData from '../en/liturgy/liturgy.json'

type Lang = 'en' | 'ar' | 'cop'

interface Line {
	speaker?: string
	text: string
	isRubric?: boolean
}
type Content = string | Line

interface Section {
	id: string
	type: string
	role: string
	title: string
	titleLanguage?: string
	reading?: string
	content?: Content[]
}

const services: Record<Lang, { id: string; sections: Section[] }> = {
	en: enData.basil as { id: string; sections: Section[] },
	ar: arData.basil as { id: string; sections: Section[] },
	cop: copData.basil as { id: string; sections: Section[] },
}
const LANGS: Lang[] = ['en', 'ar', 'cop']

const text = (c: Content): string => (typeof c === 'string' ? c : c.text)
const isRubric = (c: Content): boolean => typeof c === 'object' && c.isRubric === true
const speakers = (content: Content[]): (string | undefined)[] =>
	content.filter((c) => !isRubric(c)).map((c) => (typeof c === 'string' ? undefined : c.speaker))
const section = (lang: Lang, id: string) => services[lang].sections.find((s) => s.id === id)

describe('liturgy data cross-language parity', () => {
	it('has identical section ids, order, and types', () => {
		const shape = (lang: Lang) => services[lang].sections.map((s) => `${s.id}:${s.type}:${s.role}`)
		expect(shape('ar')).toEqual(shape('en'))
		expect(shape('cop')).toEqual(shape('en'))
	})

	it('stores Coptic prayer text as Unicode rather than legacy font encoding', () => {
		for (const s of services.cop.sections) {
			for (const item of (s.content ?? []).filter((entry) => !isRubric(entry))) {
				expect(text(item)).toMatch(/[Ⲁ-⳿]/u)
				expect(text(item)).not.toMatch(/(?:\/en|p\[oic|n;ok)/i)
			}
		}
	})

	for (const enSection of services.en.sections) {
		// Bound outside the closure: narrowing `enSection.content` does not survive
		// into the callback, since a property could in principle change before it runs.
		const enContent = enSection.content
		if (!enContent) continue

		it(`${enSection.id}: speaker sequences match across languages that carry the section`, () => {
			const en = speakers(enContent)
			for (const lang of ['ar', 'cop'] as Lang[]) {
				const other = section(lang, enSection.id)
				const seq = speakers(other?.content ?? [])
				// A language with no source text (Coptic for absolution-to-the-son) renders no
				// column — parity is only defined between languages that both have content.
				if (seq.length === 0) continue
				expect(seq).toEqual(en)
			}
		})
	}

	it('every prayer section has text in English and Arabic (a source page that parses to zero rows would write empty content silently)', () => {
		for (const lang of ['en', 'ar'] as Lang[]) {
			for (const s of services[lang].sections) {
				if (!s.content) continue // scripture sections resolve at runtime
				expect(`${lang}/${s.id}: ${s.content.length} lines`).not.toBe(`${lang}/${s.id}: 0 lines`)
			}
		}
	})

	it('has no adjacent duplicate lines', () => {
		for (const lang of LANGS) {
			for (const s of services[lang].sections) {
				const lines = (s.content ?? []).map(text)
				for (let i = 1; i < lines.length; i++) {
					expect(`${s.id}/${lang}: ${lines[i]}`).not.toBe(`${s.id}/${lang}: ${lines[i - 1]}`)
				}
			}
		}
	})
})

describe('liturgy liturgical invariants', () => {
	it('serves the St. Basil rite', () => {
		for (const lang of LANGS) {
			expect(services[lang].id).toBe('basil')
		}
	})

	it('resolves the day’s epistles from the Katameros, in liturgical order', () => {
		const epistles = services.en.sections.filter((s) => s.type === 'epistle')
		expect(epistles.map((s) => s.reading)).toEqual(['pauline', 'catholic', 'praxis'])
	})

	it('has exactly one daily psalm and one gospel section', () => {
		expect(services.en.sections.filter((s) => s.type === 'daily-psalm')).toHaveLength(1)
		expect(services.en.sections.filter((s) => s.type === 'gospel')).toHaveLength(1)
	})

	it('uses the daytime wording in the Thanksgiving Prayer (the liturgy is a morning service)', () => {
		const day: Record<Lang, RegExp> = {
			en: /this holy day/,
			ar: /هذا اليوم/,
			cop: /ⲡⲁⲓⲉ̀?ϩⲟⲟⲩ/,
		}
		const night: Record<Lang, RegExp> = {
			en: /this holy night/,
			ar: /هذه الليلة/,
			cop: /ⲡⲁⲓⲉ̀?ϫⲱⲣϩ/,
		}
		for (const lang of LANGS) {
			const content = section(lang, 'thanksgiving')?.content ?? []
			expect(content.some((c) => day[lang].test(text(c)))).toBe(true)
			expect(content.some((c) => night[lang].test(text(c)))).toBe(false)
		}
	})

	it('prays the Lord’s Prayer twice: after the Trisagion and after the Fraction', () => {
		const marker: Record<Lang, RegExp> = {
			en: /Our Father who art/,
			ar: /أبانا الذي/,
			cop: /Ϫⲉ Ⲡⲉⲛⲓⲱⲧ/,
		}
		for (const lang of LANGS) {
			for (const id of ['lord-prayer-post-trisagion', 'lords-prayer']) {
				const content = section(lang, id)?.content ?? []
				expect(content.some((c) => marker[lang].test(text(c)))).toBe(true)
			}
		}
	})

	it('pins the Absolution to the Son source gap: English and Arabic text, no Coptic', () => {
		expect((section('en', 'absolution-to-the-son')?.content ?? []).length).toBeGreaterThan(0)
		expect((section('ar', 'absolution-to-the-son')?.content ?? []).length).toBeGreaterThan(0)
		expect(section('cop', 'absolution-to-the-son')?.content ?? []).toEqual([])
	})

	it('labels Coptic title fallbacks instead of silently translating', () => {
		for (const s of services.cop.sections) {
			const hasCopticTitle = /[Ⲁ-⳿]/u.test(s.title)
			if (!hasCopticTitle) {
				expect(`${s.id}: ${s.titleLanguage}`).toBe(`${s.id}: en`)
			}
		}
	})
})
