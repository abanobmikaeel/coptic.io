'use client'

import type { ViewMode } from '@/lib/reading-preferences'
import { useState } from 'react'
import { VerseDisplay } from './VerseDisplay'
import type { AgpeyaPsalm, ThemeStyles } from './types'

interface PsalmContentProps {
	psalm: AgpeyaPsalm
	textStyles: string
	verseNumClass: string
	themeStyles: ThemeStyles
	isRtl: boolean
	viewMode: ViewMode
	defaultOpen?: boolean
}

export function PsalmContent({
	psalm,
	textStyles,
	verseNumClass,
	themeStyles,
	isRtl,
	viewMode,
	defaultOpen = true,
}: PsalmContentProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen)

	return (
		<div dir={isRtl ? 'rtl' : 'ltr'}>
			{/* Psalm header - clickable to collapse */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full text-left flex items-center justify-between group cursor-pointer py-2"
			>
				<div>
					<span className={`font-medium ${themeStyles.text}`}>{psalm.title}</span>
					<span className={`text-sm ${themeStyles.muted} ml-2`}>{psalm.reference}</span>
					{psalm.rubric && (
						<span className={`text-sm italic ${themeStyles.muted} ml-2`}>— {psalm.rubric}</span>
					)}
				</div>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					className={`${themeStyles.muted} transition-transform flex-shrink-0 ml-4 ${isOpen ? '' : '-rotate-90'}`}
					aria-hidden="true"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</button>

			{/* Verses - collapsible */}
			{isOpen && (
				<VerseDisplay
					verses={psalm.verses}
					textStyles={textStyles}
					verseNumClass={verseNumClass}
					themeStyles={themeStyles}
					isRtl={isRtl}
					viewMode={viewMode}
				/>
			)}
		</div>
	)
}
