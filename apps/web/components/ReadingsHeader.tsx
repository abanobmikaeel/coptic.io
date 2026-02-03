'use client'

import { useNavigation } from '@/contexts/NavigationContext'
import { CloseIcon } from '@/components/ui/Icons'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

interface ReadingsHeaderProps {
	children: ReactNode
	theme: 'light' | 'sepia' | 'dark'
	themeClasses: {
		bgTranslucent: Record<string, string>
		border: Record<string, string>
	}
}

export function ReadingsHeader({ children, theme, themeClasses }: ReadingsHeaderProps) {
	const { mode } = useNavigation()
	const router = useRouter()

	const handleExit = () => {
		router.push('/library')
	}

	// In read mode on mobile, position at top-0 since navbar is hidden
	// On desktop or in browse mode, position at top-14
	const topClass = mode === 'read' ? 'top-0 lg:top-14' : 'top-14'

	return (
		<div
			className={`sticky ${topClass} z-30 ${themeClasses.bgTranslucent[theme]} backdrop-blur-sm border-b ${themeClasses.border[theme]}`}
		>
			<div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center relative">
				{/* Mobile exit button - left side in read mode */}
				{mode === 'read' && (
					<button
						type="button"
						onClick={handleExit}
						className="absolute left-4 lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						aria-label="Exit reading mode"
					>
						<CloseIcon className="w-5 h-5" />
					</button>
				)}

				{children}
			</div>
		</div>
	)
}
