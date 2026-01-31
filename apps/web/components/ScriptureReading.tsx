'use client'

import {
	getFontClass,
	getLineHeightClass,
	getTextSizeClasses,
	getWeightClass,
	getWidthClass,
	getWordSpacingClass,
	themeClasses,
} from '@/lib/reading-styles'
import type { Reading } from '@/lib/types'
import { useState } from 'react'
import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	ReadingTheme,
	ReadingWidth,
	TextSize,
	ViewMode,
	WordSpacing,
} from './DisplaySettings'

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
	wordSpacing?: WordSpacing
	theme?: ReadingTheme
	width?: ReadingWidth
	weight?: FontWeight
	service?: string
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
	wordSpacing = 'normal',
	theme = 'light',
	width = 'normal',
	weight = 'normal',
	service,
}: ScriptureReadingProps) {
	const [isOpen, setIsOpen] = useState(true)

	const sizes = getTextSizeClasses(textSize, isRtl)
	const lineHeight = getLineHeightClass(lineSpacing, isRtl)
	const fontClass = getFontClass(fontFamily, isRtl)
	const weightClass = getWeightClass(weight, isRtl)
	const widthClass = getWidthClass(width)
	const wordSpacingClass = getWordSpacingClass(wordSpacing, isRtl)

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
								{title}
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
							{reference}
						</p>
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
										className={`text-center ${sizes.chapter} font-bold tracking-wider ${themeClasses.muted[theme]} mb-10 ${isRtl ? 'font-arabic' : 'uppercase'}`}
										dir={isRtl ? 'rtl' : 'ltr'}
									>
										{reading.bookName} {chapter.chapterNum}
									</h3>

									{/* Verses */}
									{viewMode === 'continuous' ? (
										<p
											className={`${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} ${isRtl ? 'text-right' : 'first-letter-large'}`}
											dir={isRtl ? 'rtl' : 'ltr'}
										>
											{chapter.verses.map((verse, vidx) => (
												<span key={verse.num}>
													{showVerses && (
														<sup
															className={`${sizes.verseNum} font-normal ${themeClasses.accent[theme]} ${isRtl ? 'ml-1.5' : 'mr-1'}`}
														>
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
											{chapter.verses.map((verse, vidx) => (
												<p
													key={verse.num}
													className={`${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} ${vidx === 0 && !isRtl ? 'first-letter-large' : ''}`}
												>
													{showVerses && (
														<span
															className={`${themeClasses.accent[theme]} ${sizes.verseNum} font-normal tabular-nums ${isRtl ? 'ml-3' : 'mr-2'}`}
														>
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
