'use client'

interface CalendarModeToggleProps {
	mode: 'gregorian' | 'coptic'
	onModeChange: (mode: 'gregorian' | 'coptic') => void
	copticEnabled: boolean
}

export function CalendarModeToggle({ mode, onModeChange, copticEnabled }: CalendarModeToggleProps) {
	return (
		<div className="flex justify-center mb-4">
			<div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-gray-100 dark:bg-gray-800">
				<button
					type="button"
					onClick={() => onModeChange('gregorian')}
					className={`px-4 py-2 text-base font-bold rounded-md transition-all ${
						mode === 'gregorian'
							? 'bg-white dark:bg-gray-900 text-amber-600 shadow-sm'
							: 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
					}`}
				>
					En
				</button>
				<button
					type="button"
					onClick={() => onModeChange('coptic')}
					disabled={!copticEnabled}
					className={`px-4 py-2 text-xl font-bold rounded-md transition-all font-[family-name:var(--font-coptic)] ${
						mode === 'coptic'
							? 'bg-white dark:bg-gray-900 text-amber-600 shadow-sm'
							: !copticEnabled
								? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
								: 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
					}`}
				>
					Ⲁ
				</button>
			</div>
		</div>
	)
}
