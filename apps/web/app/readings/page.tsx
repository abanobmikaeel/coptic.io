import { BackToTop } from '@/components/BackToTop'
import { DateNavigation } from '@/components/DateNavigation'
import {
	DisplaySettings,
	type FontFamily,
	type FontWeight,
	type LineSpacing,
	type ReadingTheme,
	type ReadingWidth,
	type TextSize,
	type ViewMode,
	type WordSpacing,
} from '@/components/DisplaySettings'
import { ReadingProgress } from '@/components/ReadingProgress'
import { ReadingTimeline } from '@/components/ReadingTimeline'
import { ScriptureReading } from '@/components/ScriptureReading'
import { SynaxariumReading } from '@/components/SynaxariumReading'
import { API_BASE_URL } from '@/config'
import { themeClasses } from '@/lib/reading-styles'
import type { ReadingsData } from '@/lib/types'
import { formatGregorianDate, getTodayDateString, parseDateString } from '@/lib/utils'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

export const metadata: Metadata = {
	title: 'Daily Readings',
	description:
		'Daily scripture readings from the Coptic Orthodox Katameros including Pauline Epistles, Catholic Epistles, Acts, Psalms, and Gospel readings.',
	openGraph: {
		title: 'Daily Readings | Coptic Calendar',
		description:
			'Daily scripture readings from the Coptic Orthodox Katameros including Pauline Epistles, Catholic Epistles, Acts, Psalms, and Gospel readings.',
	},
}

type BibleTranslation = 'en' | 'ar'

const sectionLabels: Record<string, string> = {
	VPsalm: 'Vespers Psalm',
	VGospel: 'Vespers Gospel',
	MPsalm: 'Matins Psalm',
	MGospel: 'Matins Gospel',
	Pauline: 'Pauline Epistle',
	Catholic: 'Catholic Epistle',
	Acts: 'Acts of the Apostles',
	LPsalm: 'Psalm',
	LGospel: 'Gospel',
}

// All reading sections in display order
const readingSections = [
	'Pauline',
	'Catholic',
	'Acts',
	'LPsalm',
	'LGospel',
	'VPsalm',
	'VGospel',
	'MPsalm',
	'MGospel',
] as const
type ReadingSection = (typeof readingSections)[number]

async function getReadings(date?: string, lang?: string): Promise<ReadingsData | null> {
	try {
		const params = new URLSearchParams({ detailed: 'true' })
		if (lang && lang !== 'en') {
			params.set('lang', lang)
		}
		const endpoint = date
			? `${API_BASE_URL}/readings/${date}?${params}`
			: `${API_BASE_URL}/readings?${params}`
		const res = await fetch(endpoint, { cache: 'no-store' })
		if (!res.ok) return null
		return res.json()
	} catch {
		return null
	}
}

interface ReadingsPageProps {
	searchParams: Promise<{
		date?: string
		lang?: string
		view?: string
		verses?: string
		size?: string
		font?: string
		spacing?: string
		wordSpacing?: string
		theme?: string
		width?: string
		weight?: string
	}>
}

