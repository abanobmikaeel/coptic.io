'use client'

import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '@/components/ui/Icons'
import { features } from '@/config'
import { COPTIC_MONTHS, GREGORIAN_MONTHS, WEEKDAYS, getFastColors } from '@/constants'
import { getCalendarMonth } from '@/lib/api'
import type { CalendarMonth } from '@/lib/types'
import Link from 'next/link'
import { memo, useEffect, useMemo, useState } from 'react'

export default function CalendarPage() {
	const today = useMemo(() => new Date(), [])
	const [year, setYear] = useState(() => new Date().getFullYear())
	const [month, setMonth] = useState(() => new Date().getMonth() + 1)
	const [mode, setMode] = useState<'gregorian' | 'coptic'>('gregorian')
	const [calendarData, setCalendarData] = useState<CalendarMonth | null>(null)
	const [selectedDay, setSelectedDay] = useState(() => new Date().getDate())
	const loading =
		calendarData === null ||
		(calendarData.days[0]?.gregorianDate &&
			!calendarData.days[0].gregorianDate.startsWith(`${year}-${String(month).padStart(2, '0')}`))

	useEffect(() => {
		let cancelled = false
		getCalendarMonth(year, month).then((data) => {
			if (!cancelled) setCalendarData(data)
		})
		return () => {
			cancelled = true
		}
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
		days.forEach((day) => {
			if (day.fasting.isFasting && day.fasting.description) {
				fasts.add(day.fasting.description)
			}
		})
		return fasts
	}, [days])

	return (
		<main className="min-h-screen relative">
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none">
				<div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/[0.03] dark:bg-amber-500/[0.05] rounded-full blur-[100px]" />
			</div>

			<section className="relative pt-20 pb-8 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Fasting Calendar
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						View fasting periods throughout the year
					</p>
				</div>
			</section>

			<section className="relative px-6 pb-16">
				<div className="max-w-4xl mx-auto">
					{features.copticCalendarMode && (
						<div className="flex justify-center mb-4">
							<div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-gray-100 dark:bg-gray-800">
								<button
									type="button"
									onClick={() => setMode('gregorian')}
									className={`px-4 py-2 text-base font-bold rounded-md transition-all ${
										mode === 'gregorian'
											? 'bg-white dark:bg-gray-900 text-amber-600 shadow-sm'
											: 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
									}`}
								>
									En
								</button>
								<button
									type="button"
									onClick={() => setMode('coptic')}
									disabled={!copticMonthInfo}
									className={`px-4 py-2 text-xl font-bold rounded-md transition-all font-[family-name:var(--font-coptic)] ${
										mode === 'coptic'
											? 'bg-white dark:bg-gray-900 text-amber-600 shadow-sm'
											: !copticMonthInfo
												? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
												: 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
									}`}
								>
									Ⲁ
								</button>
							</div>
						</div>
					)}

					<div className="flex items-center justify-between mb-6">
						<button
							type="button"
							onClick={() => navigateMonth(-1)}
							aria-label="Previous month"
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
								Today
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
							aria-label="Next month"
							className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						>
							<ChevronRightIcon />
						</button>
					</div>

					<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-4 shadow-sm dark:shadow-none">
						<div className="grid grid-cols-7 mb-2">
							{WEEKDAYS.map((day) => (
								<div
									key={day}
									className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-3"
								>
									{day}
								</div>
							))}
						</div>

						{loading ? (
							<div className="h-64 flex items-center justify-center">
								<p className="text-gray-600 dark:text-gray-400">Loading...</p>
							</div>
						) : (
							<div className="grid grid-cols-7 gap-3">
								{blanks.map((i) => (
									<div key={`blank-${i}`} className="aspect-square" />
								))}
								{days.map((dayData, index) => {
									const dayNum = index + 1
									const isToday = dayData.gregorianDate === todayKey
									const isSelected = selectedDay === dayNum
									const colors = getFastColors(
										dayData.fasting.isFasting ? dayData.fasting.description : null,
									)

									return (
										<button
											type="button"
											key={dayNum}
											onClick={() => setSelectedDay(dayNum)}
											className={`
												aspect-square flex flex-col items-center justify-center rounded-xl relative
												cursor-pointer transition-all duration-150 min-h-[60px]
												${isToday ? 'ring-2 ring-amber-500' : ''}
												${isSelected ? 'ring-2 ring-amber-500 scale-105 shadow-lg z-10' : ''}
												${
													colors
														? `${colors.bg} ${colors.darkBg} ${colors.hoverBg} ${colors.darkHoverBg}`
														: 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
												}
												hover:scale-105 hover:shadow-md hover:z-10
											`}
										>
											<span
												className={`text-lg font-semibold ${
													isToday
														? 'text-amber-600 dark:text-amber-500'
														: colors
															? `${colors.text} ${colors.darkText}`
															: 'text-gray-700 dark:text-gray-300'
												}`}
											>
												{!features.copticCalendarMode || mode === 'gregorian'
													? dayNum
													: dayData.copticDate.day}
											</span>
											{colors && (
												<span
													className={`absolute bottom-1.5 text-xs font-bold opacity-80 ${colors.text} ${colors.darkText}`}
												>
													{colors.icon}
												</span>
											)}
										</button>
									)
								})}
							</div>
						)}
					</div>

					{selectedDayData && (
						<SelectedDayDetails dayData={selectedDayData} onClose={() => setSelectedDay(0)} />
					)}

					{visibleFasts.size > 0 && (
						<div className="flex flex-wrap gap-6 justify-center mt-2">
							{Array.from(visibleFasts).map((fast) => {
								const colors = getFastColors(fast)
								if (!colors) return null
								return (
									<div key={fast} className="flex items-center gap-2.5">
										<div
											className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${colors.bg} ${colors.darkBg} ${colors.text} ${colors.darkText}`}
										>
											{colors.icon}
										</div>
										<span className="text-base text-gray-700 dark:text-gray-300 font-medium">
											{fast}
										</span>
									</div>
								)
							})}
						</div>
					)}
				</div>
			</section>
		</main>
	)
}

const MonthYearSelector = memo(function MonthYearSelector({
	mode,
	month,
	year,
	copticMonthInfo,
	onMonthChange,
	onYearChange,
	baseYear,
}: {
	mode: 'gregorian' | 'coptic'
	month: number
	year: number
	copticMonthInfo?: { month: number; year: number } | null
	onMonthChange: (month: number) => void
	onYearChange: (year: number) => void
	baseYear: number
}) {
	const selectClass =
		'text-xl font-bold text-gray-900 dark:text-white bg-transparent border-none cursor-pointer hover:text-amber-600 dark:hover:text-amber-500 transition-colors focus:outline-none focus:ring-0 appearance-none'

	if (!features.copticCalendarMode || mode === 'gregorian') {
		return (
			<>
				<select
					value={month - 1}
					onChange={(e) => onMonthChange(Number(e.target.value) + 1)}
					aria-label="Select month"
					className={`${selectClass} pr-1`}
				>
					{GREGORIAN_MONTHS.map((m, i) => (
						<option key={m} value={i} className="bg-white dark:bg-gray-900">
							{m}
						</option>
					))}
				</select>
				<select
					value={year}
					onChange={(e) => onYearChange(Number(e.target.value))}
					aria-label="Select year"
					className={selectClass}
				>
					{Array.from({ length: 21 }, (_, i) => baseYear - 10 + i).map((y) => (
						<option key={y} value={y} className="bg-white dark:bg-gray-900">
							{y}
						</option>
					))}
				</select>
			</>
		)
	}

	if (!copticMonthInfo) {
		return <span className="text-xl font-bold text-gray-400 dark:text-gray-500">Loading...</span>
	}

	return (
		<>
			<select
				value={copticMonthInfo.month - 1}
				onChange={(e) => {
					const monthDiff = Number(e.target.value) - (copticMonthInfo.month - 1)
					const newDate = new Date(year, month - 1, 15)
					newDate.setDate(newDate.getDate() + monthDiff * 30)
					onYearChange(newDate.getFullYear())
					onMonthChange(newDate.getMonth() + 1)
				}}
				aria-label="Select Coptic month"
				className={`${selectClass} pr-1`}
			>
				{COPTIC_MONTHS.map((m, i) => (
					<option key={m} value={i} className="bg-white dark:bg-gray-900">
						{m}
					</option>
				))}
			</select>
			<select
				value={copticMonthInfo.year}
				onChange={(e) => {
					const yearDiff = Number(e.target.value) - copticMonthInfo.year
					const newDate = new Date(year, month - 1, 15)
					newDate.setDate(newDate.getDate() + yearDiff * 365)
					onYearChange(newDate.getFullYear())
					onMonthChange(newDate.getMonth() + 1)
				}}
				aria-label="Select Coptic year"
				className={selectClass}
			>
				{Array.from({ length: 21 }, (_, i) => copticMonthInfo.year - 10 + i).map((y) => (
					<option key={y} value={y} className="bg-white dark:bg-gray-900">
						{y}
					</option>
				))}
			</select>
		</>
	)
})

const SelectedDayDetails = memo(function SelectedDayDetails({
	dayData,
	onClose,
}: {
	dayData: {
		gregorianDate: string
		copticDate: { dateString: string }
		fasting: { isFasting: boolean; fastType: string | null; description: string | null }
	}
	onClose: () => void
}) {
	const colors = getFastColors(dayData.fasting.isFasting ? dayData.fasting.description : null)

	return (
		<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm dark:shadow-none animate-in fade-in slide-in-from-top-2 duration-200">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
						{new Date(`${dayData.gregorianDate}T00:00:00`).toLocaleDateString('en-US', {
							weekday: 'long',
							month: 'long',
							day: 'numeric',
							year: 'numeric',
						})}
					</p>
					<p className="text-xl font-semibold text-amber-600 dark:text-amber-500">
						{dayData.copticDate.dateString}
					</p>
				</div>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close details"
					className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
				>
					<CloseIcon />
				</button>
			</div>

			<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
				{colors && dayData.fasting.description ? (
					<>
						<div
							className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} ${colors.darkBg}`}
						>
							<span className={`text-sm font-semibold ${colors.text} ${colors.darkText}`}>
								{dayData.fasting.description}
							</span>
						</div>
						<p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
							{dayData.fasting.fastType}
						</p>
					</>
				) : (
					<p className="text-sm text-gray-500 dark:text-gray-400">No fasting on this day</p>
				)}
			</div>

			<Link
				href={`/readings?date=${dayData.gregorianDate}`}
				className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all"
			>
				View Readings
				<ChevronRightIcon className="w-4 h-4" />
			</Link>
		</div>
	)
})
