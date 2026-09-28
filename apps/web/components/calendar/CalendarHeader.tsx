'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons'
import { type CalendarView, shiftMonth, todayView } from '@/lib/calendar-view'
import { useTranslations } from 'next-intl'
import { MonthYearSelector } from './MonthYearSelector'

interface CalendarHeaderProps {
	mode: 'gregorian' | 'coptic'
	view: CalendarView
	today: Date
	onNavigate: (view: CalendarView) => void
}

const arrowClass =
	'shrink-0 p-1.5 sm:p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'

// Month navigation: previous/next arrows around Today and the month and year pickers
export function CalendarHeader({ mode, view, today, onNavigate }: Readonly<CalendarHeaderProps>) {
	const t = useTranslations('calendar')

	return (
		<div className="flex items-center justify-between gap-2 mb-6">
			<button
				type="button"
				onClick={() => onNavigate(shiftMonth(view, -1, today))}
				aria-label={t('previousMonth')}
				className={arrowClass}
			>
				<ChevronLeftIcon />
			</button>

			<div className="flex items-center gap-1 sm:gap-3 min-w-0">
				<button
					type="button"
					onClick={() => onNavigate(todayView(today))}
					className="shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg bg-amber-700 hover:bg-amber-600 text-white shadow-sm hover:shadow transition-all"
				>
					{t('today')}
				</button>
				<span className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 sm:mx-2" />
				<MonthYearSelector mode={mode} view={view} today={today} onNavigate={onNavigate} />
			</div>

			<button
				type="button"
				onClick={() => onNavigate(shiftMonth(view, 1, today))}
				aria-label={t('nextMonth')}
				className={arrowClass}
			>
				<ChevronRightIcon />
			</button>
		</div>
	)
}
