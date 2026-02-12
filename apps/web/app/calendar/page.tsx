'use client'

import {
	CalendarGrid,
	CalendarModeToggle,
	FastingLegend,
	MonthYearSelector,
	SelectedDayDetails,
} from '@/components/calendar'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons'
import { features } from '@/config'
import { getCalendarMonth } from '@/lib/api'
import type { CalendarMonth } from '@/lib/types'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

export default function CalendarPage() {
	const t = useTranslations('calendar')
	const today = useMemo(() => new Date(), [])
	const [year, setYear] = useState(() => new Date().getFullYear())
	const [month, setMonth] = useState(() => new Date().getMonth() + 1)
	const [mode, setMode] = useState<'gregorian' | 'coptic'>('gregorian')
	const [calendarData, setCalendarData] = useState<CalendarMonth | null>(null)
	const [selectedDay, setSelectedDay] = useState(() => new Date().getDate())

	const loading =
		calendarData === null ||
		Boolean(
			calendarData.days[0]?.gregorianDate &&
				!calendarData.days[0].gregorianDate.startsWith(`${year}-${String(month).padStart(2, '0')}`),
		)

	useEffect(() => {
		let cancelled = false
		getCalendarMonth(year, month).then((data) => {
			if (!cancelled) setCalendarData(data)
		})
		return () => {
			cancelled = true
		}
	}, [year, month])

	// Prefetch adjacent months for smoother navigation
	useEffect(() => {
		const prevMonth = month === 1 ? 12 : month - 1
		const prevYear = month === 1 ? year - 1 : year
		const nextMonth = month === 12 ? 1 : month + 1
		const nextYear = month === 12 ? year + 1 : year

		// Fire and forget - these populate the Next.js cache
		getCalendarMonth(prevYear, prevMonth)
		getCalendarMonth(nextYear, nextMonth)
	}, [year, month])

	const navigateMonth = (delta: number) => {
		setSelectedDay(1)
		const newMonth = month + delta
		if (newMonth < 1) {
			setMonth(12)
			setYear(year - 1)
		} else if (newMonth > 12) {
			setMonth(1)
			setYear(year + 1)
		} else {
			setMonth(newMonth)
		}
	}

	const goToToday = () => {
		setYear(today.getFullYear())
		setMonth(today.getMonth() + 1)
		setSelectedDay(today.getDate())
	}

	const firstDayOfMonth = useMemo(() => new Date(year, month - 1, 1).getDay(), [year, month])
	const blanks = useMemo(
		() => Array.from({ length: firstDayOfMonth }, (_, i) => i),
		[firstDayOfMonth],
	)
	const days = useMemo(() => calendarData?.days ?? [], [calendarData?.days])
	const selectedDayData =
		selectedDay > 0 && selectedDay <= days.length ? days[selectedDay - 1] : null
	const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
	const copticMonthInfo = calendarData?.copticMonths?.[0]

	const visibleFasts = useMemo(() => {
		const fasts = new Set<string>()
		for (const day of days) {
			if (day.fasting.isFasting && day.fasting.description) {
				fasts.add(day.fasting.description)
			}
		}
		return fasts
	}, [days])

	return (
		<main className="min-h-screen relative">
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none">
				<div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/[0.03] dark:bg-amber-500/[0.05] rounded-full blur-[100px]" />
			</div>

			<section className="relative pt-20 pb-8 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
					<p className="text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
				</div>
			</section>

			<section className="relative px-6 pb-16">
				<div className="max-w-4xl mx-auto">
					{features.copticCalendarMode && (
						<CalendarModeToggle
							mode={mode}
							onModeChange={setMode}
							copticEnabled={!!copticMonthInfo}
						/>
					)}

					<div className="flex items-center justify-between mb-6">
						<button
							type="button"
							onClick={() => navigateMonth(-1)}
							aria-label={t('previousMonth')}
							className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						>
							<ChevronLeftIcon />
						</button>

						<div className="flex items-center gap-3">
							<button
								type="button"
								onClick={goToToday}
								className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-700 hover:bg-amber-600 text-white shadow-sm hover:shadow transition-all"
							>
								{t('today')}
							</button>
							<span className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />
							<MonthYearSelector
								mode={mode}
								month={month}
								year={year}
								copticMonthInfo={copticMonthInfo}
								onMonthChange={(m) => {
									setMonth(m)
									setSelectedDay(1)
								}}
								onYearChange={(y) => {
									setYear(y)
									setSelectedDay(1)
								}}
								baseYear={today.getFullYear()}
							/>
						</div>

						<button
							type="button"
							onClick={() => navigateMonth(1)}
							aria-label={t('nextMonth')}
							className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						>
							<ChevronRightIcon />
						</button>
					</div>

					<CalendarGrid
						days={days}
						blanks={blanks}
						selectedDay={selectedDay}
						todayKey={todayKey}
						mode={mode}
						onSelectDay={setSelectedDay}
						loading={loading}
					/>

					{selectedDayData && (
						<SelectedDayDetails dayData={selectedDayData} onClose={() => setSelectedDay(0)} />
					)}

					<FastingLegend visibleFasts={visibleFasts} />
				</div>
			</section>
		</main>
	)
}
