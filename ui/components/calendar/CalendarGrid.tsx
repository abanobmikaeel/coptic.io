'use client'

import { features } from '@/config'
import { WEEKDAYS, getFastColors } from '@/constants'
import type { CalendarDay } from '@/lib/types'

interface CalendarGridProps {
	days: CalendarDay[]
	blanks: number[]
	selectedDay: number
	todayKey: string
	mode: 'gregorian' | 'coptic'
	onSelectDay: (day: number) => void
	loading: boolean
}

export function CalendarGrid({
	days,
	blanks,
	selectedDay,
	todayKey,
	mode,
	onSelectDay,
	loading,
}: CalendarGridProps) {
	return (
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
								onClick={() => onSelectDay(dayNum)}
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
	)
}
