import type { ReadingTheme } from '@/lib/reading-preferences'
import { themeClasses } from '@/lib/reading-styles'

interface SettingSectionProps {
	label: string
	children: React.ReactNode
	theme?: ReadingTheme
}

export function SettingSection({ label, children, theme = 'light' }: SettingSectionProps) {
	return (
		<div className="mb-5">
			<p
				className={`text-xs font-semibold mb-2.5 uppercase tracking-wider ${themeClasses.settingsLabel[theme]}`}
			>
				{label}
			</p>
			{children}
		</div>
	)
}
