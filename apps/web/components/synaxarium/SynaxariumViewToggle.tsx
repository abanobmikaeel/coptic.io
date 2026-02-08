'use client'

export type ViewMode = 'today' | 'upcoming'

interface SynaxariumViewToggleProps {
	viewMode: ViewMode
	onViewModeChange: (mode: ViewMode) => void
	isToday?: boolean
}

export function SynaxariumViewToggle({ viewMode, onViewModeChange, isToday = true }: SynaxariumViewToggleProps) {
	return (
		<div className="flex w-full sm:w-auto">
			<button
				type="button"
				onClick={() => onViewModeChange('today')}
				className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium rounded-l-lg border transition-all ${
					viewMode === 'today'
						? 'bg-amber-700 text-white border-amber-700'
						: 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
				}`}
			>
				{viewMode === 'today' && !isToday ? 'Day View' : 'Today'}
			</button>
			<button
				type="button"
				onClick={() => onViewModeChange('upcoming')}
				className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium rounded-r-lg border-t border-r border-b -ml-px transition-all ${
					viewMode === 'upcoming'
						? 'bg-amber-700 text-white border-amber-700'
						: 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
				}`}
			>
				Upcoming
			</button>
		</div>
	)
}
