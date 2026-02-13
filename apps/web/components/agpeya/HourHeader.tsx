import type { ThemeStyles } from './types'

interface HourHeaderProps {
	title: string
	subtitle: string
	introduction?: string
	themeStyles: ThemeStyles
}

export function HourHeader({ title, subtitle, introduction, themeStyles }: HourHeaderProps) {
	return (
		<header className="mb-8" id="section-header">
			<h1 className={`text-2xl font-bold ${themeStyles.textHeading}`}>{title}</h1>
			<p className={`text-sm ${themeStyles.muted}`}>{subtitle}</p>
			{introduction && <p className={`text-sm italic ${themeStyles.muted} mt-3`}>{introduction}</p>}
		</header>
	)
}