export default async function ReadingsPage({ searchParams }: ReadingsPageProps) {
	const params = await searchParams

	// Parse display settings from URL
	const translation: BibleTranslation = params.lang === 'ar' ? 'ar' : 'en'
	const viewMode: ViewMode = params.view === 'continuous' ? 'continuous' : 'verse'
	const showVerses = params.verses !== 'hide'
	const textSize: TextSize = (params.size as TextSize) || 'md'
	const fontFamily: FontFamily = (params.font as FontFamily) || 'sans'
	const lineSpacing: LineSpacing = (params.spacing as LineSpacing) || 'normal'
	const wordSpacing: WordSpacing = (params.wordSpacing as WordSpacing) || 'normal'
	const theme: ReadingTheme = (params.theme as ReadingTheme) || 'light'
	const width: ReadingWidth = (params.width as ReadingWidth) || 'normal'
	const fontWeight: FontWeight = (params.weight as FontWeight) || 'normal'
	const isRtl = translation === 'ar'

	const readings = await getReadings(params.date, params.lang)

	const displayDate = params.date ? parseDateString(params.date) : new Date()
	const gregorianDate = formatGregorianDate(displayDate)
	const isToday = !params.date || params.date === getTodayDateString()

	// Preserve settings when navigating back to today
	const backToTodayParams = new URLSearchParams()
	for (const [key, value] of Object.entries(params)) {
		if (key !== 'date' && value) backToTodayParams.set(key, value)
	}
	const backToTodayQuery = backToTodayParams.toString()

	// Common props for all ScriptureReading components
	const scriptureProps = {
		isRtl,
		viewMode,
		showVerses,
		textSize,
		fontFamily,
		lineSpacing,
		wordSpacing,
		theme,
		width,
		weight: fontWeight,
	}

	// Render a scripture section if it has data
	const renderSection = (key: ReadingSection, service?: string) => {
		const data = readings?.[key]
		if (!data?.length) return null
		return (
			<ScriptureReading
				key={key}
				id={`reading-${key}`}
				readings={data}
				title={sectionLabels[key]}
				service={service}
				{...scriptureProps}
			/>
		)
	}

	return (
		<main
			className={`min-h-screen ${themeClasses.bg[theme]} ${themeClasses.textHeading[theme]} transition-colors duration-300`}
		>
			{/* Progress indicator */}
			<Suspense fallback={null}>
				<ReadingProgress />
			</Suspense>

			{/* Sticky header bar with date and settings */}
			<div
				className={`sticky top-14 z-30 ${themeClasses.bgTranslucent[theme]} backdrop-blur-sm border-b ${themeClasses.border[theme]}`}
			>
				<div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center relative">
					{/* Date navigation - centered */}
					<div className="flex items-center gap-3">
						<Suspense
							fallback={
								<span className="text-xl font-semibold">
									{readings?.fullDate?.dateString || gregorianDate}
								</span>
							}
						>
							<DateNavigation theme={theme}>
								<div className="text-center">
									<h1 className="text-xl font-bold">
										{readings?.fullDate?.dateString || gregorianDate}
									</h1>
									<p
										className={`text-xs ${theme === 'sepia' ? 'text-[#8b7355]' : 'text-gray-500 dark:text-gray-400'}`}
									>
										{readings?.fullDate ? gregorianDate : ''}
									</p>
								</div>
							</DateNavigation>
						</Suspense>
						{!isToday && (
							<Link
								href={`/readings${backToTodayQuery ? `?${backToTodayQuery}` : ''}`}
								className={`text-xs px-2 py-1 rounded-full ${theme === 'sepia' ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'} hover:opacity-80`}
							>
								Today
							</Link>
						)}
					</div>

					{/* Display settings - absolute right */}
					<div className="absolute right-6">
						<Suspense fallback={null}>
							<DisplaySettings />
						</Suspense>
					</div>
				</div>
			</div>

			{readings ? (
				<div className="px-6 pt-10 pb-32 lg:pb-24">
					{(() => {
						const ServiceDivider = () => (
							<div className={'max-w-2xl mx-auto px-4 my-8'}>
								<div className={`border-t ${themeClasses.border[theme]}`} />
							</div>
						)

						const hasVespers = readings.VPsalm?.length || readings.VGospel?.length
						const hasMatins = readings.MPsalm?.length || readings.MGospel?.length

						return (
							<>
								{/* LITURGY */}
								{renderSection('Pauline', 'Liturgy')}
								{renderSection('Catholic', 'Liturgy')}
								{renderSection('Acts', 'Liturgy')}
								{readings.Synxarium?.length ? (
									<SynaxariumReading
										entries={readings.Synxarium}
										textSize={textSize}
										theme={theme}
										width={width}
										service="Liturgy"
									/>
								) : null}
								{renderSection('LPsalm', 'Liturgy')}
								{renderSection('LGospel', 'Liturgy')}

								{/* VESPERS */}
								{hasVespers && (
									<>
										<ServiceDivider />
										{renderSection('VPsalm', 'Vespers')}
										{renderSection('VGospel', 'Vespers')}
									</>
								)}

								{/* MATINS */}
								{hasMatins && (
									<>
										<ServiceDivider />
										{renderSection('MPsalm', 'Matins')}
										{renderSection('MGospel', 'Matins')}
									</>
								)}
							</>
						)
					})()}
				</div>
			) : (
				<section className="px-6 py-24 text-center">
					<p className={theme === 'sepia' ? 'text-[#8b7355]' : 'text-gray-500 dark:text-gray-400'}>
						Unable to load readings. Please try again later.
					</p>
				</section>
			)}

			{/* Timeline navigation */}
			{readings && <ReadingTimeline readings={readings} />}

			{/* Back to top */}
			<BackToTop />
		</main>
	)
}
