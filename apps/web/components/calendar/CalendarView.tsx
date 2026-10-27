'use client'

import { features } from '@/config'
import { getCalendarMonth } from '@/lib/api'
import {
	type CalendarView as View,
	formatCalendarDate,
	parseCalendarDate,
	todayView,
} from '@/lib/calendar-view'
import type { CalendarMonth } from '@/lib/types'
import { getMonthGridLayout } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { CalendarGrid } from './CalendarGrid'
import { CalendarHeader } from './CalendarHeader'
import { CalendarModeToggle } from './CalendarModeToggle'
import { FastingLegend } from './FastingLegend'
import { SelectedDayDetails } from './SelectedDayDetails'

type Mode = 'gregorian' | 'coptic'

// The calendar page's state lives in the URL (?date= and ?mode=), so a month can be bookmarked
// or shared and the back button steps back through the months visited.
export function CalendarView() {
	const t = useTranslations('calendar')
	const router = useRouter()
	const searchParams = useSearchParams()
	const today = useMemo(() => new Date(), [])
	const view = parseCalendarDate(searchParams.get('date'), today)
	const { year, month } = view
	const mode: Mode =
		features.copticCalendarMode && searchParams.get('mode') === 'coptic' ? 'coptic' : 'gregorian'

	// Changing month adds a history entry; selecting a day or switching calendar replaces it
	const go = (next: View, nextMode: Mode = mode) => {
		const params = new URLSearchParams(searchParams.toString())
		const now = todayView(today)
		const isToday = next.year === now.year && next.month === now.month && next.day === now.day
		if (isToday) params.delete('date')
		else params.set('date', formatCalendarDate(next))
		if (nextMode === 'coptic') params.set('mode', 'coptic')
		else params.delete('mode')

		const query = params.toString()
		const url = `/calendar${query ? `?${query}` : ''}`
		const sameMonth = next.year === year && next.month === month
		if (sameMonth) router.replace(url, { scroll: false })
		else router.push(url, { scroll: false })
	}

	const [calendarData, setCalendarData] = useState<CalendarMonth | null>(null)
	// The month whose request failed (the API client returns null on any error), and a counter
	// the retry button bumps to request it again
	const [failedMonth, setFailedMonth] = useState<string | null>(null)
	const [attempt, setAttempt] = useState(0)
	const failed = failedMonth === `${year}-${month}`
	const loading =
		!failed && (calendarData === null || calendarData.year !== year || calendarData.month !== month)

	// biome-ignore lint/correctness/useExhaustiveDependencies: attempt re-runs the request on retry
	useEffect(() => {
		let cancelled = false
		setFailedMonth(null)
		getCalendarMonth(year, month).then((data) => {
			if (cancelled) return
			if (data) setCalendarData(data)
			else setFailedMonth(`${year}-${month}`)
		})
		return () => {
			cancelled = true
		}
	}, [year, month, attempt])

	// Prefetch adjacent months for smoother navigation (fire and forget)
	useEffect(() => {
		const index = year * 12 + (month - 1)
		for (const i of [index - 1, index + 1]) getCalendarMonth(Math.floor(i / 12), (i % 12) + 1)
	}, [year, month])

	const { leadingBlanks, totalCells } = useMemo(
		() => getMonthGridLayout(year, month),
		[year, month],
	)
	const blanks = useMemo(() => Array.from({ length: leadingBlanks }, (_, i) => i), [leadingBlanks])
	const days = useMemo(() => calendarData?.days ?? [], [calendarData?.days])
	const selectedDay = view.day ?? 0
	const selectedDayData = !loading && selectedDay > 0 ? (days[selectedDay - 1] ?? null) : null
	const todayKey = formatCalendarDate(todayView(today))

	const visibleFasts = useMemo(() => {
		const fasts = new Set<string>()
		for (const day of days) {
			if (day.fasting.isFasting && day.fasting.description) fasts.add(day.fasting.description)
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
						<CalendarModeToggle mode={mode} onModeChange={(m) => go(view, m)} />
					)}

					<CalendarHeader mode={mode} view={view} today={today} onNavigate={go} />

					<CalendarGrid
						days={days}
						blanks={blanks}
						selectedDay={selectedDay}
						todayKey={todayKey}
						mode={mode}
						onSelectDay={(day) => go({ year, month, day })}
						loading={loading}
						skeletonCells={totalCells}
						failed={failed}
						onRetry={() => setAttempt((n) => n + 1)}
					/>

					<div aria-live="polite">
						{selectedDayData && (
							<SelectedDayDetails
								dayData={selectedDayData}
								onClose={() => go({ year, month, day: null })}
							/>
						)}
					</div>

					<FastingLegend visibleFasts={visibleFasts} />
				</div>
			</section>
		</main>
	)
}
