'use client'

import { MobileMenu } from '@/components/MobileMenu'
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
	const { mode, setMobileSections, setReadingTheme } = useNavigation()

	// Register sections and theme so the global MobileMenu can use them
	useEffect(() => {
		setReadingTheme(theme)
	}, [theme, setReadingTheme])

	useEffect(() => {
		setMobileSections(sections ?? [])
	}, [sections, setMobileSections])

	// In read mode on mobile/tablet, position at top-0 since navbar is hidden
	// On desktop or in browse mode, position at top-14
	const topClass = mode === 'read' ? 'top-0 xl:top-14' : 'top-14'

	const justifyClass = layout === 'between' ? 'justify-between' : 'justify-center relative'

	// Extra left padding on mobile in read mode to clear the absolutely-positioned hamburger
	const menuPadding = mode === 'read' ? 'pl-12 lg:pl-3 sm:pl-14 lg:sm:pl-6' : ''

	return (
		<div
			className={`sticky ${topClass} z-30 ${themeClasses.bgTranslucent[theme]} backdrop-blur-sm border-b ${themeClasses.border[theme]}`}
		>
			<div
				className={`max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center ${justifyClass} ${menuPadding}`}
			>
				{/* Hamburger — mobile only, read mode only, absolutely positioned left */}
				{mode === 'read' && (
					<div className="lg:hidden absolute left-2 sm:left-4 top-1/2 -translate-y-1/2">
						<MobileMenu theme={theme} sections={sections ?? []} />
					</div>
				)}
				{children}
			</div>
		</div>
	)
}
