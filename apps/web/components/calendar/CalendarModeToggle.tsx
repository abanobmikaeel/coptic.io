'use client'

import { useTranslations } from 'next-intl'

interface CalendarModeToggleProps {
	mode: 'gregorian' | 'coptic'
	onModeChange: (mode: 'gregorian' | 'coptic') => void
}

const modes = ['gregorian', 'coptic'] as const

// Chooses which calendar numbers the grid's days: two labelled options, the active one pressed
export function CalendarModeToggle({ mode, onModeChange }: Readonly<CalendarModeToggleProps>) {
	const t = useTranslations('calendar')

	return (
		<div className="flex justify-center mb-4">
			<fieldset className="m-0 min-w-0 inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-gray-100 dark:bg-gray-800">
				<legend className="sr-only">{t('calendarType')}</legend>
				{modes.map((m) => (
					<button
						key={m}
						type="button"
						onClick={() => onModeChange(m)}
						aria-pressed={mode === m}
						className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
							mode === m
								? 'bg-white dark:bg-gray-900 text-amber-600 shadow-sm'
								: 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
						}`}
					>
						{t(m)}
					</button>
				))}
			</fieldset>
		</div>
	)
}
