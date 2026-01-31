'use client'

import { getWidthClass, themeClasses } from '@/lib/reading-styles'
import type { SynaxariumEntry } from '@/lib/types'
import { useState } from 'react'
import type { ReadingTheme, ReadingWidth, TextSize } from './DisplaySettings'
import { SynaxariumSection } from './SynaxariumSection'

interface SynaxariumReadingProps {
	entries: SynaxariumEntry[]
	textSize: TextSize
	theme?: ReadingTheme
	width?: ReadingWidth
}

export function SynaxariumReading({ entries, textSize, theme = 'light', width = 'normal' }: SynaxariumReadingProps) {
	const [isOpen, setIsOpen] = useState(true)
	const count = entries.length
	const widthClass = getWidthClass(width)

	return (
		<article id="reading-Synaxarium" className={`scroll-mt-24 pt-8 ${isOpen ? 'mb-16' : 'mb-6'}`}>
			{/* Section divider */}
			<div className={`${widthClass} mx-auto mb-6 border-t ${themeClasses.border[theme]}`} />

			{/* Clickable header */}
			<button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full group cursor-pointer">
				<div
					className={`${widthClass} mx-auto px-4 py-4 rounded-xl transition-colors ${
						isOpen ? 'bg-transparent' : themeClasses.collapsedBg[theme]
					}`}
				>
					<div className="flex items-center justify-between gap-4">
						<div className="flex-1 text-left">
							<h2 className={`text-2xl font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors`}>
								Synaxarium
							</h2>
							<p className={`text-base mt-1 ${theme === 'sepia' ? 'text-amber-700' : 'text-amber-600'}`}>
								{count} {count === 1 ? 'commemoration' : 'commemorations'}
							</p>
						</div>

						{/* Expand/Collapse button */}
						<div
							className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
								isOpen
									? `${themeClasses.muted[theme]} group-hover:text-amber-600`
									: theme === 'sepia'
										? 'bg-amber-100 text-amber-800'
										: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
							}`}
						>
							<span>{isOpen ? 'Collapse' : 'Expand'}</span>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className={`transition-transform ${isOpen ? '' : '-rotate-90'}`}
								aria-hidden="true"
							>
								<path d="m6 9 6 6 6-6" />
							</svg>
						</div>
					</div>
				</div>
			</button>

			{/* Content */}
			{isOpen && (
				<div className={`${widthClass} mx-auto mt-4 px-4`}>
					<SynaxariumSection entries={entries} textSize={textSize} theme={theme} />
				</div>
			)}
		</article>
	)
}
