'use client'

import { MobileMenu } from '@/components/MobileMenu'
import { useNavigation } from '@/contexts/NavigationContext'
import type { MobileReadingItem } from '@/lib/reading-sections'
import { themeClasses } from '@/lib/reading-styles'
import type { ReactNode } from 'react'

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
	const { mode } = useNavigation()

	// In read mode on mobile/tablet, position at top-0 since navbar is hidden
	// On desktop or in browse mode, position at top-14
	const topClass = mode === 'read' ? 'top-0 xl:top-14' : 'top-14'

	const justifyClass = layout === 'between' ? 'justify-between' : 'justify-center relative'

	return (
		<div
			className={`sticky ${topClass} z-30 ${themeClasses.bgTranslucent[theme]} backdrop-blur-sm border-b ${themeClasses.border[theme]}`}
		>
			<div className={`max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center ${justifyClass}`}>
				{/* Mobile/tablet menu button - left side in read mode (only for center layout) */}
				{layout === 'center' && mode === 'read' && (
					<div className="absolute left-2 sm:left-4 xl:hidden">
						<MobileMenu theme={theme} sections={sections} />
					</div>
				)}

				{children}
			</div>
		</div>
	)
}
