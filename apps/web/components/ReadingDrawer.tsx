'use client'

import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import type { ReadingTheme } from '@/lib/reading-preferences'
import { themeClasses } from '@/lib/reading-styles'
import { useEffect, useRef } from 'react'
import type { ReadingPage } from './PaginatedReadingView'
import { ReadingOutline } from './ReadingOutline'

interface ReadingDrawerProps {
	isOpen: boolean
	onClose: () => void
	pages: ReadingPage[]
	currentIndex: number
	theme: ReadingTheme
	onSelectPage: (index: number) => void
}

export function ReadingDrawer({
	isOpen,
	onClose,
	pages,
	currentIndex,
	theme,
	onSelectPage,
}: ReadingDrawerProps) {
	const drawerRef = useRef<HTMLElement>(null)

	// Swipe left to close
	const swipeRef = useSwipeGesture<HTMLDivElement>({
		onSwipeLeft: onClose,
		minSwipeDistance: 50,
	})

	// Close on escape key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose()
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, onClose])

	// Prevent body scroll when drawer is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
		return () => {
			document.body.style.overflow = ''
		}
	}, [isOpen])

	// Focus management
	useEffect(() => {
		if (isOpen && drawerRef.current) {
			drawerRef.current.focus()
		}
	}, [isOpen])

	const handleSelectPage = (index: number) => {
		onSelectPage(index)
		onClose()
	}

	return (
		<>
			{/* Backdrop */}
			{isOpen && (
				<div
					className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300"
					onClick={onClose}
					onKeyDown={(e) => e.key === 'Escape' && onClose()}
					role="button"
					tabIndex={-1}
					aria-label="Close navigation"
				/>
			)}

			{/* Drawer */}
			<aside
				ref={(el) => {
					// Combine refs
					if (el) {
						(drawerRef as React.MutableRefObject<HTMLElement | null>).current = el
						;(swipeRef as React.MutableRefObject<HTMLElement | null>).current = el
					}
				}}
				className={`fixed top-0 left-0 bottom-0 z-50 w-[280px] ${themeClasses.bg[theme]} shadow-2xl transform transition-transform duration-300 ease-out ${
					isOpen ? 'translate-x-0' : '-translate-x-full'
				}`}
				aria-label="Reading sections navigation"
				tabIndex={-1}
			>
				{/* Header */}
				<div
					className={`flex items-center justify-between px-4 py-4 border-b ${themeClasses.border[theme]}`}
				>
					<h2 className={`text-lg font-semibold ${themeClasses.textHeading[theme]}`}>
						Sections
					</h2>
					<button
						type="button"
						onClick={onClose}
						className={`p-2 rounded-lg transition-colors ${themeClasses.text[theme]} hover:bg-gray-200 dark:hover:bg-gray-700`}
						aria-label="Close navigation"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Outline content - scrollable */}
				<div className="overflow-y-auto h-[calc(100%-65px)]">
					<ReadingOutline
						pages={pages}
						currentIndex={currentIndex}
						theme={theme}
						onSelectPage={handleSelectPage}
					/>
				</div>
			</aside>
		</>
	)
}
