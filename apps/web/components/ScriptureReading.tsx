'use client'

import {
	getFontClass,
	getLineHeightClass,
	getTextSizeClasses,
	getWeightClass,
	getWidthClass,
	themeClasses,
} from '@/lib/reading-styles'
import type { Reading } from '@/lib/types'
import { useState } from 'react'
import type { FontFamily, FontWeight, LineSpacing, ReadingTheme, ReadingWidth, TextSize, ViewMode } from './DisplaySettings'

interface ScriptureReadingProps {
	readings: Reading[]
	title: string
	isRtl: boolean
	id: string
	viewMode: ViewMode
	showVerses: boolean
	textSize?: TextSize
	fontFamily?: FontFamily
	lineSpacing?: LineSpacing
	theme?: ReadingTheme
	width?: ReadingWidth
	weight?: FontWeight
}

export function ScriptureReading({
	readings,
	title,
	isRtl,
	id,
	viewMode,
	showVerses,
	textSize = 'md',
	fontFamily = 'sans',
	lineSpacing = 'normal',
	theme = 'light',
	width = 'normal',
	weight = 'normal',
}: ScriptureReadingProps) {
	const [isOpen, setIsOpen] = useState(true)

	const sizes = getTextSizeClasses(textSize, isRtl)
	const lineHeight = getLineHeightClass(lineSpacing, isRtl)
	const fontClass = getFontClass(fontFamily, isRtl)
	const weightClass = getWeightClass(weight, isRtl)
	const widthClass = getWidthClass(width)

	const reference = readings
		.map((reading) =>
			reading.chapters
				.map((chapter) => {
					const firstVerse = chapter.verses[0]?.num
					const lastVerse = chapter.verses[chapter.verses.length - 1]?.num
					return `${reading.bookName} ${chapter.chapterNum}:${firstVerse}${firstVerse !== lastVerse ? `-${lastVerse}` : ''}`
				})
				.join('; '),
		)
		.join('; ')

	return (
		<article id={id} className={`scroll-mt-24 ${isOpen ? 'mb-12' : 'mb-4'}`}>
			{/* Clickable header */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full group cursor-pointer"
			>
				<div
					className={`${widthClass} mx-auto px-4 py-3 rounded-xl transition-colors ${
						isOpen ? 'bg-transparent' : themeClasses.collapsedBg[theme]
					}`}
				>
					<div className="flex items-center justify-between gap-4">
						<div className="flex-1 text-left">
							<h2 className={`text-lg font-semibold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors`}>
								{title}
							</h2>
							<p className={`text-sm ${theme === 'sepia' ? 'text-amber-700' : 'text-amber-600'}`}>{reference}</p>
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

			{/* Scripture content */}
			{isOpen && (
				<div className={`${widthClass} mx-auto mt-6 px-4`}>
					{readings.map((reading, idx) => (
						<div key={idx}>
							{reading.chapters.map((chapter, cidx) => (
								<div key={cidx} className="mb-8">
									{/* Chapter heading */}
									<h3
										className={`text-center ${sizes.chapter} font-bold tracking-wider ${themeClasses.muted[theme]} mb-6 ${isRtl ? 'font-arabic' : 'uppercase'}`}
										dir={isRtl ? 'rtl' : 'ltr'}
									>
										{reading.bookName} {chapter.chapterNum}
									</h3>

									{/* Verses */}
									{viewMode === 'continuous' ? (
										<p
											className={`${fontClass} ${weightClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} ${isRtl ? 'text-right' : ''}`}
											dir={isRtl ? 'rtl' : 'ltr'}
										>
											{chapter.verses.map((verse, vidx) => (
												<span key={verse.num}>
													{showVerses && (
														<sup className={`${sizes.verseNum} font-normal ${themeClasses.accent[theme]} ${isRtl ? 'ml-1.5' : 'mr-1'}`}>
															{verse.num}
														</sup>
													)}
													<span>{verse.text}</span>
													{vidx < chapter.verses.length - 1 && ' '}
												</span>
											))}
										</p>
									) : (
										<div
											className={`${isRtl ? 'space-y-6' : 'space-y-4'} ${isRtl ? 'text-right' : ''}`}
											dir={isRtl ? 'rtl' : 'ltr'}
										>
											{chapter.verses.map((verse) => (
												<p key={verse.num} className={`${fontClass} ${weightClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]}`}>
													{showVerses && (
														<span className={`${themeClasses.accent[theme]} ${sizes.verseNum} font-normal tabular-nums ${isRtl ? 'ml-3' : 'mr-2'}`}>
															{verse.num}
														</span>
													)}
													{verse.text}
												</p>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					))}
				</div>
			)}
		</article>
	)
}
