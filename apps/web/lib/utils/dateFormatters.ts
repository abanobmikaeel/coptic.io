export function formatGregorianDate(date: Date): string {
	return date.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

export function formatDateShort(date: Date): string {
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
	})
}

export function formatDateShortUTC(date: Date): string {
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC',
	})
}

export function formatDateWithWeekday(date: Date): string {
	return date.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	})
}

export function formatMonthYear(date: Date): string {
	return date.toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric',
	})
}

/**
 * Get today's date as YYYY-MM-DD string in local timezone.
 * Using toISOString() would give UTC which can be a different day
 * depending on the user's timezone.
 */
export function getTodayDateString(): string {
	const d = new Date()
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Parse a YYYY-MM-DD date string as local time.
 * Using new Date(dateString) interprets as UTC which can shift the day.
 */
export function parseDateString(dateString: string): Date {
	const [year, month, day] = dateString.split('-').map(Number)
	return new Date(year, month - 1, day)
}

export function getAdjacentDate(dateString: string | undefined, offset: number): string {
	const date = dateString ? parseDateString(dateString) : new Date()
	date.setDate(date.getDate() + offset)
	return date.toISOString().split('T')[0]
}

export function addDaysToDateString(dateString: string, days: number): string {
	const d = new Date(`${dateString}T00:00:00`)
	d.setDate(d.getDate() + days)
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
