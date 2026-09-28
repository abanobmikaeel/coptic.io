'use client'

import { features } from '@/config'
import { type CalendarView, monthView, yearsAround } from '@/lib/calendar-view'
import { formatNumber, getMonthNames } from '@/lib/utils'
import { copticToGregorian, getCopticMonthName, gregorianToCoptic } from '@coptic/core'
import { useLocale, useTranslations } from 'next-intl'

interface MonthYearSelectorProps {
	mode: 'gregorian' | 'coptic'
	view: CalendarView
	today: Date
	onNavigate: (view: CalendarView) => void
}

const selectClass =
	'text-lg sm:text-xl font-bold text-gray-900 dark:text-white bg-transparent border-none cursor-pointer hover:text-amber-600 dark:hover:text-amber-500 transition-colors focus:outline-none focus:ring-0 appearance-none'
const optionClass = 'bg-white dark:bg-gray-900'

export function MonthYearSelector({
	mode,
	view,
	today,
	onNavigate,
}: Readonly<MonthYearSelectorProps>) {
	const locale = useLocale()
	const t = useTranslations('calendar')

	if (!features.copticCalendarMode || mode === 'gregorian') {
		return (
			<>
				<select
					value={view.month}
					onChange={(e) => onNavigate(monthView(view.year, Number(e.target.value), today))}
					aria-label={t('selectMonth')}
					className={`${selectClass} pr-1`}
				>
					{getMonthNames(locale).map((name, i) => (
						<option key={name} value={i + 1} className={optionClass}>
							{name}
						</option>
					))}
				</select>
				<select
					value={view.year}
					onChange={(e) => onNavigate(monthView(Number(e.target.value), view.month, today))}
					aria-label={t('selectYear')}
					className={selectClass}
				>
					{yearsAround(view.year).map((y) => (
						<option key={y} value={y} className={optionClass}>
							{formatNumber(y, locale)}
						</option>
					))}
				</select>
			</>
		)
	}

	// The Coptic month of the selected day (or of the month's first day), converted by core
	// through the Julian Day Number: Nasie is 5 or 6 days, so day offsets would drift.
	const coptic = gregorianToCoptic(new Date(view.year, view.month - 1, view.day ?? 1))
	const goToCoptic = (year: number, month: number) => {
		const first = copticToGregorian({ year, month, day: 1 })
		onNavigate({ year: first.getFullYear(), month: first.getMonth() + 1, day: first.getDate() })
	}

	return (
		<>
			<select
				value={coptic.month}
				onChange={(e) => goToCoptic(coptic.year, Number(e.target.value))}
				aria-label={t('selectCopticMonth')}
				className={`${selectClass} pr-1`}
			>
				{Array.from({ length: 13 }, (_, i) => i + 1).map((m) => (
					<option key={m} value={m} className={optionClass}>
						{getCopticMonthName(m, locale)}
					</option>
				))}
			</select>
			<select
				value={coptic.year}
				onChange={(e) => goToCoptic(Number(e.target.value), coptic.month)}
				aria-label={t('selectCopticYear')}
				className={selectClass}
			>
				{yearsAround(coptic.year).map((y) => (
					<option key={y} value={y} className={optionClass}>
						{formatNumber(y, locale)}
					</option>
				))}
			</select>
		</>
	)
}
