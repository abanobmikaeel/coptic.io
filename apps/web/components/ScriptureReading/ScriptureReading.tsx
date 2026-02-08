'use client'

import { getServiceName } from '@/i18n/content-translations'
import { getWidthClass } from '@/lib/reading-styles'
import { useState } from 'react'
import { LtrHeader } from './LtrHeader'
import { MultiLangHeader } from './MultiLangHeader'
import { MultiLanguageContent } from './MultiLanguageContent'
import { RtlHeader } from './RtlHeader'
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
	const widthClass = isMultiLang
		? availableLangs.length >= 3
			? 'max-w-7xl'
			: 'max-w-6xl'
		: getWidthClass(width)

	return (
		<article id={id} className={`scroll-mt-24 ${isOpen ? 'mb-12' : 'mb-4'}`}>
			{/* Clickable header */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full group cursor-pointer"
			>
				<div className={`${widthClass} mx-auto px-4`}>
					{isMultiLang ? (
						<MultiLangHeader
							orderedLangs={orderedLangs}
							labels={labels}
							references={{
								en: getReferenceForLang('en', readingsByLang.en),
								ar: getReferenceForLang('ar', readingsByLang.ar),
								es: getReferenceForLang('es', readingsByLang.es),
							}}
							service={service}
							isOpen={isOpen}
							theme={theme}
						/>
					) : headerIsRtl ? (
						<RtlHeader
							title={labels.ar}
							reference={getReferenceForLang('ar', readingsByLang.ar)}
							service={service ? getServiceName(service, 'ar') : undefined}
							isOpen={isOpen}
							theme={theme}
						/>
					) : (
						<LtrHeader
							title={labels.en}
							reference={getReferenceForLang('en', readingsByLang.en)}
							service={service}
							isOpen={isOpen}
							theme={theme}
						/>
					)}
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
