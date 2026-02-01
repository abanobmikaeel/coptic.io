'use client'

import {
	getFontClass,
	getLineHeightClass,
	getTextSizeClasses,
	getWeightClass,
	getWordSpacingClass,
	themeClasses,
} from '@/lib/reading-styles'
import { useState } from 'react'
import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	ReadingTheme,
	TextSize,
	WordSpacing,
} from './DisplaySettings'
import type { MidnightWatch } from './AgpeyaHourSelector'

// Types matching the new structured data format
export interface AgpeyaVerse {
	num: number
	text: string
}

export interface AgpeyaPsalm {
	title: string
	reference: string
	rubric?: string
	verses: AgpeyaVerse[]
}

export interface AgpeyaGospel {
	reference: string
	rubric?: string
	verses: AgpeyaVerse[]
}

export interface AgpeyaPrayerSection {
	title?: string
	content: string[]
	inline?: boolean
}

export interface AgpeyaLitany {
	title?: string
	content: string[]
}

// Watch data for midnight prayers
export interface AgpeyaWatchData {
	id: string
	name: string
	theme: string
	opening?: AgpeyaPrayerSection
	psalms: AgpeyaPsalm[]
	gospel?: AgpeyaGospel
	litanies?: AgpeyaLitany
	closing?: AgpeyaPrayerSection
}

// Standard hour data
export interface AgpeyaHourData {
	id: string
	name: string
	englishName: string
	traditionalTime: string
	introduction?: string
	opening: AgpeyaPrayerSection
	thanksgiving?: AgpeyaPrayerSection
	introductoryPsalm?: AgpeyaPsalm // Psalm 50 (51)
	psalmsIntro?: string // "From the Psalms of our father David..."
	psalms: AgpeyaPsalm[]
	alleluia?: AgpeyaPrayerSection
	gospel: AgpeyaGospel
	litanies: AgpeyaLitany
	lordsPrayer?: AgpeyaPrayerSection
	thanksgivingAfter?: AgpeyaPrayerSection
	closing: AgpeyaPrayerSection
}

// Midnight hour data with watches
export interface AgpeyaMidnightData {
	id: 'midnight'
	name: string
	englishName: string
	traditionalTime: string
	introduction?: string
	opening: AgpeyaPrayerSection
	thanksgiving?: AgpeyaPrayerSection
	introductoryPsalm?: AgpeyaPsalm // Psalm 50 (51)
	watches: AgpeyaWatchData[]
	closing: AgpeyaPrayerSection
}

// Type guard for midnight data
export function isMidnightData(
	data: AgpeyaHourData | AgpeyaMidnightData
): data is AgpeyaMidnightData {
	return data.id === 'midnight' && 'watches' in data
}

// Section IDs for navigation
export type SectionId =
	| 'introduction'
	| 'thanksgiving'
	| 'introductory-psalm'
	| 'psalms'
	| 'alleluia'
	| 'gospel'
	| 'litanies'
	| 'lords-prayer'
	| 'closing'

interface AgpeyaPrayerProps {
	hour: AgpeyaHourData | AgpeyaMidnightData
	currentWatch?: MidnightWatch
	isRtl: boolean
	textSize?: TextSize
	fontFamily?: FontFamily
	lineSpacing?: LineSpacing
	wordSpacing?: WordSpacing
	theme?: ReadingTheme
	weight?: FontWeight
}

