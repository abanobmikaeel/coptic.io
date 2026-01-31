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
	service?: string
}

export function SynaxariumReading({
	entries,
	textSize,
	theme = 'light',
	width = 'normal',
	service,
}: SynaxariumReadingProps) {
	const [isOpen, setIsOpen] = useState(true)
	const count = entries.length
	const widthClass = getWidthClass(width)

	return (
		<article id="reading-Synaxarium" className={`scroll-mt-24 ${isOpen ? 'mb-12' : 'mb-4'}`}>
			{/* Clickable header */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full group cursor-pointer"
			>
				<div className={`${widthClass} mx-auto px-4`}>
					<div
						className={`py-4 pl-4 border-l-4 border-amber-500/60 transition-all ${themeClasses.cardBg[theme]}`}
					>
						{service && (
							<p
								className={`text-[10px] font-semibold tracking-widest uppercase mb-2 ${themeClasses.muted[theme]}`}
							>
								{service}
							</p>
						)}
						<div className="flex items-center gap-3">
							<h2
								className={`text-2xl font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors`}
							>
								Synaxarium
							</h2>
							{/* Collapse indicator */}
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className={`${themeClasses.muted[theme]} transition-transform ${isOpen ? '' : '-rotate-90'} opacity-0 group-hover:opacity-100`}
								aria-hidden="true"
							>
								<path d="m6 9 6 6 6-6" />
							</svg>
						</div>
						<p
							className={`text-base mt-1 ${theme === 'sepia' ? 'text-amber-700' : 'text-amber-600/80'}`}
						>
							{count} {count === 1 ? 'commemoration' : 'commemorations'}
						</p>
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
