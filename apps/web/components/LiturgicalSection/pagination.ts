// Bins aligned rows into pages using *measured* row heights. A row's height is
// its grid row — the tallest language cell — so a page fits every column by
// construction. At least one row per page is guaranteed, so a single oversized
// row (e.g. one long verse on a narrow column) never deadlocks; the view
// scrolls for that page instead.
//
// `isRubric` (per row index) keeps an instruction with what it introduces: a page never
// ends on a rubric, so a direction like "In the presence of a bishop…" can't be orphaned
// at the foot of one page while the part it introduces starts the next.
export function computePageBreaks(
	heights: number[],
	available: number,
	isRubric: boolean[] = [],
): number[] {
	const total = heights.length
	if (total <= 0) return [0, 0]

	const breaks = [0]
	let start = 0
	while (start < total) {
		let used = 0
		let end = start
		while (end < total) {
			const next = used + (heights[end] ?? 0)
			if (next > available && end > start) break
			used = next
			end++
		}
		// Don't strand a trailing rubric: push it (and any rubrics before it) to the next
		// page so it sits with the content it introduces. Keep ≥1 row so we never deadlock.
		if (end < total) {
			while (end - 1 > start && isRubric[end - 1]) end--
		}
		breaks.push(end)
		start = end
	}
	return breaks
}
