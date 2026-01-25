'use client'

import { features } from '@/config'
import { COPTIC_MONTHS, GREGORIAN_MONTHS } from '@/constants'
import { memo } from 'react'

interface MonthYearSelectorProps {
	mode: 'gregorian' | 'coptic'
	month: number
	year: number
	copticMonthInfo?: { month: number; year: number } | null
	onMonthChange: (month: number) => void
	onYearChange: (year: number) => void
	baseYear: number
}

export const MonthYearSelector = memo(function MonthYearSelector({
	mode,
	month,
	year,
	copticMonthInfo,
	onMonthChange,
	onYearChange,
	baseYear,
}: MonthYearSelectorProps) {
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
