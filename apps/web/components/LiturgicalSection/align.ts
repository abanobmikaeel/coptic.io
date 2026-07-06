import type { BibleTranslation } from '@/components/ScriptureReading/types'
import type { IncenseService } from '@/lib/types'
import { type FlatLine, flattenToLines } from './turns'

// One shared row across every displayed language. Rendering a section as a list
// of rows is what keeps translations aligned: both reader modes (scroll and
// presentation) draw the same rows, and page/scroll breaks only ever fall
// between rows, so columns cannot drift apart by construction.
//
// A missing cell simply renders empty — the grid row is sized by the tallest
// cell, so no invisible spacer lines are needed.
export interface AlignedRow {
	isRubric: boolean
	cells: Partial<Record<BibleTranslation, FlatLine[]>>
}

export interface AlignedSection {
	rows: AlignedRow[]
	activeLangs: BibleTranslation[]
}

// Builds the aligned rows for one section across the displayed languages.
//
// Two strategies:
// - Parallel texts (equal non-rubric line counts — the invariant the incense
//   parity test enforces): one line per language per row, with rubric lines
//   emitted as their own rows carrying cells only for the languages that have
//   them (Coptic carries none).
// - Unequal counts (translations split the same text differently — common in
//   the Agpeya data until it is normalised): proportional grouping. The
//   language with the fewest lines anchors the rows and the others pack 1-n
//   lines per cell, so every row has content in every language and the columns
//   advance together even though line-for-line pairing isn't possible.
export function alignSection(
	servicesByLang: Partial<Record<string, IncenseService>>,
	sectionId: string,
	langs: BibleTranslation[],
): AlignedSection | null {
	const byLang: Partial<Record<BibleTranslation, FlatLine[]>> = {}
	for (const lang of langs) {
		const section = servicesByLang[lang]?.sections.find((s) => s.id === sectionId)
		byLang[lang] = section?.content?.length
			? flattenToLines(section.content)
			: (section?.verses ?? []).map((v) => ({
					text: v.text,
					num: v.num,
					isRubric: false,
					isNewSpeakerGroup: false,
				}))
	}

	const activeLangs = langs.filter((lang) => (byLang[lang]?.length ?? 0) > 0)
	if (activeLangs.length === 0) return null

	const nonRubricCounts = activeLangs.map(
		(lang) => (byLang[lang] ?? []).filter((line) => !line.isRubric).length,
	)
	const isParallel = nonRubricCounts.every((count) => count === nonRubricCounts[0])

	return {
		rows: isParallel ? alignParallel(byLang, activeLangs) : alignProportional(byLang, activeLangs),
		activeLangs,
	}
}

// One line per language per row; a rubric anywhere becomes its own row with
// cells only for the languages that carry it.
function alignParallel(
	byLang: Partial<Record<BibleTranslation, FlatLine[]>>,
	langs: BibleTranslation[],
): AlignedRow[] {
	const ptr: Record<string, number> = Object.fromEntries(langs.map((l) => [l, 0]))
	const rows: AlignedRow[] = []
	while (langs.some((l) => ptr[l] < (byLang[l]?.length ?? 0))) {
		const cells: AlignedRow['cells'] = {}
		const onRubric = langs.filter((l) => byLang[l]?.[ptr[l]]?.isRubric)
		if (onRubric.length > 0) {
			for (const l of onRubric) {
				const line = byLang[l]?.[ptr[l]]
				if (line) {
					cells[l] = [line]
					ptr[l]++
				}
			}
			rows.push({ isRubric: true, cells })
		} else {
			for (const l of langs) {
				const line = byLang[l]?.[ptr[l]]
				if (line) {
					cells[l] = [line]
					ptr[l]++
				}
			}
			rows.push({ isRubric: false, cells })
		}
	}
	return rows
}

// The language with the fewest lines anchors one row per line; the others pack
// their lines proportionally so every cell is non-empty. Rubrics stay inline.
function alignProportional(
	byLang: Partial<Record<BibleTranslation, FlatLine[]>>,
	langs: BibleTranslation[],
): AlignedRow[] {
	const anchorCount = Math.min(...langs.map((l) => byLang[l]?.length ?? 0))
	const rows: AlignedRow[] = []
	for (let i = 0; i < anchorCount; i++) {
		const cells: AlignedRow['cells'] = {}
		for (const l of langs) {
			const lines = byLang[l] ?? []
			const start = Math.floor((i * lines.length) / anchorCount)
			const end = Math.floor(((i + 1) * lines.length) / anchorCount)
			cells[l] = lines.slice(start, end)
		}
		rows.push({ isRubric: false, cells })
	}
	return rows
}
