'use client'

import { useNavigation } from '@/contexts/NavigationContext'
import type { MobileReadingItem } from '@/lib/reading-sections'
import { themeClasses } from '@/lib/reading-styles'
import { type ReactNode, useEffect } from 'react'

interface ReadingsHeaderProps {
	children: ReactNode
	theme: 'light' | 'sepia' | 'dark'
	sections?: MobileReadingItem[]
	layout?: 'center' | 'between'
}

export function ReadingsHeader({
	children,
	theme,
	sections,
	layout = 'center',
}: ReadingsHeaderProps) {
	const { setMobileSections, setReadingTheme } = useNavigation()

	// Register sections and theme so the global MobileMenu can use them
	useEffect(() => {
		setReadingTheme(theme)
	}, [theme, setReadingTheme])

	useEffect(() => {
		setMobileSections(sections ?? [])
	}, [sections, setMobileSections])

	const justifyClass = layout === 'between' ? 'justify-between' : 'justify-center relative'

	return (
		<div
			className={`sticky top-14 z-30 ${themeClasses.bgTranslucent[theme]} backdrop-blur-sm border-b ${themeClasses.border[theme]}`}
		>
			<div className={`max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center ${justifyClass}`}>
				{children}
			</div>
		</div>
	)
}
