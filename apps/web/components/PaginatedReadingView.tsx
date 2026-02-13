'use client'

import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import type { ReadingTheme } from '@/lib/reading-preferences'
import { themeClasses } from '@/lib/reading-styles'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'

export interface ReadingPage {
	id: string
	service: string
	section: string
	content: ReactNode
}

interface PaginatedReadingViewProps {
	pages: ReadingPage[]
	theme: ReadingTheme
	onPageChange?: (pageIndex: number, page: ReadingPage) => void
	onMenuClick?: () => void
}

export function PaginatedReadingView({
	pages,
	theme,
	onPageChange,
}: PaginatedReadingViewProps) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isAnimating, setIsAnimating] = useState(false)
	const [direction, setDirection] = useState<'left' | 'right' | null>(null)

	const currentPage = pages[currentIndex]

	const goToPage = useCallback(
		(index: number, dir: 'left' | 'right') => {
			if (index < 0 || index >= pages.length || isAnimating) return

			setDirection(dir)
			setIsAnimating(true)

			// After animation starts, update the page
			setTimeout(() => {
				setCurrentIndex(index)
				onPageChange?.(index, pages[index])
				// Reset animation state after transition
				setTimeout(() => {
					setIsAnimating(false)
					setDirection(null)
				}, 50)
			}, 150)
		},
		[pages, isAnimating, onPageChange],
	)

	const goToPrev = useCallback(() => {
		goToPage(currentIndex - 1, 'right')
	}, [currentIndex, goToPage])

	const goToNext = useCallback(() => {
		goToPage(currentIndex + 1, 'left')
	}, [currentIndex, goToPage])

	// Jump to specific page (used by outline navigation)
	const jumpToPage = useCallback(
		(index: number) => {
			if (index < 0 || index >= pages.length) return
			setCurrentIndex(index)
			onPageChange?.(index, pages[index])
			setDirection(null)
			setIsAnimating(false)
		},
		[pages, onPageChange],
	)

	// Expose jumpToPage for external use
	useEffect(() => {
		// Store the jump function on window for drawer access
		;(window as unknown as { __paginatedJumpToPage?: (index: number) => void }).__paginatedJumpToPage = jumpToPage
		return () => {
			;(window as unknown as { __paginatedJumpToPage?: (index: number) => void }).__paginatedJumpToPage = undefined
		}
	}, [jumpToPage])

	// Swipe gesture handling
	const swipeRef = useSwipeGesture<HTMLDivElement>({
		onSwipeLeft: goToNext,
		onSwipeRight: goToPrev,
		minSwipeDistance: 50,
	})

	// Tap zone handling
	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const rect = e.currentTarget.getBoundingClientRect()
			const x = e.clientX - rect.left
			const width = rect.width

			// Left 20% = prev, right 20% = next
			if (x < width * 0.2) {
				goToPrev()
			} else if (x > width * 0.8) {
				goToNext()
			}
		},
		[goToPrev, goToNext],
	)

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				goToPrev()
			} else if (e.key === 'ArrowRight') {
				goToNext()
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [goToPrev, goToNext])

	if (pages.length === 0) {
		return null
	}

	const getAnimationClass = () => {
		if (!isAnimating || !direction) return 'translate-x-0 opacity-100'
		if (direction === 'left') return '-translate-x-4 opacity-0'
		return 'translate-x-4 opacity-0'
	}

	return (
		<div className="relative min-h-[calc(100vh-200px)]">
			{/* Main content area with tap zones */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard nav is handled globally via useEffect */}
			<div
				ref={swipeRef}
				onClick={handleClick}
				className="touch-pan-y cursor-pointer"
			>
				{/* Tap zone indicators (visible on hover/focus) */}
				<div className="pointer-events-none absolute inset-y-0 left-0 w-[20%] opacity-0 hover:opacity-10 bg-gradient-to-r from-gray-500 to-transparent transition-opacity" />
				<div className="pointer-events-none absolute inset-y-0 right-0 w-[20%] opacity-0 hover:opacity-10 bg-gradient-to-l from-gray-500 to-transparent transition-opacity" />

				{/* Content with animation */}
				<div
					className={`transition-all duration-150 ease-out ${getAnimationClass()}`}
				>
					{currentPage?.content}
				</div>
			</div>

			{/* Progress indicator */}
			<div
				className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full ${themeClasses.bgTranslucent[theme]} backdrop-blur-sm border ${themeClasses.border[theme]} shadow-lg z-40`}
			>
				<div className="flex items-center gap-3">
					{/* Prev button */}
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							goToPrev()
						}}
						disabled={currentIndex === 0}
						className={`p-1 rounded-full transition-colors ${
							currentIndex === 0
								? 'opacity-30 cursor-not-allowed'
								: 'hover:bg-gray-200 dark:hover:bg-gray-700'
						}`}
						aria-label="Previous page"
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
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					{/* Page counter */}
					<span className={`text-sm font-medium ${themeClasses.text[theme]}`}>
						{currentIndex + 1} of {pages.length}
					</span>

					{/* Next button */}
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							goToNext()
						}}
						disabled={currentIndex === pages.length - 1}
						className={`p-1 rounded-full transition-colors ${
							currentIndex === pages.length - 1
								? 'opacity-30 cursor-not-allowed'
								: 'hover:bg-gray-200 dark:hover:bg-gray-700'
						}`}
						aria-label="Next page"
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
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	)
}
