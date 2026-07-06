/**
 * Agpeya cross-language gap report.
 *
 * Prints, per hour, every place the English and Arabic Agpeya data disagree in
 * structure — the backlog for the data-parity work:
 *   - prose blocks whose line counts differ (same prayer split differently, or
 *     text genuinely missing in one language)
 *   - psalms whose verse divisions differ (Arabic embeds the St-Takla
 *     liturgical psalter; English resolves from the Bible via LXX mapping, so
 *     the two use different versification until English gets embedded psalms
 *     split to match the Arabic)
 *
 * Ends with ready-to-paste KNOWN_GAPS entries for agpeya-parity.test.ts, which
 * ratchets this backlog: fixing a section without removing its entry fails the
 * test, so the allowlist always equals the remaining work.
 *
 * Run: npx tsx scripts/agpeya-gap-report.ts
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
// Compare LOADER output, not raw JSON — the English loader substitutes the
// shared thanksgiving prayer from common.json, and the loaders are what the
// API (and therefore the reader) actually serves.
import { getAgpeyaHourData as getArHour } from '../src/ar/agpeya'
import { getAgpeyaHourIds, getAgpeyaHourData as getEnHour } from '../src/en/agpeya'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')
const enBible = JSON.parse(readFileSync(join(root, 'en/bible/books.json'), 'utf8'))

const enPsalms = enBible.books.find((b: { name: string }) => b.name === 'Psalms')

// LXX → Masoretic chapter segments. Mirrors lxxPsalmSegments in
// apps/api/src/services/psalm-resolver.ts (the runtime source of truth).
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
		const ch = enPsalms.chapters.find((c: { num: number }) => c.num === seg.chapter)
		if (!ch) return sum
		const count =
			seg.start != null ? (seg.end ?? ch.verses.length) - seg.start + 1 : ch.verses.length
		return sum + count
	}, 0)
}

type Block = { content?: string[] }
type Psalm = { title?: string; verses?: unknown[] }
type Hour = Record<string, unknown> & {
	psalmRefs?: { psalmNumber: number }[]
	psalms?: Psalm[]
	introductoryPsalm?: Psalm & { psalmNumber?: number }
	watches?: (Record<string, unknown> & { id: string })[]
}

const isBlock = (v: unknown): v is Block =>
	typeof v === 'object' && v !== null && Array.isArray((v as Block).content)

const proseGaps: string[] = []
const psalmGaps: string[] = []

function compareUnit(
	path: string,
	enUnit: Record<string, unknown>,
	arUnit: Record<string, unknown>,
) {
	// Prose blocks: every key that is a { content: [...] } block in either language.
	const keys = [...new Set([...Object.keys(enUnit), ...Object.keys(arUnit)])].filter(
		(k) => isBlock(enUnit[k]) || isBlock(arUnit[k]),
	)
	for (const key of keys) {
		const e = isBlock(enUnit[key]) ? (enUnit[key] as Block).content!.length : 0
		const a = isBlock(arUnit[key]) ? (arUnit[key] as Block).content!.length : 0
		const mark = e === a ? '  ✓' : '  ✗'
		console.log(`${mark} ${path}.${key}: en=${e} ar=${a}`)
		if (e !== a) proseGaps.push(`${path}.${key}`)
	}

	// Psalm versification: Arabic embedded verses vs English Bible resolution.
	const refs = (enUnit as Hour).psalmRefs ?? []
	const arEmbedded = (arUnit as Hour).psalms ?? []
	refs.forEach((ref, i) => {
		const arCount = arEmbedded[i]?.verses?.length ?? 0
		const eCount = enVerseCount(ref.psalmNumber)
		if (arCount === 0) return // Arabic not embedded here; runtime uses the same Bible path
		const mark = eCount === arCount ? '  ✓' : '  ✗'
		console.log(`${mark} ${path} Psalm ${ref.psalmNumber} (LXX): en=${eCount} ar=${arCount}`)
		if (eCount !== arCount) psalmGaps.push(`${path}/psalm-${ref.psalmNumber}`)
	})

	const enIntro = (enUnit as Hour).introductoryPsalm
	const arIntro = (arUnit as Hour).introductoryPsalm
	if (enIntro?.psalmNumber != null && arIntro?.verses?.length) {
		const eCount = enVerseCount(enIntro.psalmNumber)
		const aCount = arIntro.verses.length
		const mark = eCount === aCount ? '  ✓' : '  ✗'
		console.log(
			`${mark} ${path} intro Psalm ${enIntro.psalmNumber} (LXX): en=${eCount} ar=${aCount}`,
		)
		if (eCount !== aCount) psalmGaps.push(`${path}/intro-psalm`)
	}
}

for (const hourId of getAgpeyaHourIds()) {
	const enHour = (getEnHour(hourId) ?? {}) as Hour
	const arHour = (getArHour(hourId) ?? {}) as Hour
	console.log(`\n── ${hourId} ${'─'.repeat(50 - hourId.length)}`)
	compareUnit(hourId, enHour, arHour)
	const enWatches = enHour.watches ?? []
	const arWatches = arHour.watches ?? []
	enWatches.forEach((w, i) => compareUnit(`${hourId}.${w.id}`, w, arWatches[i] ?? {}))
}

console.log(`\n${'═'.repeat(60)}`)
console.log(`prose gaps: ${proseGaps.length}, psalm versification gaps: ${psalmGaps.length}`)
console.log('\n// Paste into agpeya-parity.test.ts:')
console.log('const KNOWN_PROSE_GAPS = new Set([')
for (const g of proseGaps) console.log(`\t'${g}',`)
console.log('])')
console.log('const KNOWN_PSALM_GAPS = new Set([')
for (const g of psalmGaps) console.log(`\t'${g}',`)
console.log('])')