export function AgpeyaPrayer({
	hour,
	currentWatch,
	isRtl,
	textSize = 'md',
	fontFamily = 'sans',
	lineSpacing = 'normal',
	wordSpacing = 'normal',
	theme = 'light',
	weight = 'normal',
}: AgpeyaPrayerProps) {
	const sizes = getTextSizeClasses(textSize, isRtl)
	const lineHeight = getLineHeightClass(lineSpacing, isRtl)
	const fontClass = getFontClass(fontFamily, isRtl)
	const weightClass = getWeightClass(weight, isRtl)
	const wordSpacingClass = getWordSpacingClass(wordSpacing, isRtl)

	const textStyles = `${fontClass} ${weightClass} ${wordSpacingClass} ${sizes.verse} ${lineHeight} ${themeClasses.text[theme]} ${isRtl ? 'text-right' : ''}`

	// Handle midnight prayers with watches
	if (isMidnightData(hour)) {
		const watchIndex = currentWatch ? parseInt(currentWatch, 10) - 1 : 0
		const watch = hour.watches[watchIndex]

		if (!watch) {
			return <div>Watch not found</div>
		}

		return (
			<div>
				{/* Hour title */}
				<div className="mb-8">
					<h1 className={`text-2xl font-bold ${themeClasses.textHeading[theme]}`}>
						{hour.name} - {watch.name}
					</h1>
					<p className={`text-sm ${themeClasses.muted[theme]}`}>{watch.theme}</p>
					{hour.introduction && (
						<p className={`text-sm italic ${themeClasses.muted[theme]} mt-3`}>
							{hour.introduction}
						</p>
					)}
				</div>

				{/* Watch content */}
				<div className="space-y-8">
					{/* Introduction/Opening */}
					<section id="section-introduction" className="scroll-mt-32">
						<InlinePrayer content={hour.opening.content} textStyles={textStyles} isRtl={isRtl} />
						{watch.opening && (
							<div className="mt-4">
								<InlinePrayer
									content={watch.opening.content}
									textStyles={textStyles}
									isRtl={isRtl}
								/>
							</div>
						)}
					</section>

					{/* Thanksgiving (shared across watches) */}
					{hour.thanksgiving && (
						<section id="section-thanksgiving" className="scroll-mt-32">
							<CollapsibleSection
								title={hour.thanksgiving.title || 'Thanksgiving'}
								theme={theme}
								defaultOpen
							>
								<InlinePrayer
									content={hour.thanksgiving.content}
									textStyles={textStyles}
									isRtl={isRtl}
								/>
							</CollapsibleSection>
						</section>
					)}

					{/* Introductory Psalm 50 (51) - shared across watches */}
					{hour.introductoryPsalm && (
						<section id="section-introductory-psalm" className="scroll-mt-32">
							<CollapsibleSection
								title={hour.introductoryPsalm.title || 'Psalm 50'}
								subtitle={hour.introductoryPsalm.reference}
								theme={theme}
								defaultOpen
							>
								<PsalmContent
									psalm={hour.introductoryPsalm}
									textStyles={textStyles}
									sizes={sizes}
									theme={theme}
									isRtl={isRtl}
								/>
							</CollapsibleSection>
						</section>
					)}

					{/* Psalms */}
					<section id="section-psalms" className="scroll-mt-32">
						<CollapsibleSection
							title="Psalms"
							subtitle={`(${watch.psalms.length})`}
							theme={theme}
							defaultOpen
						>
							<div className="space-y-6">
								{watch.psalms.map((psalm, idx) => (
									<PsalmContent
										key={idx}
										psalm={psalm}
										textStyles={textStyles}
										sizes={sizes}
										theme={theme}
										isRtl={isRtl}
									/>
								))}
							</div>
						</CollapsibleSection>
					</section>

					{/* Gospel */}
					{watch.gospel && (
						<section id="section-gospel" className="scroll-mt-32">
							<CollapsibleSection
								title="Gospel"
								subtitle={watch.gospel.reference}
								theme={theme}
								defaultOpen
							>
								<GospelContent
									gospel={watch.gospel}
									textStyles={textStyles}
									sizes={sizes}
									theme={theme}
									isRtl={isRtl}
								/>
							</CollapsibleSection>
						</section>
					)}

					{/* Litanies */}
					{watch.litanies && (
						<section id="section-litanies" className="scroll-mt-32">
							<CollapsibleSection title="Litanies" theme={theme} defaultOpen>
								<InlinePrayer
									content={watch.litanies.content}
									textStyles={textStyles}
									isRtl={isRtl}
								/>
							</CollapsibleSection>
						</section>
					)}

					{/* Watch closing */}
					{watch.closing && (
						<section id="section-closing" className="scroll-mt-32">
							<CollapsibleSection title="Closing Prayer" theme={theme} defaultOpen>
								<InlinePrayer
									content={watch.closing.content}
									textStyles={textStyles}
									isRtl={isRtl}
								/>
							</CollapsibleSection>
						</section>
					)}
				</div>
			</div>
		)
	}

	// Standard hour rendering
	return (
		<div>
			{/* Hour title */}
			<div className="mb-8">
				<h1 className={`text-2xl font-bold ${themeClasses.textHeading[theme]}`}>{hour.name}</h1>
				<p className={`text-sm ${themeClasses.muted[theme]}`}>{hour.englishName}</p>
				{hour.introduction && (
					<p className={`text-sm italic ${themeClasses.muted[theme]} mt-3`}>{hour.introduction}</p>
				)}
			</div>

			{/* Prayer content */}
			<div className="space-y-8">
				{/* Introduction/Opening - inline (no header) */}
				<section id="section-introduction" className="scroll-mt-32">
					<InlinePrayer content={hour.opening.content} textStyles={textStyles} isRtl={isRtl} />
				</section>

				{/* Thanksgiving (if exists and not inline) */}
				{hour.thanksgiving && !hour.thanksgiving.inline && (
					<section id="section-thanksgiving" className="scroll-mt-32">
						<CollapsibleSection
							title={hour.thanksgiving.title || 'Thanksgiving'}
							theme={theme}
							defaultOpen
						>
							<InlinePrayer
								content={hour.thanksgiving.content}
								textStyles={textStyles}
								isRtl={isRtl}
							/>
						</CollapsibleSection>
					</section>
				)}
				{hour.thanksgiving?.inline && (
					<section id="section-thanksgiving" className="scroll-mt-32">
						<InlinePrayer content={hour.thanksgiving.content} textStyles={textStyles} isRtl={isRtl} />
					</section>
				)}

				{/* Introductory Psalm 50 (51) - prayed at every hour */}
				{hour.introductoryPsalm && (
					<section id="section-introductory-psalm" className="scroll-mt-32">
						<CollapsibleSection
							title={hour.introductoryPsalm.title || 'Psalm 50'}
							subtitle={hour.introductoryPsalm.reference}
							theme={theme}
							defaultOpen
						>
							<PsalmContent
								psalm={hour.introductoryPsalm}
								textStyles={textStyles}
								sizes={sizes}
								theme={theme}
								isRtl={isRtl}
							/>
						</CollapsibleSection>
					</section>
				)}

				{/* Psalms - grouped under single collapsible header */}
				<section id="section-psalms" className="scroll-mt-32">
					{/* Psalms intro rubric */}
					{hour.psalmsIntro && (
						<p className={`text-sm italic mb-4 ${themeClasses.muted[theme]}`}>
							{hour.psalmsIntro}
						</p>
					)}
					<CollapsibleSection
						title="Psalms"
						subtitle={`(${hour.psalms.length})`}
						theme={theme}
						defaultOpen
					>
						<div className="space-y-6">
							{hour.psalms.map((psalm, idx) => (
								<PsalmContent
									key={idx}
									psalm={psalm}
									textStyles={textStyles}
									sizes={sizes}
									theme={theme}
									isRtl={isRtl}
								/>
							))}
						</div>
					</CollapsibleSection>
				</section>

				{/* Alleluia - inline (no header) */}
				{hour.alleluia && (
					<section id="section-alleluia" className="scroll-mt-32">
						<InlinePrayer content={hour.alleluia.content} textStyles={textStyles} isRtl={isRtl} />
					</section>
				)}

				{/* Gospel - major section with collapsible header */}
				<section id="section-gospel" className="scroll-mt-32">
					<CollapsibleSection
						title="Gospel"
						subtitle={hour.gospel.reference}
						theme={theme}
						defaultOpen
					>
						<GospelContent
							gospel={hour.gospel}
							textStyles={textStyles}
							sizes={sizes}
							theme={theme}
							isRtl={isRtl}
						/>
					</CollapsibleSection>
				</section>

				{/* Litanies - major section with collapsible header */}
				<section id="section-litanies" className="scroll-mt-32">
					<CollapsibleSection title="Litanies" theme={theme} defaultOpen>
						<InlinePrayer content={hour.litanies.content} textStyles={textStyles} isRtl={isRtl} />
					</CollapsibleSection>
				</section>

				{/* Lord's Prayer - inline (no header) */}
				{hour.lordsPrayer && (
					<section id="section-lords-prayer" className="scroll-mt-32">
						<InlinePrayer content={hour.lordsPrayer.content} textStyles={textStyles} isRtl={isRtl} />
					</section>
				)}

				{/* Thanksgiving After (if exists and not inline) */}
				{hour.thanksgivingAfter && !hour.thanksgivingAfter.inline && (
					<CollapsibleSection
						title={hour.thanksgivingAfter.title || 'Prayer of Thanksgiving'}
						theme={theme}
						defaultOpen
					>
						<InlinePrayer
							content={hour.thanksgivingAfter.content}
							textStyles={textStyles}
							isRtl={isRtl}
						/>
					</CollapsibleSection>
				)}
				{hour.thanksgivingAfter?.inline && (
					<InlinePrayer
						content={hour.thanksgivingAfter.content}
						textStyles={textStyles}
						isRtl={isRtl}
					/>
				)}

				{/* Closing Prayer */}
				<section id="section-closing" className="scroll-mt-32">
					{hour.closing.inline ? (
						<InlinePrayer content={hour.closing.content} textStyles={textStyles} isRtl={isRtl} />
					) : (
						<CollapsibleSection title="Closing Prayer" theme={theme} defaultOpen>
							<InlinePrayer content={hour.closing.content} textStyles={textStyles} isRtl={isRtl} />
						</CollapsibleSection>
					)}
				</section>
			</div>
		</div>
	)
}

