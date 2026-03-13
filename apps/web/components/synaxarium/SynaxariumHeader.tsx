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
		<section className="relative px-4 sm:px-6 pb-3 sm:pb-6">
			<div className="max-w-4xl mx-auto">
				{/* Toggle buttons - refined pill design */}
				<div className="flex items-center justify-center mb-3 sm:mb-6">
					<div className="inline-flex p-1 rounded-full bg-gray-100 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50">
						<button
							type="button"
							onClick={() => onViewModeChange('day')}
							className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
								isDayView
									? 'bg-amber-600 text-white shadow-sm'
									: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
							}`}
						>
							{isDayView ? (isToday ? tCommon('today') : t('day')) : tCommon('today')}
						</button>
						<button
							type="button"
							onClick={() => onViewModeChange('upcoming')}
							className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
								!isDayView
									? 'bg-amber-600 text-white shadow-sm'
									: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
							}`}
						>
							{tCommon('upcoming')}
						</button>
					</div>
				</div>

				{/* Date display with nav - only in day view */}
				{isDayView && (
					<div className="flex items-center justify-center gap-3">
						<button
							type="button"
							onClick={onPrevious}
							aria-label={t('previousDay')}
							className="p-2.5 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200"
						>
							<ChevronLeftIcon className="w-5 h-5" />
						</button>

						<div className="text-center min-w-[220px] py-1">
							<p className="text-base font-semibold text-gray-900 dark:text-white">
								{gregorianDate}
							</p>
							{copticDate && (
								<p className="text-sm font-medium text-amber-600 dark:text-amber-500 tracking-wide">
									{copticDate}
								</p>
							)}
						</div>

						<button
							type="button"
							onClick={onNext}
							aria-label={t('nextDay')}
							className="p-2.5 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200"
						>
							<ChevronRightIcon className="w-5 h-5" />
						</button>
					</div>
				)}
			</div>
		</section>
	)
}
