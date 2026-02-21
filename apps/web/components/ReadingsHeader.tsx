'use client'

import { MobileMenu } from '@/components/MobileMenu'
import { useNavigation } from '@/contexts/NavigationContext'
import type { MobileReadingItem } from '@/lib/reading-sections'
import type { ReactNode } from 'react'

interface ReadingsHeaderProps {
	children: ReactNode
	theme: 'light' | 'sepia' | 'dark'
	themeClasses: {
		bgTranslucent: Record<string, string>
		border: Record<string, string>
	}
	sections?: MobileReadingItem[]
}

export function ReadingsHeader({ children, theme, themeClasses, sections }: ReadingsHeaderProps) {
	const { mode } = useNavigation()

	// In read mode on mobile/tablet, position at top-0 since navbar is hidden
	// On desktop or in browse mode, position at top-14
	const topClass = mode === 'read' ? 'top-0 xl:top-14' : 'top-14'

	return (
		<div
			className={`sticky ${topClass} z-30 ${themeClasses.bgTranslucent[theme]} backdrop-blur-sm border-b ${themeClasses.border[theme]}`}
		>
			<div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-center relative">
				{/* Mobile/tablet menu button - left side in read mode */}
				{mode === 'read' && (
					<div className="absolute left-2 sm:left-4 xl:hidden">
						<MobileMenu theme={theme} sections={sections} />
					</div>
				)}

				{children}
			</div>
		</div>
	)
}
