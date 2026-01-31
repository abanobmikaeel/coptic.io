interface SettingSectionProps {
	label: string
	children: React.ReactNode
}

export function SettingSection({ label, children }: SettingSectionProps) {
	return (
		<div className="mb-5">
			<p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2.5 uppercase tracking-wider">
				{label}
			</p>
			{children}
		</div>
	)
}
