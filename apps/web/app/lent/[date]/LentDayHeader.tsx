import { DisplaySettings } from '@/components/DisplaySettings'
import { ReadingProgress } from '@/components/ReadingProgress'
import { ReadingsHeader } from '@/components/ReadingsHeader'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons'
import type { ReadingTheme } from '@/lib/reading-preferences'
import { themeClasses } from '@/lib/reading-styles'
import Link from 'next/link'
import { Suspense } from 'react'

interface ScheduleDay {
	date: string
	dayNumber: number
}

interface LentDayHeaderProps {
	devotional: { title: string; dayNumber: number; weekTheme: string }
	prevDay: ScheduleDay | null
	nextDay: ScheduleDay | null
	theme: ReadingTheme
}

export function LentDayHeader({ devotional, prevDay, nextDay, theme }: LentDayHeaderProps) {
	return (
		<>
			<Suspense fallback={null}>
				<ReadingProgress />
			</Suspense>
			<ReadingsHeader theme={theme} layout="between">
				{/* Left spacer — mirrors right side for true centering */}
				<div className="shrink-0 w-8 sm:w-10" />

				{/* Centered day navigation */}
				<div className="flex items-center gap-1 sm:gap-2 min-w-0">
					{prevDay ? (
						<Link
							href={`/lent/${prevDay.date}`}
							className={`p-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${themeClasses.navChevron[theme]}`}
							aria-label={`Previous day: Day ${prevDay.dayNumber}`}
						>
							<ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
						</Link>
					) : (
						<span className="p-1.5 opacity-0 pointer-events-none">
							<ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
						</span>
					)}

					<div className="text-center min-w-0">
						<h1 className="text-base sm:text-lg font-bold truncate">{devotional.title}</h1>
						<p className={`text-xs sm:text-sm ${themeClasses.muted[theme]}`}>
							Day {devotional.dayNumber} &middot; {devotional.weekTheme}
						</p>
					</div>

					{nextDay ? (
						<Link
							href={`/lent/${nextDay.date}`}
							className={`p-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${themeClasses.navChevron[theme]}`}
							aria-label={`Next day: Day ${nextDay.dayNumber}`}
						>
							<ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
						</Link>
					) : (
						<span className="p-1.5 opacity-0 pointer-events-none">
							<ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
						</span>
					)}
				</div>

				{/* Right — All Days link + display settings */}
				<div className="shrink-0 flex items-center gap-1.5">
					<Link
						href="/lent"
						className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${themeClasses.pillBadge[theme]} hover:opacity-80`}
					>
						All Days
					</Link>
					<Suspense fallback={null}>
						<DisplaySettings />
					</Suspense>
				</div>
			</ReadingsHeader>
		</>
	)
}
