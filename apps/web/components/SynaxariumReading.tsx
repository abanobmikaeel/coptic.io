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
import type { SynaxariumEntry } from '@/lib/types'
import { useState } from 'react'
import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	ReadingTheme,
	ReadingWidth,
	TextSize,
	WordSpacing,
} from './DisplaySettings'
import { ChevronRightIcon } from './ui/Icons'

type BibleTranslation = 'en' | 'ar' | 'es' | 'cop'

interface SynaxariumReadingProps {
	entriesByLang: Partial<Record<BibleTranslation, SynaxariumEntry[]>>
	languages: BibleTranslation[]
	textSize: TextSize
	theme?: ReadingTheme
	width?: ReadingWidth
	service?: string
	fontFamily?: FontFamily
	weight?: FontWeight
	lineSpacing?: LineSpacing
	wordSpacing?: WordSpacing
}

// Order languages: English first, then other LTR, then Arabic (RTL) last
function orderLanguages(langs: BibleTranslation[]): BibleTranslation[] {
	const order: BibleTranslation[] = []
	if (langs.includes('en')) order.push('en')
	if (langs.includes('cop')) order.push('cop')
	if (langs.includes('es')) order.push('es')
	if (langs.includes('ar')) order.push('ar')
	return order
}

// Merge entries from multiple languages by ID
function mergeEntriesByLang(
	entriesByLang: Partial<Record<BibleTranslation, SynaxariumEntry[]>>,
	orderedLangs: BibleTranslation[],
): { id: string; entries: Partial<Record<BibleTranslation, SynaxariumEntry>> }[] {
	const mergedMap = new Map<string, Partial<Record<BibleTranslation, SynaxariumEntry>>>()
	const orderKeys: string[] = []

	// Process each language's entries
	for (const lang of orderedLangs) {
		const entries = entriesByLang[lang] || []
		for (const entry of entries) {
			const id = entry.id || `fallback-${lang}-${entry.name.slice(0, 20)}`

			if (!mergedMap.has(id)) {
				mergedMap.set(id, {})
				orderKeys.push(id)
			}

			const merged = mergedMap.get(id)!
			merged[lang] = entry
		}
	}

	return orderKeys.map((id) => ({ id, entries: mergedMap.get(id)! }))
}

