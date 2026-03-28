'use client'

import { MobileMenu } from '@/components/MobileMenu'
import { CloseIcon } from '@/components/ui/Icons'
import { useNavigation } from '@/contexts/NavigationContext'
import { themeClasses } from '@/lib/reading-styles'
import { useRouter } from 'next/navigation'

export function ReadModeHeader() {
	const { mode, readModeTitle, readingTheme, mobileSections } = useNavigation()
	const router = useRouter()

	// Only show in read mode on mobile
	if (mode !== 'read') {
		return null
	}

	const handleExit = () => {
		router.push('/')
	}

	return (
		<header
			className={`sticky top-0 z-50 lg:hidden backdrop-blur-sm border-b ${themeClasses.bgTranslucent[readingTheme]} ${themeClasses.border[readingTheme]}`}
		>
			<div className="flex items-center justify-between h-14 px-4">
				{/* Hamburger menu with MobileMenu dialog */}
				<MobileMenu theme={readingTheme} sections={mobileSections} />

				{/* Title */}
				{readModeTitle && (
					<h1
						className={`text-sm font-semibold truncate max-w-[200px] ${themeClasses.textHeading[readingTheme]}`}
					>
						{readModeTitle}
					</h1>
				)}

				{/* Exit button */}
				<button
					type="button"
					onClick={handleExit}
					className={`p-2 -mr-2 transition-colors ${themeClasses.drawerButton[readingTheme]}`}
					aria-label="Exit reading mode"
				>
					<CloseIcon className="w-6 h-6" />
				</button>
			</div>
		</header>
	)
}
