'use client'

import { MonitorIcon, MoonIcon, SunIcon } from '@/components/ui/Icons'
import { useTheme } from 'next-themes'

const options = [
	{ value: 'light', label: 'Light', Icon: SunIcon },
	{ value: 'dark', label: 'Dark', Icon: MoonIcon },
	{ value: 'system', label: 'System', Icon: MonitorIcon },
] as const

export function AppThemeToggle() {
	const { theme, setTheme } = useTheme()

	return (
		<div className="py-3 border-b border-gray-100 dark:border-gray-800">
			<p className="text-sm font-medium text-gray-900 dark:text-white mb-3">App theme</p>
			<div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
				{options.map(({ value, label, Icon }) => (
					<button
						key={value}
						type="button"
						onClick={() => setTheme(value)}
						className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
							theme === value
								? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
								: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
						}`}
					>
						<Icon className="w-4 h-4" />
						{label}
					</button>
				))}
			</div>
		</div>
	)
}
