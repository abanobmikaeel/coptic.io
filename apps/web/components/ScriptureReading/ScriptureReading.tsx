'use client'

import { getServiceName } from '@/i18n/content-translations'
import { getWidthClass } from '@/lib/reading-styles'
import { useState } from 'react'
import { MultiLanguageContent } from './MultiLanguageContent'
import { ReadingHeader } from './ReadingHeader'
import { SingleLanguageContent } from './SingleLanguageContent'
import type { ScriptureReadingProps } from './types'
import { getReferenceForLang, getStyleClasses, orderLanguages } from './utils'

export function ScriptureReading({
	readingsByLang,
	labels,
	languages,
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

	// Get available languages with data
	const availableLangs = languages.filter((lang) => readingsByLang[lang]?.length)
	const isMultiLang = availableLangs.length > 1

	// Get the first available language's readings for reference calculation
	const firstLang = availableLangs[0] || 'en'
	const firstReadings = readingsByLang[firstLang] || []

	// Order languages: English first, then other LTR, then Arabic (RTL) last
	const orderedLangs = orderLanguages(availableLangs)

	// Helper to get style classes for a language
	const getStyles = (lang: (typeof availableLangs)[number]) =>
		getStyleClasses(lang, textSize, lineSpacing, fontFamily, weight, wordSpacing)

	// Determine header style for single language
	const headerIsRtl = firstLang === 'ar'
	// Mobile uses full width, larger screens use max-width constraints
	const widthClass = isMultiLang
		? availableLangs.length >= 4
			? 'max-w-full sm:max-w-[90rem]' // Extra wide for 4 languages
			: availableLangs.length >= 3
				? 'max-w-full sm:max-w-7xl'
				: 'max-w-full sm:max-w-6xl'
		: getWidthClass(width)

	return (
		<article id={id} className={`scroll-mt-24 ${isOpen ? 'mb-8' : 'mb-3'}`}>
			{/* Clickable header - full width on mobile */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full group cursor-pointer -mx-3 sm:mx-0"
			>
				<div className={`${widthClass} sm:mx-auto`}>
					<ReadingHeader
						orderedLangs={isMultiLang ? orderedLangs : undefined}
						labels={isMultiLang ? labels : undefined}
						references={isMultiLang ? {
							en: getReferenceForLang('en', readingsByLang.en),
							ar: getReferenceForLang('ar', readingsByLang.ar),
							es: getReferenceForLang('es', readingsByLang.es),
							cop: getReferenceForLang('cop', readingsByLang.cop),
						} : undefined}
						title={!isMultiLang ? labels[firstLang as 'en' | 'ar'] : undefined}
						reference={!isMultiLang ? getReferenceForLang(firstLang, readingsByLang[firstLang]) : undefined}
						service={!isMultiLang && headerIsRtl ? (service ? getServiceName(service, 'ar') : undefined) : service}
						isOpen={isOpen}
						theme={theme}
						isRtl={!isMultiLang ? headerIsRtl : undefined}
					/>
				</div>
			</button>

			{/* Scripture content */}
			{isOpen &&
				(isMultiLang ? (
					<MultiLanguageContent
						orderedLangs={orderedLangs}
						readingsByLang={readingsByLang}
						firstReadings={firstReadings}
						getStyleClasses={getStyles}
						viewMode={viewMode}
						showVerses={showVerses}
						theme={theme}
					/>
				) : (
					availableLangs[0] && (
						<SingleLanguageContent
							lang={availableLangs[0]}
							readings={readingsByLang[availableLangs[0]] || []}
							styleClasses={getStyles(availableLangs[0])}
							viewMode={viewMode}
							showVerses={showVerses}
							theme={theme}
							width={width}
						/>
					)
				))}
		</article>
	)
}
