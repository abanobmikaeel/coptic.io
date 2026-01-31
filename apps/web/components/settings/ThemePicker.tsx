'use client'

import type { ReadingTheme, ThemePreference } from '../DisplaySettings'

interface ThemePickerProps {
	value: ReadingTheme
	isAuto: boolean
	onChange: (theme: ThemePreference) => void
}

const selectedClass = 'border-amber-500 ring-2 ring-amber-500/30'
const unselectedClass = 'border-gray-300 dark:border-gray-600 hover:border-gray-400'

export function ThemePicker({ value, isAuto, onChange }: ThemePickerProps) {
	return (
		<div className="flex items-center justify-center gap-3">
			{/* Auto - half light/half dark */}
			<button
				type="button"
				onClick={() => onChange('auto')}
				className={`w-12 h-12 rounded-full border-2 transition-all duration-200 overflow-hidden relative ${isAuto ? selectedClass : unselectedClass}`}
				aria-label="Auto theme (follows system)"
			>
				<div className="absolute inset-0 bg-white" />
				<div
					className="absolute inset-0 bg-gray-900"
					style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
				/>
			</button>

			{/* Light */}
			<button
				type="button"
				onClick={() => onChange('light')}
				className={`w-12 h-12 rounded-full border-2 transition-all duration-200 bg-white ${!isAuto && value === 'light' ? selectedClass : unselectedClass}`}
				aria-label="Light theme"
			/>

			{/* Sepia */}
			<button
				type="button"
				onClick={() => onChange('sepia')}
				className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${!isAuto && value === 'sepia' ? selectedClass : unselectedClass}`}
				style={{ backgroundColor: '#f5f0e6' }}
				aria-label="Sepia theme"
			/>

			{/* Dark */}
			<button
				type="button"
				onClick={() => onChange('dark')}
				className={`w-12 h-12 rounded-full border-2 transition-all duration-200 bg-gray-900 ${!isAuto && value === 'dark' ? selectedClass : 'border-gray-600 hover:border-gray-500'}`}
				aria-label="Dark theme"
			/>
		</div>
	)
}