// Inline prayer content - flows naturally without any header
function InlinePrayer({
	content,
	textStyles,
	isRtl,
}: {
	content: string[]
	textStyles: string
	isRtl: boolean
}) {
	return (
		<div className={`space-y-4 ${textStyles}`} dir={isRtl ? 'rtl' : 'ltr'}>
			{content.map((paragraph, idx) => (
				<p key={idx}>{paragraph}</p>
			))}
		</div>
	)
}

// Collapsible section for major content (Psalms, Gospel, Litanies)
function CollapsibleSection({
	title,
	subtitle,
	theme = 'light',
	defaultOpen = true,
	children,
}: {
	title: string
	subtitle?: string
	theme?: ReadingTheme
	defaultOpen?: boolean
	children: React.ReactNode
}) {
	const [isOpen, setIsOpen] = useState(defaultOpen)

	return (
		<article>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full group cursor-pointer"
			>
				<div
					className={`flex items-center justify-between py-4 pl-4 pr-4 border-l-4 border-amber-500/60 transition-all ${themeClasses.cardBg[theme]}`}
				>
					<div className="text-left">
						<h2
							className={`text-base font-semibold uppercase tracking-wide ${themeClasses.muted[theme]}`}
						>
							{title}
							{subtitle && (
								<span className="ml-2 text-sm font-normal normal-case tracking-normal">
									{subtitle}
								</span>
							)}
						</h2>
					</div>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						className={`${themeClasses.muted[theme]} transition-transform flex-shrink-0 ${isOpen ? '' : '-rotate-90'}`}
						aria-hidden="true"
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</div>
			</button>

			{isOpen && <div className="mt-6">{children}</div>}
		</article>
	)
}

