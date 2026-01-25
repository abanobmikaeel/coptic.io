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

export function getTodayDateString(): string {
	return new Date().toISOString().split('T')[0]
}

export function parseDateString(dateString: string): Date {
	return new Date(`${dateString}T00:00:00`)
}
