'use client'

import { useTranslations } from 'next-intl'

export type ViewMode = 'day' | 'upcoming'

interface SynaxariumHeaderProps {
	viewMode: ViewMode
	onViewModeChange: (mode: ViewMode) => void
}

// Day vs upcoming view toggle. Date navigation now lives in the shared sticky
// ReadingsHeader (with the breadcrumb + display settings), so this header only
// owns the view switch — keeping it aligned with the rest of the reader pages.
export function SynaxariumHeader({ viewMode, onViewModeChange }: Readonly<SynaxariumHeaderProps>) {
	const tCommon = useTranslations('common')
	const isDayView = viewMode === 'day'

	return (
		<section className="relative px-4 sm:px-6 pt-4 pb-3 sm:pb-6">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-center">
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
							{tCommon('today')}
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
			</div>
		</section>
	)
}
