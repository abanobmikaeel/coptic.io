interface SelectProps {
	value: string
	onChange: (value: string) => void
	options: { value: string; label: string }[]
	disabled?: boolean
}

export function Select({ value, onChange, options, disabled }: SelectProps) {
	return (
		<select
			value={value}
			onChange={(e) => onChange(e.target.value)}
			disabled={disabled}
			className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
		>
			{options.map((opt) => (
				<option key={opt.value} value={opt.value}>
					{opt.label}
				</option>
			))}
		</select>
	)
}
