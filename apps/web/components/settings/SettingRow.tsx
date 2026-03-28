interface SettingRowProps {
	label: string
	description: string
	children: React.ReactNode
}

export function SettingRow({ label, description, children }: SettingRowProps) {
	return (
		<div className="flex items-center justify-between gap-4">
			<div>
				<p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
				<p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
			</div>
			{children}
		</div>
	)
}
