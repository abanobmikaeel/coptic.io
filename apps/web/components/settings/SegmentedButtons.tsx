'use client'

import type { ReadingTheme } from '@/lib/reading-preferences'
import { themeClasses } from '@/lib/reading-styles'

interface SegmentOption<T extends string> {
	value: T
	label?: string
	icon?: React.ReactNode
	className?: string
}

interface SegmentedButtonsProps<T extends string> {
	options: SegmentOption<T>[]
	value: T
	onChange: (value: T) => void
	className?: string
	theme?: ReadingTheme
}

const baseButtonClass = 'flex-1 py-2.5 rounded-lg transition-all duration-200'

export function SegmentedButtons<T extends string>({
	options,
	value,
	onChange,
	className = '',
	theme = 'light',
}: SegmentedButtonsProps<T>) {
	return (
		<div
			className={`flex items-center ${themeClasses.segmentContainer[theme]} rounded-xl p-1 ${className}`}
		>
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					onClick={() => onChange(option.value)}
					className={`${baseButtonClass} ${option.className ?? ''} ${value === option.value ? themeClasses.segmentActive[theme] : themeClasses.segmentInactive[theme]}`}
				>
					{option.icon ?? <span className="text-sm font-medium">{option.label}</span>}
				</button>
			))}
		</div>
	)
}
