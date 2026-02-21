'use client'

import { MobileMenu } from '@/components/MobileMenu'
import { CloseIcon } from '@/components/ui/Icons'
import { useNavigation } from '@/contexts/NavigationContext'
import { useRouter } from 'next/navigation'

export function ReadModeHeader() {
	const { mode, readModeTitle, readingTheme, mobileSections } = useNavigation()
	const router = useRouter()

	// Only show in read mode on mobile
	if (mode !== 'read') {
		return null
	}

	const handleExit = () => {
		router.push('/library')
	}

	return (
		<header className="sticky top-0 z-50 lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
			<div className="flex items-center justify-between h-14 px-4">
				{/* Hamburger menu with MobileMenu dialog */}
				<MobileMenu theme={readingTheme} sections={mobileSections} />

				{/* Title */}
				{readModeTitle && (
					<h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">
						{readModeTitle}
					</h1>
				)}

				{/* Exit button */}
				<button
					type="button"
					onClick={handleExit}
					className="p-2 -mr-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
					aria-label="Exit reading mode"
				>
					<CloseIcon className="w-6 h-6" />
				</button>
			</div>
		</header>
	)
}
