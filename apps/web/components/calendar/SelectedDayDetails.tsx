'use client'

import { ChevronRightIcon, CloseIcon } from '@/components/ui/Icons'
import { getFastColors } from '@/constants'
import Link from 'next/link'
import { memo } from 'react'

interface SelectedDayDetailsProps {
	dayData: {
		gregorianDate: string
		copticDate: { dateString: string }
		fasting: { isFasting: boolean; fastType: string | null; description: string | null }
	}
	onClose: () => void
}

export const SelectedDayDetails = memo(function SelectedDayDetails({
	dayData,
	onClose,
}: SelectedDayDetailsProps) {
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
				prefetch={false}
				className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all"
			>
				View Readings
				<ChevronRightIcon className="w-4 h-4" />
			</Link>
		</div>
	)
})
