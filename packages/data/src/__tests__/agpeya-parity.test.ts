/**
 * Cross-language integrity checks for the Agpeya data.
 *
 * The reader renders English and Arabic side by side in aligned rows, so the
 * two files should be parallel texts: every prose block split into the same
 * number of lines, and every psalm divided into the same verses. Arabic is the
 * canonical text (embedded St-Takla liturgical psalter); English currently
 * resolves psalms from the Bible (Masoretic-style versification) and packs
 * prose into fewer lines, so most sections don't match yet.
 *
 * KNOWN_*_GAPS below is that backlog. The lists ratchet:
 *   - a section NOT listed must match exactly (no new drift can sneak in),
 *   - a section listed must STILL mismatch — fixing the data without removing
 *     its entry fails the test, so the lists always equal the remaining work.
 * When you fix a section by hand, delete its entry here.
 */
import { describe, expect, it } from 'vitest'
import order from '../agpeya/order.json'
import type { AgpeyaOrder, AgpeyaOrderEntry } from '../agpeya/types'
// Compare LOADER output, not raw JSON — an hour file names most of its sections
// by id, so only the composed hour is the text actually served.
import {
	getAgpeyaHourIds as arHourIds,
	getAgpeyaHour as getArAgpeyaHour,
	getAgpeyaHourData as getArHour,
} from '../ar/agpeya'
import arCommon from '../ar/agpeya/common.json'
import arCompline from '../ar/agpeya/compline.json'
import arMidnight from '../ar/agpeya/midnight.json'
import arNone from '../ar/agpeya/none.json'
import arPrime from '../ar/agpeya/prime.json'
import arSext from '../ar/agpeya/sext.json'
import arTerce from '../ar/agpeya/terce.json'
import arVespers from '../ar/agpeya/vespers.json'
import {
	getAgpeyaHourIds,
	getAgpeyaHour as getEnAgpeyaHour,
	getAgpeyaHourData as getEnHour,
} from '../en/agpeya'
import enCommon from '../en/agpeya/common.json'
import enCompline from '../en/agpeya/compline.json'
import enMidnight from '../en/agpeya/midnight.json'
import enNone from '../en/agpeya/none.json'
import enPrime from '../en/agpeya/prime.json'
import enSext from '../en/agpeya/sext.json'
import enTerce from '../en/agpeya/terce.json'
import enVespers from '../en/agpeya/vespers.json'
import enBible from '../en/bible/books.json'

const hourFiles = {
	en: [enPrime, enTerce, enSext, enNone, enVespers, enCompline, enMidnight],
	ar: [arPrime, arTerce, arSext, arNone, arVespers, arCompline, arMidnight],
}

// Empty: every prose section now matches line-for-line in both languages.
const KNOWN_PROSE_GAPS = new Set<string>()

const KNOWN_PSALM_GAPS = new Set<string>([])

// ── data walking ─────────────────────────────────────────────────────────────

interface Block {
	content?: string[]
}
interface Psalm {
	verses?: unknown[]
}
interface Unit {
	[key: string]: unknown
	psalmRefs?: { psalmNumber: number }[]
	psalms?: Psalm[]
	introductoryPsalm?: Psalm & { psalmNumber?: number }
	watches?: (Unit & { id: string })[]
}

const isBlock = (v: unknown): v is Block =>
	typeof v === 'object' && v !== null && Array.isArray((v as Block).content)

const units: { path: string; en: Unit; ar: Unit }[] = getAgpeyaHourIds().flatMap((hourId) => {
	const e = (getEnHour(hourId) ?? {}) as Unit
	const a = (getArHour(hourId) ?? {}) as Unit
	return [
		{ path: hourId, en: e, ar: a },
		...(e.watches ?? []).map((watch, i) => ({
			path: `${hourId}.${watch.id}`,
			en: watch as Unit,
			ar: (a.watches?.[i] ?? {}) as Unit,
		})),
	]
})

// English psalms resolve from the Bible via LXX→Masoretic mapping. Mirrors
// lxxPsalmSegments in apps/api/src/services/psalm-resolver.ts (runtime source
// of truth) — keep the two in sync.
const enPsalmsBook = (
	enBible as { books: { name: string; chapters: { num: number; verses: unknown[] }[] }[] }
).books.find((b) => b.name === 'Psalms')
function lxxSegments(n: number): { chapter: number; start?: number; end?: number }[] {
	if (n <= 8) return [{ chapter: n }]
	if (n === 9) return [{ chapter: 9 }, { chapter: 10 }]
	if (n <= 112) return [{ chapter: n + 1 }]
	if (n === 113) return [{ chapter: 114 }, { chapter: 115 }]
	if (n === 114) return [{ chapter: 116, start: 1, end: 9 }]
	if (n === 115) return [{ chapter: 116, start: 10, end: 19 }]
	if (n <= 145) return [{ chapter: n + 1 }]
	if (n === 146) return [{ chapter: 147, start: 1, end: 11 }]
	if (n === 147) return [{ chapter: 147, start: 12, end: 20 }]
	if (n <= 150) return [{ chapter: n }]
	return []
}
function enVerseCount(lxx: number): number {
	return lxxSegments(lxx).reduce((sum, seg) => {
		const ch = enPsalmsBook?.chapters.find((c) => c.num === seg.chapter)
		if (!ch) return sum
		return (
			sum + (seg.start != null ? (seg.end ?? ch.verses.length) - seg.start + 1 : ch.verses.length)
		)
	}, 0)
}

