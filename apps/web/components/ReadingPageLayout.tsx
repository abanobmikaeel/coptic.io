import type { ReadingTheme } from '@/components/DisplaySettings'
import { themeClasses } from '@/lib/reading-styles'
import type { ReactNode } from 'react'

interface ReadingPageLayoutProps {
	theme: ReadingTheme
	header?: ReactNode
	children: ReactNode
	className?: string
}

export function ReadingPageLayout({ theme, header, children, className }: ReadingPageLayoutProps) {
	return (
		<main
			className={`min-h-screen ${themeClasses.bg[theme]} ${themeClasses.textHeading[theme]} transition-colors duration-300 ${className || ''}`}
		>
			{header}
			{children}
		</main>
	)
}
