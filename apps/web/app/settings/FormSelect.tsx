import { ChevronDownIcon } from '@/components/ui/Icons'
import { type Control, Controller, type FieldPath } from 'react-hook-form'
import type { SettingsFormValues } from './types'

interface FormSelectProps {
	control: Control<SettingsFormValues>
	name: FieldPath<SettingsFormValues>
	label: string
	description?: string
	options: { value: string; label: string }[]
}

export function FormSelect({ control, name, label, description, options }: FormSelectProps) {
	return (
		<div className="flex items-center justify-between gap-6 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
				{description && (
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
				)}
			</div>
			<Controller
				control={control}
				name={name}
				render={({ field }) => (
					<div className="relative flex-shrink-0">
						<select
							value={field.value as string}
							onChange={(e) => field.onChange(e.target.value)}
							className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
						>
							{options.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
						<ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-gray-400" strokeWidth={2.5} />
					</div>
				)}
			/>
		</div>
	)
}
