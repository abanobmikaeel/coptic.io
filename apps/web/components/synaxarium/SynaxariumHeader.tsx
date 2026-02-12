'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons'
import { useTranslations } from 'next-intl'

export type ViewMode = 'day' | 'upcoming'

interface SynaxariumHeaderProps {
	viewMode: ViewMode
	gregorianDate: string
	copticDate?: string
	isToday: boolean
	onViewModeChange: (mode: ViewMode) => void
	onPrevious: () => void
	onNext: () => void
}

export function SynaxariumHeader({
	viewMode,
	gregorianDate,
	copticDate,
	isToday,
	onViewModeChange,
	onPrevious,
	onNext,
}: SynaxariumHeaderProps) {
	const t = useTranslations('synaxarium')
	const tCommon = useTranslations('common')
	const isDayView = viewMode === 'day'

	return (
		<section className="relative px-6 pb-4">
			<div className="max-w-4xl mx-auto">
				{/* Toggle buttons */}
				<div className="flex items-center justify-center gap-3 mb-4">
					<button
						type="button"
						onClick={() => onViewModeChange('day')}
						className={`px-5 py-2 text-sm font-medium rounded-s-lg border transition-all ${
							isDayView
								? 'bg-amber-700 text-white border-amber-700'
								: 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
						}`}
					>
						{isDayView ? (isToday ? tCommon('today') : t('day')) : tCommon('today')}
					</button>
					<button
						type="button"
						onClick={() => onViewModeChange('upcoming')}
						className={`px-5 py-2 text-sm font-medium rounded-e-lg border-t border-e border-b -ms-3 transition-all ${
							!isDayView
								? 'bg-amber-700 text-white border-amber-700'
								: 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
						}`}
					>
						{tCommon('upcoming')}
					</button>
				</div>

				{/* Date display with nav - only in day view */}
				{isDayView && (
					<div className="flex items-center justify-center gap-2">
						<button
							type="button"
							onClick={onPrevious}
							aria-label={t('previousDay')}
							className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						>
							<ChevronLeftIcon className="w-5 h-5" />
						</button>

						<div className="text-center min-w-[200px]">
							<p className="text-base font-semibold text-gray-900 dark:text-white">
								{gregorianDate}
							</p>
							{copticDate && (
								<p className="text-sm text-amber-600 dark:text-amber-500">{copticDate}</p>
							)}
						</div>

						<button
							type="button"
							onClick={onNext}
							aria-label={t('nextDay')}
							className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						>
							<ChevronRightIcon className="w-5 h-5" />
						</button>
					</div>
				)}
			</div>
		</section>
	)
}
