/**
 * Month calendar grid geometry (leading blanks and total cells), shared by the
 * calendar page and its loading skeleton.
 */
export function getMonthGridLayout(
	year: number,
	month: number,
): {
	leadingBlanks: number
	totalCells: number
} {
	const leadingBlanks = new Date(year, month - 1, 1).getDay()
	const daysInMonth = new Date(year, month, 0).getDate()
	return {
		leadingBlanks,
		totalCells: Math.ceil((leadingBlanks + daysInMonth) / 7) * 7,
	}
}