export function SynaxariumReading({
	entriesByLang,
	languages,
	textSize,
	theme = 'light',
	width = 'normal',
	service,
	fontFamily = 'serif',
	weight = 'normal',
	lineSpacing = 'normal',
	wordSpacing = 'normal',
}: SynaxariumReadingProps) {
	const [isOpen, setIsOpen] = useState(true)
	const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

	// Get available languages with data
	const availableLangs = languages.filter((lang) => entriesByLang[lang]?.length)
	const orderedLangs = orderLanguages(availableLangs)
	const isMultiLang = orderedLangs.length > 1

	// Merge entries by ID for multi-language matching
	const mergedEntries = mergeEntriesByLang(entriesByLang, orderedLangs)

	// Use first available language for count (unique entries)
	const count = mergedEntries.length

	// Width class - responsive, wider for multi-language
	const widthClass = isMultiLang
		? orderedLangs.length >= 3
			? 'max-w-full sm:max-w-7xl'
			: 'max-w-full sm:max-w-6xl'
		: getWidthClass(width)

	// Get style classes for a language
	const getStyleClasses = (lang: BibleTranslation) => {
		const isRtl = lang === 'ar'
		const isCoptic = lang === 'cop'
		return {
			isRtl,
			sizes: getTextSizeClasses(textSize, isRtl),
			lineHeight: getLineHeightClass(lineSpacing, isRtl),
			fontClass: isCoptic ? 'font-coptic' : getFontClass(fontFamily, isRtl),
			weightClass: getWeightClass(weight, isRtl),
			wordSpacingClass: getWordSpacingClass(wordSpacing, isRtl),
		}
	}

	// Title sizes based on textSize (matching scripture reading scales)
	const titleSizes: Record<TextSize, string> = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-lg',
	}

	// Grid columns for multi-language
	const gridCols =
		orderedLangs.length >= 3 ? 'grid-cols-3' : orderedLangs.length === 2 ? 'grid-cols-2' : ''

	return (
		<article id="reading-Synaxarium" className={`scroll-mt-24 ${isOpen ? 'mb-8' : 'mb-3'}`}>
			{/* Clickable header - edge-to-edge on mobile */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full group cursor-pointer -mx-3 sm:mx-0"
			>
				<div className={`${widthClass} sm:mx-auto`}>
					<div
						className={`border-l-4 border-amber-500/60 transition-all ${themeClasses.cardBg[theme]}`}
					>
						<div className="py-1.5 pl-2 pr-1 sm:px-0 flex items-center justify-between">
							<div>
								{service && (
									<p
										className={`text-[9px] font-semibold tracking-widest uppercase ${themeClasses.muted[theme]}`}
									>
										{service}
									</p>
								)}
								<h2
									className={`text-sm font-bold ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors leading-tight`}
								>
									Synaxarium
								</h2>
								<p
									className={`text-[11px] ${theme === 'sepia' ? 'text-amber-700' : 'text-amber-600/80'} leading-tight`}
								>
									{count} {count === 1 ? 'commemoration' : 'commemorations'}
								</p>
							</div>
							{/* Collapse indicator */}
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className={`${themeClasses.muted[theme]} transition-transform ${isOpen ? 'rotate-180' : ''} mr-2`}
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
				<div className={`${widthClass} mx-auto mt-2`}>
					<ul className="space-y-6">
						{mergedEntries.map(({ id, entries }) => {
							// Get the first available entry for single-language display
							const firstEntry = orderedLangs.map((l) => entries[l]).find(Boolean)
							if (!firstEntry) return null

							return (
								<li
									key={id}
									className={`border-b ${themeClasses.border[theme]} last:border-0 pb-6 last:pb-0`}
								>
									{/* Entry title(s) */}
									{isMultiLang ? (
										<button
											type="button"
											onClick={() => setExpandedEntry(expandedEntry === id ? null : id)}
											className={`w-full grid ${gridCols} gap-6`}
										>
											{orderedLangs.map((lang) => {
												const langEntry = entries[lang]
												if (!langEntry) return <div key={lang} />
												const { isRtl } = getStyleClasses(lang)
												return (
													<div
														key={lang}
														className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'} group`}
														dir={isRtl ? 'rtl' : 'ltr'}
													>
														<ChevronRightIcon
															className={`w-5 h-5 mt-0.5 flex-shrink-0 ${themeClasses.muted[theme]} transition-transform duration-200 ${
																expandedEntry === id ? 'rotate-90' : ''
															}`}
														/>
														<span
															className={`${titleSizes[textSize]} font-medium ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors`}
														>
															{langEntry.name}
														</span>
													</div>
												)
											})}
										</button>
									) : (
										<button
											type="button"
											onClick={() => setExpandedEntry(expandedEntry === id ? null : id)}
											className="w-full flex items-start gap-3 text-left group"
										>
											<ChevronRightIcon
												className={`w-5 h-5 mt-0.5 flex-shrink-0 ${themeClasses.muted[theme]} transition-transform duration-200 ${
													expandedEntry === id ? 'rotate-90' : ''
												}`}
											/>
											<span
												className={`${titleSizes[textSize]} font-medium ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors`}
											>
												{firstEntry.name}
											</span>
										</button>
									)}

									{/* Expanded content */}
									{expandedEntry === id && (
										<div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
											{isMultiLang ? (
												<div className={`grid ${gridCols} gap-6`}>
													{orderedLangs.map((lang) => {
														const langEntry = entries[lang]
														if (!langEntry?.text) return <div key={lang} />
														const {
															isRtl,
															sizes,
															lineHeight,
															fontClass,
															weightClass,
															wordSpacingClass,
														} = getStyleClasses(lang)
														return (
															<div key={lang} dir={isRtl ? 'rtl' : 'ltr'}>
																<p
																	className={`${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} whitespace-pre-line ${isRtl ? 'text-right' : ''}`}
																>
																	{langEntry.text}
																</p>
																{langEntry.url && (
																	<a
																		href={langEntry.url}
																		target="_blank"
																		rel="noopener noreferrer"
																		className={`block mt-4 ${themeClasses.accent[theme]} hover:underline text-sm`}
																	>
																		Read on CopticChurch.net
																	</a>
																)}
															</div>
														)
													})}
												</div>
											) : (
												(() => {
													const firstLang = orderedLangs[0] || 'en'
													const {
														isRtl,
														sizes,
														lineHeight,
														fontClass,
														weightClass,
														wordSpacingClass,
													} = getStyleClasses(firstLang)
													return (
														<div
															className={`${isRtl ? 'me-0' : 'ms-8'}`}
															dir={isRtl ? 'rtl' : 'ltr'}
														>
															<p
																className={`${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} whitespace-pre-line ${isRtl ? 'text-right' : ''}`}
															>
																{firstEntry.text}
															</p>
															{firstEntry.url && (
																<a
																	href={firstEntry.url}
																	target="_blank"
																	rel="noopener noreferrer"
																	className={`block mt-4 ${themeClasses.accent[theme]} hover:underline text-sm`}
																>
																	Read on CopticChurch.net
																</a>
															)}
														</div>
													)
												})()
											)}
										</div>
									)}
								</li>
							)
						})}
					</ul>
				</div>
			)}
		</article>
	)
}
