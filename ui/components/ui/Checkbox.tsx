import { type InputHTMLAttributes, forwardRef } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
	label: string
	description?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	({ className = '', label, description, ...props }, ref) => {
		return (
			<label
				className={`flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${className}`}
			>
				<div>
					<p className="font-medium text-gray-900 dark:text-white">{label}</p>
					{description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
				</div>
				<input
					ref={ref}
					type="checkbox"
					className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
					{...props}
				/>
			</label>
		)
	},
)

Checkbox.displayName = 'Checkbox'
