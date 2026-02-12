'use client'

import {
	getFontClass,
	getLineHeightClass,
	getTextSizeClasses,
	getWeightClass,
	getWordSpacingClass,
	themeClasses,
} from '@/lib/reading-styles'
import type { SynaxariumEntry } from '@/lib/types'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	ReadingTheme,
	TextSize,
	WordSpacing,
} from './DisplaySettings'
import { ChevronRightIcon } from './ui/Icons'

interface SynaxariumSectionProps {
	entries: SynaxariumEntry[]
	textSize?: TextSize
	theme?: ReadingTheme
	initialExpanded?: number | null
	fontFamily?: FontFamily
	weight?: FontWeight
	lineSpacing?: LineSpacing
	wordSpacing?: WordSpacing
	isRtl?: boolean
}

export function SynaxariumSection({
	entries,
	textSize = 'md',
	theme = 'light',
	initialExpanded = null,
	fontFamily = 'serif',
	weight = 'normal',
	lineSpacing = 'normal',
	wordSpacing = 'normal',
	isRtl = false,
}: SynaxariumSectionProps) {
	const t = useTranslations('synaxarium')
	const [expanded, setExpanded] = useState<number | null>(initialExpanded)

	// Get style classes similar to ScriptureReading
	const sizes = getTextSizeClasses(textSize, isRtl)
	const lineHeightClass = getLineHeightClass(lineSpacing, isRtl)
	const fontClass = getFontClass(fontFamily, isRtl)
	const weightClass = getWeightClass(weight, isRtl)
	const wordSpacingClass = getWordSpacingClass(wordSpacing, isRtl)

	// Title sizes based on textSize
	const titleSizes: Record<TextSize, string> = {
		sm: 'text-base',
		md: 'text-lg',
		lg: 'text-xl',
	}

	const borderClass = themeClasses.border[theme]

	return (
		<ul className="space-y-4">
			{entries.map((entry, idx) => (
				<li key={idx} className={`border-b ${borderClass} last:border-0 pb-4 last:pb-0`}>
					<button
						type="button"
						onClick={() => setExpanded(expanded === idx ? null : idx)}
						className="w-full flex items-start gap-3 text-left group"
						dir={isRtl ? 'rtl' : 'ltr'}
					>
						<ChevronRightIcon
							className={`w-5 h-5 mt-0.5 flex-shrink-0 ${themeClasses.muted[theme]} transition-transform duration-200 ${
								expanded === idx ? 'rotate-90' : ''
							} ${isRtl ? 'rotate-180' : ''} ${expanded === idx && isRtl ? '-rotate-90' : ''}`}
						/>
						<span
							className={`${titleSizes[textSize]} font-medium ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors`}
						>
							{entry.name}
						</span>
					</button>

					{expanded === idx && entry.text && (
						<div
							className={`mt-4 ${isRtl ? 'me-8' : 'ms-8'} animate-in fade-in slide-in-from-top-2 duration-200`}
							dir={isRtl ? 'rtl' : 'ltr'}
						>
							<p
								className={`${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeightClass} ${themeClasses.text[theme]} whitespace-pre-line`}
							>
								{entry.text}
							</p>
							{entry.url && (
								<a
									href={entry.url}
									target="_blank"
									rel="noopener noreferrer"
									className={`block mt-4 ${themeClasses.accent[theme]} hover:underline text-sm`}
								>
									{t('readOnCopticChurch')}
								</a>
							)}
						</div>
					)}
				</li>
			))}
		</ul>
	)
}
