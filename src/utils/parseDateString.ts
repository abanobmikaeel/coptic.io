/**
 * Parse a date string in YYYY-MM-DD format to a local Date object
 * Avoids timezone issues that occur with new Date(dateString)
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object or null if invalid
 */
export const parseDateString = (dateString: string): Date | null => {
	const parts = dateString.split('-').map(Number)
	const year = parts[0]
	const month = parts[1]
	const day = parts[2]

	if (
		year === undefined ||
		month === undefined ||
		day === undefined ||
		isNaN(year) ||
		isNaN(month) ||
		isNaN(day)
	) {
		return null
	}

	// Validate month range (1-12)
	if (month < 1 || month > 12) {
		return null
	}

	// Validate day range (1-31)
	if (day < 1 || day > 31) {
		return null
	}

	const date = new Date(year, month - 1, day)

	// Validate that the date is valid and matches the input
	// (e.g., Feb 30 would create Mar 2, which wouldn't match)
	if (isNaN(date.getTime()) || date.getDate() !== day || date.getMonth() !== month - 1) {
		return null
	}

	return date
}