// Every comparable site → line/verse counts per language.
const proseCounts = new Map<string, { en: number; ar: number }>()
const psalmCounts = new Map<string, { en: number; ar: number }>()
for (const { path, en: e, ar: a } of units) {
	const keys = [...new Set([...Object.keys(e), ...Object.keys(a)])].filter(
		(k) => isBlock(e[k]) || isBlock(a[k]),
	)
	for (const key of keys) {
		proseCounts.set(`${path}.${key}`, {
			en: isBlock(e[key]) ? (e[key] as Block).content!.length : 0,
			ar: isBlock(a[key]) ? (a[key] as Block).content!.length : 0,
		})
	}
	const conclusion = (u: Unit) =>
		new Map(
			((u.conclusion ?? []) as (Block & { id: string })[]).map((b) => [
				b.id,
				b.content?.length ?? 0,
			]),
		)
	const [enConclusion, arConclusion] = [conclusion(e), conclusion(a)]
	for (const id of new Set([...enConclusion.keys(), ...arConclusion.keys()])) {
		proseCounts.set(`${path}.conclusion.${id}`, {
			en: enConclusion.get(id) ?? 0,
			ar: arConclusion.get(id) ?? 0,
		})
	}
	;(e.psalmRefs ?? []).forEach((ref, i) => {
		const arCount = a.psalms?.[i]?.verses?.length ?? 0
		// No Arabic embedding → runtime resolves both languages the same way.
		if (arCount === 0) return
		// English serves its embedded liturgical psalm when present, else the Bible.
		const enCount = e.psalms?.[i]?.verses?.length ?? enVerseCount(ref.psalmNumber)
		psalmCounts.set(`${path}/psalm-${ref.psalmNumber}`, { en: enCount, ar: arCount })
	})
	if (e.introductoryPsalm?.psalmNumber != null && a.introductoryPsalm?.verses?.length) {
		psalmCounts.set(`${path}/intro-psalm`, {
			en: enVerseCount(e.introductoryPsalm.psalmNumber),
			ar: a.introductoryPsalm.verses.length,
		})
	}
}

// ── invariants ───────────────────────────────────────────────────────────────

describe('agpeya rite parity', () => {
	// Both languages compose from one shared order (agpeya/order.json), so the reader
	// can align them by id; a section missing from either language fails to load
	// rather than misaligning the columns.
	it('prays the same sections in the same order in both languages', () => {
		for (const hourId of getAgpeyaHourIds()) {
			const ids = (hour: ReturnType<typeof getEnAgpeyaHour>): string[] =>
				(hour?.parts ?? []).flatMap((part) =>
					'group' in part ? [part.group, ...part.sections.map((s) => s.id)] : [part.id],
				)
			expect(ids(getArAgpeyaHour(hourId)), `${hourId}: order differs`).toEqual(
				ids(getEnAgpeyaHour(hourId)),
			)
		}
	})
})

describe('agpeya data cross-language parity', () => {
	it('has identical hours and psalm sequences', () => {
		expect(arHourIds()).toEqual(getAgpeyaHourIds())
		for (const { path, en: e, ar: a } of units) {
			const nums = (u: Unit) => (u.psalmRefs ?? []).map((r) => r.psalmNumber)
			expect(nums(a), `${path}: psalmRefs differ`).toEqual(nums(e))
		}
	})

	it('splits prose blocks into the same lines (ratcheted by KNOWN_PROSE_GAPS)', () => {
		for (const [path, { en: e, ar: a }] of proseCounts) {
			if (KNOWN_PROSE_GAPS.has(path)) {
				expect(e, `${path} now matches (${e} lines) — remove it from KNOWN_PROSE_GAPS`).not.toBe(a)
			} else {
				expect(`${path}: en=${e} ar=${a}`).toBe(`${path}: en=${e} ar=${e}`)
			}
		}
	})

	it('divides psalms into the same verses (ratcheted by KNOWN_PSALM_GAPS)', () => {
		for (const [id, { en: e, ar: a }] of psalmCounts) {
			if (KNOWN_PSALM_GAPS.has(id)) {
				expect(e, `${id} now matches (${e} verses) — remove it from KNOWN_PSALM_GAPS`).not.toBe(a)
			} else {
				expect(`${id}: en=${e} ar=${a}`).toBe(`${id}: en=${e} ar=${e}`)
			}
		}
	})

	it('lists only real sections in the gap ratchets (stale entries mean the data moved)', () => {
		for (const path of KNOWN_PROSE_GAPS) {
			expect(proseCounts.has(path), `${path} not found — remove it from KNOWN_PROSE_GAPS`).toBe(
				true,
			)
		}
		for (const id of KNOWN_PSALM_GAPS) {
			expect(psalmCounts.has(id), `${id} not found — remove it from KNOWN_PSALM_GAPS`).toBe(true)
		}
	})

	// With the order stored apart from the text, a section dropped from the order
	// would linger unprayed in the language files. Every stored section is used.
	it('prays every section each language stores', () => {
		const flat = (entries: AgpeyaOrderEntry[]) =>
			entries.flatMap((e) => (typeof e === 'string' ? [e] : e.order))
		const used = new Set(Object.values(order as AgpeyaOrder).flatMap(flat))
		for (const [lang, files] of Object.entries(hourFiles)) {
			for (const file of files) {
				for (const section of file.sections) {
					expect(used.has(section.id), `${lang} ${file.id}: ${section.id}`).toBe(true)
				}
			}
			const common = lang === 'en' ? enCommon : arCommon
			for (const id of Object.keys(common.sections)) {
				expect(used.has(id), `${lang} common: ${id}`).toBe(true)
			}
		}
	})
})
