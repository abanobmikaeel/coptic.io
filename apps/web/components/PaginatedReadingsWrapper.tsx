'use client'

import type { PaginatedMode, ReadingTheme } from '@/lib/reading-preferences'
import { useCallback, useState } from 'react'
import { PaginatedReadingView, type ReadingPage } from './PaginatedReadingView'
import { ReadingDrawer } from './ReadingDrawer'

interface PaginatedReadingsWrapperProps {
	pages: ReadingPage[]
	theme: ReadingTheme
	paginatedMode: PaginatedMode
	scrollContent: React.ReactNode
	onCurrentSectionChange?: (section: string) => void
}

export function PaginatedReadingsWrapper({
	pages,
	theme,
	paginatedMode,
	scrollContent,
	onCurrentSectionChange,
}: PaginatedReadingsWrapperProps) {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)

	const handlePageChange = useCallback(
		(index: number, page: ReadingPage) => {
			setCurrentIndex(index)
			onCurrentSectionChange?.(page.section)
		},
		[onCurrentSectionChange],
	)

	const handleSelectPage = useCallback((index: number) => {
		setCurrentIndex(index)
		// Also trigger the internal jump function if available
		const jumpFn = (window as unknown as { __paginatedJumpToPage?: (index: number) => void })
			.__paginatedJumpToPage
		if (jumpFn) {
			jumpFn(index)
		}
	}, [])

	const openDrawer = useCallback(() => {
		setIsDrawerOpen(true)
	}, [])

	const closeDrawer = useCallback(() => {
		setIsDrawerOpen(false)
	}, [])

	// If scroll mode, just render the scroll content
	if (paginatedMode === 'scroll') {
		return <>{scrollContent}</>
	}

	// Paginated mode
	return (
		<>
			{/* Hamburger menu for paginated mode */}
			<div className="fixed top-20 left-4 z-40">
				<button
					type="button"
					onClick={openDrawer}
					className="p-2.5 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					aria-label="Open navigation menu"
				>
					<svg
						className="w-6 h-6 text-gray-700 dark:text-gray-200"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
			</div>

			{/* Drawer */}
			<ReadingDrawer
				isOpen={isDrawerOpen}
				onClose={closeDrawer}
				pages={pages}
				currentIndex={currentIndex}
				theme={theme}
				onSelectPage={handleSelectPage}
			/>

			{/* Paginated view */}
			<div className="px-6 pt-4 pb-24">
				<PaginatedReadingView
					pages={pages}
					theme={theme}
					onPageChange={handlePageChange}
					onMenuClick={openDrawer}
				/>
			</div>
		</>
	)
}
