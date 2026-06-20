// Bins flat lines into pages using *measured* per-line heights (one array per language
// column, aligned to line index). A page may contain lines [start, end) only if every
// language column fits within `available` px — the tallest column governs the break.
// At least one line per page is guaranteed so a single oversized line never deadlocks.
//
// `isRubric` (per line index) keeps an instruction with what it introduces: a page never
// ends on a rubric, so a direction like "In the presence of a bishop…" can't be orphaned
// at the foot of one page while the part it introduces starts the next.
export function computePageBreaks(
	heightsByLang: number[][],
	available: number,
	maxLines: number,
	isRubric: boolean[] = [],
): number[] {
	if (maxLines <= 0) return [0, 0]

	const breaks = [0]
	let start = 0
	while (start < maxLines) {
		let used = heightsByLang.map(() => 0)
		let end = start
		while (end < maxLines) {
			let fits = true
			const trial = heightsByLang.map((heights, col) => {
				const next = used[col] + (heights[end] ?? 0)
				if (next > available) fits = false
				return next
			})
			if (!fits && end > start) break
			used = trial
			end++
		}
		// Don't strand a trailing rubric: push it (and any rubrics before it) to the next
		// page so it sits with the content it introduces. Keep ≥1 line so we never deadlock.
		if (end < maxLines) {
			while (end - 1 > start && isRubric[end - 1]) end--
		}
		breaks.push(end)
		start = end
	}
	return breaks
}

// Presentation navigation is shared across columns, but translations may have
// different page counts. Map the shared progress onto each language so a short
// translation remains visible while a longer one continues advancing.
export function mapSharedPage(page: number, sharedCount: number, languageCount: number): number {
	if (sharedCount <= 1 || languageCount <= 1) return 0
	return Math.round((page * (languageCount - 1)) / (sharedCount - 1))
}
