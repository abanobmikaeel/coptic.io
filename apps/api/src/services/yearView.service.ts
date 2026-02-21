import { type CopticDate, gregorianToCoptic, isInMoveableFast } from '@coptic/core'
import {
	type Celebration,
	getStaticCelebrationsForCopticDay,
} from '../utils/calculations/getStaticCelebrations'

type MoveableFast = ReturnType<typeof isInMoveableFast>

export type DayEntry = {
	gregorianDate: string // 'YYYY-MM-DD', pre-formatted
	date: Date // for consumers needing Date objects (iCal)
	month: number // Gregorian month (1-12), for fast slicing
	copticDate: CopticDate
	celebrations: Celebration[] | null
	moveableFast: MoveableFast
}

type YearView = {
	days: DayEntry[]
	byMonth: DayEntry[][] // index 0 unused, 1-12 = months
}

// No TTL needed — calendar data is deterministic for a given year
const yearViewCache = new Map<number, YearView>()

const formatDate = (d: Date) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const buildYearView = (year: number): YearView => {
	const days: DayEntry[] = []
	const byMonth: DayEntry[][] = Array.from({ length: 13 }, () => [])
	const current = new Date(year, 0, 1)
	const end = new Date(year, 11, 31).getTime()

	while (current.getTime() <= end) {
		const copticDate = gregorianToCoptic(current)
		const month = current.getMonth() + 1
		const entry: DayEntry = {
			gregorianDate: formatDate(current),
			date: new Date(current), // snapshot before mutation
			month,
			copticDate,
			celebrations: getStaticCelebrationsForCopticDay(copticDate.month, copticDate.day),
			moveableFast: isInMoveableFast(current),
		}
		days.push(entry)
		byMonth[month]!.push(entry)
		current.setDate(current.getDate() + 1) // mutate in place, zero allocation
	}

	return { days, byMonth }
}

const getOrBuildYearView = (year: number): YearView => {
	const cached = yearViewCache.get(year)
	if (cached) return cached

	const view = buildYearView(year)
	yearViewCache.set(year, view)
	return view
}

export const getYearView = (year: number): DayEntry[] => {
	return getOrBuildYearView(year).days
}

export const getMonthView = (year: number, month: number): DayEntry[] => {
	return getOrBuildYearView(year).byMonth[month]!
}
