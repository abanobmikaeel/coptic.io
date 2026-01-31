'use client'

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
}

const baseButtonClass = 'flex-1 py-2.5 rounded-lg transition-all duration-200'
const activeClass = 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
const inactiveClass = 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'

export function SegmentedButtons<T extends string>({ options, value, onChange, className = '' }: SegmentedButtonsProps<T>) {
	return (
		<div className={`flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 ${className}`}>
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					onClick={() => onChange(option.value)}
					className={`${baseButtonClass} ${option.className ?? ''} ${value === option.value ? activeClass : inactiveClass}`}
				>
					{option.icon ?? <span className="text-sm font-medium">{option.label}</span>}
				</button>
			))}
		</div>
	)
}

export { activeClass, inactiveClass, baseButtonClass }