// Psalm content with title and verses - individually collapsible
function PsalmContent({
	psalm,
	textStyles,
	sizes,
	theme,
	isRtl,
	defaultOpen = true,
}: {
	psalm: AgpeyaPsalm
	textStyles: string
	sizes: ReturnType<typeof getTextSizeClasses>
	theme: ReadingTheme
	isRtl: boolean
	defaultOpen?: boolean
}) {
	const [isOpen, setIsOpen] = useState(defaultOpen)

	return (
		<div dir={isRtl ? 'rtl' : 'ltr'}>
			{/* Psalm header - clickable to collapse */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={'w-full text-left flex items-center justify-between group cursor-pointer py-2'}
			>
				<div>
					<span className={`font-medium ${themeClasses.text[theme]}`}>{psalm.title}</span>
					<span className={`text-sm ${themeClasses.muted[theme]} ml-2`}>{psalm.reference}</span>
					{psalm.rubric && (
						<span className={`text-sm italic ${themeClasses.muted[theme]} ml-2`}>
							— {psalm.rubric}
						</span>
					)}
				</div>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					className={`${themeClasses.muted[theme]} transition-transform flex-shrink-0 ml-4 ${isOpen ? '' : '-rotate-90'}`}
					aria-hidden="true"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</button>

			{/* Verses - collapsible */}
			{isOpen && (
				<div
					className={`space-y-4 ${textStyles} ${isRtl ? 'text-right' : ''}`}
					dir={isRtl ? 'rtl' : 'ltr'}
				>
					{psalm.verses.map((verse) => (
						<p key={verse.num}>
							<span
								className={`${themeClasses.accent[theme]} ${sizes.verseNum} font-normal tabular-nums ${isRtl ? 'ml-2' : 'mr-2'}`}
							>
								{verse.num}
							</span>
							{verse.text}
						</p>
					))}
				</div>
			)}
		</div>
	)
}

// Gospel content with rubric and verses
function GospelContent({
	gospel,
	textStyles,
	sizes,
	theme,
	isRtl,
}: {
	gospel: AgpeyaGospel
	textStyles: string
	sizes: ReturnType<typeof getTextSizeClasses>
	theme: ReadingTheme
	isRtl: boolean
}) {
	return (
		<div dir={isRtl ? 'rtl' : 'ltr'}>
			{/* Rubric */}
			{gospel.rubric && (
				<p className={`text-sm italic mb-6 ${themeClasses.muted[theme]}`}>{gospel.rubric}</p>
			)}

			{/* Verses */}
			<div
				className={`space-y-4 ${textStyles} ${isRtl ? 'text-right' : ''}`}
				dir={isRtl ? 'rtl' : 'ltr'}
			>
				{gospel.verses.map((verse) => (
					<p key={verse.num}>
						<span
							className={`${themeClasses.accent[theme]} ${sizes.verseNum} font-normal tabular-nums ${isRtl ? 'ml-2' : 'mr-2'}`}
						>
							{verse.num}
						</span>
						{verse.text}
					</p>
				))}
			</div>
		</div>
	)
}
