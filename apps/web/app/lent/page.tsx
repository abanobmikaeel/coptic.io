import { API_BASE_URL } from '@/config'
import { getTodayDateString } from '@/lib/utils'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Great Lent Devotional Guide',
	description:
		'A 49-day devotional guide for Great Lent with weekly themes, daily scripture readings, and sermon links.',
	openGraph: {
		title: 'Great Lent Devotional Guide | Coptic IO',
		description:
			'A 49-day devotional guide for Great Lent with weekly themes, daily scripture readings, and sermon links.',
	},
}

interface ScheduleDay {
	dayOffset: number
	dayNumber: number
	part: string
	weekNumber: number
	weekTheme: string
	day: string
	title: string
	references: string[]
	date: string
	sermons?: { title: string; youtubeUrl: string }[]
	sundayHolyGospelReading?: string
}

interface ScheduleResponse {
	year: number
	easterDate: string
	lentStart: string
	lentEnd: string
	days: ScheduleDay[]
}

async function getSchedule(): Promise<ScheduleResponse | null> {
	try {
		const res = await fetch(`${API_BASE_URL}/lent/schedule`, { next: { revalidate: 3600 } })
		if (!res.ok) return null
		return res.json()
	} catch {
		return null
	}
}

export default async function LentPage() {
	const schedule = await getSchedule()

	if (!schedule) {
		return (
			<main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
					<h1 className="text-2xl font-bold mb-4">Great Lent Devotional Guide</h1>
					<p className="text-gray-500 dark:text-gray-400">
						Unable to load the Lent schedule. Please try again later.
					</p>
				</div>
			</main>
		)
	}

	const today = getTodayDateString()

	// Compute progress
	const todayIndex = schedule.days.findIndex((d) => d.date === today)
	const completedDays = todayIndex >= 0 ? todayIndex : today > schedule.lentEnd ? 49 : 0
	const progressPercent = Math.round((completedDays / 49) * 100)
	const isActive = today >= schedule.lentStart && today <= schedule.lentEnd

	// Group days by week
	const weeks: Map<number, ScheduleDay[]> = new Map()
	for (const day of schedule.days) {
		const existing = weeks.get(day.weekNumber) || []
		existing.push(day)
		weeks.set(day.weekNumber, existing)
	}

	return (
		<main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 text-gray-900 dark:text-white">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
				{/* Hero header */}
				<div className="text-center mb-10">
					<p className="text-amber-600 dark:text-amber-400 text-sm font-medium tracking-widest uppercase mb-3">
						{formatDateRange(schedule.lentStart, schedule.lentEnd)}
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 dark:from-amber-400 dark:via-amber-300 dark:to-orange-400 bg-clip-text text-transparent">
						Great Lent Devotional Guide
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
						49 days of scripture, reflection, and spiritual growth on the journey to Pascha
					</p>
				</div>

				{/* Progress bar */}
				{isActive && (
					<div className="max-w-md mx-auto mb-10">
						<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
							<span>Day {completedDays + 1} of 49</span>
							<span>{progressPercent}% complete</span>
						</div>
						<div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
							<div
								className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
								style={{ width: `${progressPercent}%` }}
							/>
						</div>
					</div>
				)}

				{/* Weekly sections */}
				<div className="space-y-10">
					{Array.from(weeks.entries()).map(([weekNum, days]) => {
						const weekTheme = days[0]?.weekTheme
						const isCurrentWeek = days.some((d) => d.date === today)
						const isPastWeek = days.every((d) => d.date < today)

						return (
							<section key={weekNum}>
								{/* Part divider */}
								{weekNum === 1 && (
									<div className="flex items-center gap-3 mb-6">
										<div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-300 dark:to-amber-700" />
										<span className="text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 px-2">
											Part One
										</span>
										<div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-300 dark:to-amber-700" />
									</div>
								)}
								{weekNum === 6 && (
									<div className="flex items-center gap-3 mb-6 mt-2">
										<div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-300 dark:to-amber-700" />
										<span className="text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 px-2">
											Part Two
										</span>
										<div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-300 dark:to-amber-700" />
									</div>
								)}

								{/* Week header */}
								<div className={`mb-4 ${isPastWeek && !isCurrentWeek ? 'opacity-60' : ''}`}>
									<span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
										Week {weekNum}
										{isCurrentWeek && (
											<span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white dark:bg-amber-500 normal-case tracking-normal">
												This week
											</span>
										)}
									</span>
									<h2 className="text-xl font-bold mt-0.5">{weekTheme}</h2>
								</div>

								{/* Days grid */}
								<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5">
									{days.map((day) => {
										const isToday = day.date === today
										const isPast = day.date < today
										const isSunday = day.day === 'sunday'
										return (
											<Link
												key={day.dayNumber}
												href={`/lent/${day.date}`}
												className={`group relative block p-3 sm:p-3.5 rounded-xl border-2 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg ${
													isToday
														? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 shadow-md shadow-amber-200/50 dark:shadow-amber-900/30'
														: isSunday
															? 'border-amber-300/60 dark:border-amber-700/60 bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-900/20 dark:to-gray-900/50 hover:border-amber-400 dark:hover:border-amber-600'
															: isPast
																? 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 opacity-60 hover:opacity-100'
																: 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-700'
												}`}
											>
												{/* Day label row */}
												<div className="flex items-center justify-between mb-2">
													<span
														className={`text-[10px] font-bold uppercase tracking-wider ${
															isToday
																? 'text-amber-600 dark:text-amber-400'
																: isSunday
																	? 'text-amber-500 dark:text-amber-500'
																	: 'text-gray-400 dark:text-gray-500'
														}`}
													>
														{day.day.slice(0, 3)}
													</span>
													<span
														className={`text-[10px] tabular-nums ${
															isToday
																? 'font-bold text-amber-600 dark:text-amber-400'
																: 'text-gray-400 dark:text-gray-600'
														}`}
													>
														{day.dayNumber}
													</span>
												</div>

												{/* Title */}
												<p
													className={`text-[13px] sm:text-sm font-semibold leading-snug mb-1.5 ${
														isToday
															? 'text-amber-800 dark:text-amber-300'
															: 'text-gray-800 dark:text-gray-200 group-hover:text-amber-700 dark:group-hover:text-amber-400'
													} transition-colors`}
												>
													{day.title}
												</p>

												{/* Reference */}
												<p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
													{day.references.join('; ')}
												</p>

												{/* Badges */}
												{isToday && (
													<span className="inline-block mt-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white">
														TODAY
													</span>
												)}
											</Link>
										)
									})}
								</div>
							</section>
						)
					})}
				</div>
			</div>
		</main>
	)
}

function formatDateRange(start: string, end: string): string {
	const s = new Date(`${start}T00:00:00`)
	const e = new Date(`${end}T00:00:00`)
	const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }
	return `${s.toLocaleDateString('en', opts)} \u2013 ${e.toLocaleDateString('en', { ...opts, year: 'numeric' })}`
}
