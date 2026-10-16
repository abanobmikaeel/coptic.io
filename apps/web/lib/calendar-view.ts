/**
 * Which month the calendar page shows and which day in it is selected, as kept in the
 * `?date=` search param: `YYYY-MM-DD` with a day selected, `YYYY-MM` with none.
 */
export interface CalendarView {
	year: number
	month: number
	day: number | null
}

const DATE_PARAM = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/

const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate()

export const todayView = (today: Date): CalendarView => ({
	year: today.getFullYear(),
	month: today.getMonth() + 1,
	day: today.getDate(),
})

/** Read the `date` param; a missing or malformed value shows today. */
export function parseCalendarDate(param: string | null, today: Date): CalendarView {
	const match = param ? DATE_PARAM.exec(param) : null
	if (!match) return todayView(today)

	const year = Number(match[1])
	const month = Number(match[2])
	const day = match[3] ? Number(match[3]) : null
	if (month < 1 || month > 12) return todayView(today)
	if (day !== null && (day < 1 || day > daysInMonth(year, month))) return todayView(today)
	return { year, month, day }
}

const pad = (n: number) => String(n).padStart(2, '0')

export function formatCalendarDate({ year, month, day }: CalendarView): string {
	const base = `${year}-${pad(month)}`
	return day === null ? base : `${base}-${pad(day)}`
}

/**
 * The view after moving to a month: today stays selected in today's month, so the today and
 * selection rings agree; any other month opens on its first day.
 */
export function monthView(year: number, month: number, today: Date): CalendarView {
	const isTodaysMonth = year === today.getFullYear() && month === today.getMonth() + 1
	return { year, month, day: isTodaysMonth ? today.getDate() : 1 }
}

/** Step a whole number of months from the view, across year boundaries. */
export function shiftMonth(view: CalendarView, delta: number, today: Date): CalendarView {
	const index = view.year * 12 + (view.month - 1) + delta
	return monthView(Math.floor(index / 12), (index % 12) + 1, today)
}

/** Years offered in a year picker: a window around the one on screen, so any year is reachable. */
export function yearsAround(year: number, span = 10): number[] {
	return Array.from({ length: span * 2 + 1 }, (_, i) => year - span + i)
}
