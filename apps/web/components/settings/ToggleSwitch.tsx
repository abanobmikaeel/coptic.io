'use client'

interface ToggleSwitchProps {
	label: string
	checked: boolean
	onChange: () => void
}

export function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
	return (
		<button
			type="button"
			onClick={onChange}
			className="w-full flex items-center justify-between py-1"
		>
			<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
			<div
				className={`w-12 h-7 rounded-full transition-colors duration-200 relative ${checked ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}
			>
				<div
					className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
				/>
			</div>
		</button>
	)
}
