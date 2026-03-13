'use client'

import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	ReadingTheme,
	TextSize,
	WordSpacing,
} from '@/components/DisplaySettings'
import { ChevronRightIcon } from '@/components/ui/Icons'
import type { BilingualEntry } from '@/hooks/useSynaxarium'
import {
	getFontClass,
	getLineHeightClass,
	getTextSizeClasses,
	getWeightClass,
	getWordSpacingClass,
	themeClasses,
} from '@/lib/reading-styles'
import { useTranslations } from 'next-intl'

interface BilingualSynaxariumSectionProps {
	entries: BilingualEntry[]
	expandedEntry: string | null
	onExpandedChange: (id: string | null) => void
	textSize?: TextSize
	theme?: ReadingTheme
	fontFamily?: FontFamily
	weight?: FontWeight
	lineSpacing?: LineSpacing
	wordSpacing?: WordSpacing
}

export function BilingualSynaxariumSection({
	entries,
	expandedEntry,
	onExpandedChange,
	textSize = 'md',
	theme = 'light',
	fontFamily = 'serif',
	weight = 'normal',
	lineSpacing = 'normal',
	wordSpacing = 'normal',
}: BilingualSynaxariumSectionProps) {
	const t = useTranslations('synaxarium')

	// Get style classes for English (LTR)
	const enSizes = getTextSizeClasses(textSize, false)
	const enLineHeight = getLineHeightClass(lineSpacing, false)
	const enFontClass = getFontClass(fontFamily, false)
	const enWeightClass = getWeightClass(weight, false)
	const enWordSpacing = getWordSpacingClass(wordSpacing, false)

	// Get style classes for Arabic (RTL) - slightly smaller for synaxarium balance
	const arSizes = {
		sm: { chapter: 'text-lg', verse: 'text-xl', verseNum: 'text-sm' },
		md: { chapter: 'text-xl', verse: 'text-2xl', verseNum: 'text-base' },
		lg: { chapter: 'text-2xl', verse: 'text-3xl', verseNum: 'text-lg' },
	}[textSize]
	const arLineHeight = getLineHeightClass(lineSpacing, true)
	const arFontClass = getFontClass(fontFamily, true)
	const arWeightClass = getWeightClass(weight, true)
	const arWordSpacing = getWordSpacingClass(wordSpacing, true)

	// Title sizes based on textSize
	const titleSizes: Record<TextSize, string> = {
		sm: 'text-base',
		md: 'text-lg',
		lg: 'text-xl',
	}

	// Arabic title sizes - slightly larger for balance
	const arTitleSizes: Record<TextSize, string> = {
		sm: 'text-lg',
		md: 'text-xl',
		lg: 'text-2xl',
	}

	const borderClass = themeClasses.border[theme]

	return (
		<ul className="space-y-4">
			{entries.map((entry) => {
				const isExpanded = expandedEntry === entry.id
				const hasText = entry.en?.text || entry.ar?.text

				return (
					<li key={entry.id} className={`border-b ${borderClass} last:border-0 pb-4 last:pb-0`}>
						{/* Entry titles - side by side */}
						<button
							type="button"
							onClick={() => onExpandedChange(isExpanded ? null : entry.id)}
							className="w-full group"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
								{/* English title */}
								<div className="flex items-start gap-3 text-left">
									<ChevronRightIcon
										className={`w-5 h-5 mt-0.5 flex-shrink-0 ${themeClasses.muted[theme]} transition-transform duration-200 ${
											isExpanded ? 'rotate-90' : ''
										}`}
									/>
									<span
										className={`${titleSizes[textSize]} font-medium ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors`}
									>
										{entry.en?.name || (
											<span className={themeClasses.muted[theme]}>{t('noEnglish')}</span>
										)}
									</span>
								</div>

								{/* Arabic title */}
								<div className="text-right" dir="rtl">
									<span
										className={`${arTitleSizes[textSize]} font-medium ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors`}
									>
										{entry.ar?.name || (
											<span className={themeClasses.muted[theme]}>{t('noArabic')}</span>
										)}
									</span>
								</div>
							</div>
						</button>

						{/* Expanded content - side by side */}
						{isExpanded && hasText && (
							<div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
								<div
									className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0 rounded-lg overflow-hidden ${themeClasses.expandedBg[theme]}`}
								>
									{/* English text */}
									<div className={`p-4 md:border-r ${themeClasses.expandedBorder[theme]}`}>
										{entry.en?.text ? (
											<>
												<p
													className={`${enFontClass} ${enWeightClass} ${enWordSpacing} ${enSizes.verse} ${enLineHeight} ${themeClasses.text[theme]} whitespace-pre-line`}
												>
													{entry.en.text}
												</p>
												{entry.en.url && (
													<a
														href={entry.en.url}
														target="_blank"
														rel="noopener noreferrer"
														className={`inline-block mt-4 ${themeClasses.accent[theme]} hover:underline text-sm`}
													>
														{t('readOnCopticChurch')}
													</a>
												)}
											</>
										) : (
											<p className={`${themeClasses.muted[theme]} italic`}>{t('noEnglishText')}</p>
										)}
									</div>

									{/* Arabic text */}
									<div className="p-4 text-right" dir="rtl">
										{entry.ar?.text ? (
											<>
												<p
													className={`${arFontClass} ${arWeightClass} ${arWordSpacing} ${arSizes.verse} ${arLineHeight} ${themeClasses.text[theme]} whitespace-pre-line`}
												>
													{entry.ar.text}
												</p>
												{entry.ar.url && (
													<a
														href={entry.ar.url}
														target="_blank"
														rel="noopener noreferrer"
														className={`inline-block mt-4 ${themeClasses.accent[theme]} hover:underline text-sm`}
													>
														{t('readOnCopticChurch')}
													</a>
												)}
											</>
										) : (
											<p className={`${themeClasses.muted[theme]} italic`}>{t('noArabicText')}</p>
										)}
									</div>
								</div>
							</div>
						)}
					</li>
				)
			})}
		</ul>
	)
}
