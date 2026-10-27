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
import { findOneModeAuthoringErrors } from '../content'
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
	mode?: 'all' | 'one'
	blocks?: { when?: Record<string, unknown>; content: Content[] }[]
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
/** Every text a section can resolve to: its fixed content, or each conditional block's. */
const variants = (s: Section | undefined): Content[][] =>
	s?.blocks ? s.blocks.map((b) => b.content) : s?.content ? [s.content] : []
const allLines = (s: Section): Content[] => variants(s).flat()

describe('liturgy data cross-language parity', () => {
	it('has identical section ids, order, and types', () => {
		const shape = (lang: Lang) => services[lang].sections.map((s) => `${s.id}:${s.type}:${s.role}`)
		expect(shape('ar')).toEqual(shape('en'))
		expect(shape('cop')).toEqual(shape('en'))
	})

	it('stores Coptic prayer text as Unicode rather than legacy font encoding', () => {
		for (const s of services.cop.sections) {
			for (const item of allLines(s).filter((entry) => !isRubric(entry))) {
				expect(text(item)).toMatch(/[Ⲁ-⳿]/u)
				expect(text(item)).not.toMatch(/(?:\/en|p\[oic|n;ok)/i)
			}
		}
	})

	for (const enSection of services.en.sections) {
		const enVariants = variants(enSection)
		if (enVariants.length === 0) continue

		it(`${enSection.id}: speaker sequences match across languages that carry the section`, () => {
			for (const lang of ['ar', 'cop'] as Lang[]) {
				const other = variants(section(lang, enSection.id))
				expect(other.length, `${lang} variant count differs`).toEqual(enVariants.length)
				enVariants.forEach((enContent, v) => {
					const en = speakers(enContent)
					const seq = speakers(other[v] ?? [])
					// A language with no source text (Coptic for absolution-to-the-son) renders no
					// column — parity is only defined between languages that both have content.
					if (seq.length === 0) return

					// Row alignment is the invariant that matters: the reader lays the languages
					// out turn by turn, so a differing line count misaligns the columns.
					expect(seq.length, `${lang} variant ${v}: line count differs`).toEqual(en.length)

					// Attribution is only comparable where the source labels speakers at all.
					// Some Coptic pages carry the text without "Ⲡⲓⲟⲩⲏⲃ"/"Ⲡⲓⲡ̀ⲣⲉⲥⲃⲩⲧⲉⲣⲟⲥ" even where
					// the English and Arabic label it; that is a source convention, not drift,
					// and inventing the label would be inventing rubric.
					if (seq.every((s) => s === undefined)) return
					expect(seq).toEqual(en)
				})
			}
		})
	}

	it('authors conditional blocks identically in every language', () => {
		for (const enSection of services.en.sections.filter((s) => s.blocks)) {
			const conditions = (lang: Lang) => {
				const s = section(lang, enSection.id)
				return { mode: s?.mode, when: s?.blocks?.map((b) => b.when ?? null) }
			}
			expect(conditions('ar'), enSection.id).toEqual(conditions('en'))
			expect(conditions('cop'), enSection.id).toEqual(conditions('en'))
		}
	})

	it('every prayer section has text in English and Arabic (a source page that parses to zero rows would write empty content silently)', () => {
		for (const lang of ['en', 'ar'] as Lang[]) {
			for (const s of services[lang].sections) {
				variants(s).forEach((content, v) => {
					expect(`${lang}/${s.id}[${v}]: ${content.length} lines`).not.toBe(
						`${lang}/${s.id}[${v}]: 0 lines`,
					)
				})
			}
		}
	})

	it('has no adjacent duplicate lines', () => {
		for (const lang of LANGS) {
			for (const s of services[lang].sections) {
				for (const content of variants(s)) {
					const lines = content.map(text)
					for (let i = 1; i < lines.length; i++) {
						expect(`${s.id}/${lang}: ${lines[i]}`).not.toBe(`${s.id}/${lang}: ${lines[i - 1]}`)
					}
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

	it('authors every first-match section with a reachable default', () => {
		for (const lang of LANGS) {
			for (const s of services[lang].sections.filter((x) => x.mode === 'one')) {
				const blocks = (s.blocks ?? []) as Parameters<typeof findOneModeAuthoringErrors>[1]
				expect(findOneModeAuthoringErrors(`${lang}/${s.id}`, blocks)).toEqual([])
			}
		}
	})

	it('sings the festive Trisagion verse thrice, in place of the three annual verses', () => {
		const verse: Record<string, Record<Lang, RegExp>> = {
			nativity: { en: /born of the Virgin/, ar: /ولد من العذراء/, cop: /ⲅⲉⲛⲛⲉⲑⲏⲥ/ },
			theophany: { en: /baptized in the Jordan/, ar: /إعتمد في الأردن/, cop: /ⲃⲁⲡⲧⲓⲥⲧⲏⲥ/ },
			resurrection: { en: /who rose from the dead,/, ar: /قام من الأموات،/, cop: /ⲛⲉⲕⲣⲱⲛ:/ },
			ascension: { en: /ascended into the heavens/, ar: /وصعد إلى السموات/, cop: /ⲟⲩⲣⲁⲛⲟⲩⲥ/ },
		}
		for (const lang of LANGS) {
			const blocks = section(lang, 'trisagion')?.blocks ?? []
			for (const [season, pattern] of Object.entries(verse)) {
				const block = blocks.find((b) => b.when?.festiveSeason === season)
				const first = text(block?.content[0] ?? '')
				expect(first, `${lang}/${season}`).toMatch(pattern[lang])
				expect(first, `${lang}/${season}`).toMatch(/\((3|ⲅ̅|ثلاث مرات)\)|\[Three Times\]$/)
				// The festive form continues with the annual hymn from the Doxa on.
				expect(block?.content.slice(1)).toEqual(blocks.at(-1)?.content.slice(3))
			}
		}
	})

	it('completes the abbreviated stanzas of the festive pages instead of printing an ellipsis', () => {
		for (const lang of LANGS) {
			for (const s of services[lang].sections.filter((x) => x.blocks)) {
				for (const line of allLines(s)) {
					expect(`${lang}/${s.id}: ${text(line)}`).not.toMatch(/(\.\.\.|…)\.?$/)
				}
			}
		}
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
