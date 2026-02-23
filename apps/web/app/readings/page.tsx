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
import { ReadingPageLayout } from '@/components/ReadingPageLayout'
import { ReadingProgress } from '@/components/ReadingProgress'
import { ReadingTimeline } from '@/components/ReadingTimeline'
import { ReadingsHeader } from '@/components/ReadingsHeader'
import { ScriptureReading } from '@/components/ScriptureReading'
import { SwipeableContainer } from '@/components/SwipeableContainer'
import { SynaxariumReading } from '@/components/SynaxariumReading'
import { NoReadingsState } from '@/components/ui/EmptyState'
import { API_BASE_URL } from '@/config'
import {
	CONTENT_LANGUAGES_COOKIE,
	type ContentLanguage,
	defaultContentLanguages,
	parseContentLanguages,
} from '@/i18n/content-languages'
import { getSectionLabels } from '@/i18n/content-translations'
import { getAvailableSections } from '@/lib/reading-sections'
import { themeClasses } from '@/lib/reading-styles'
import type { ReadingsData } from '@/lib/types'
import { formatGregorianDate, getTodayDateString, parseDateString } from '@/lib/utils'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
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

type BibleTranslation = 'en' | 'ar' | 'es' | 'cop'

// Languages that have API support for content
const supportedContentLanguages: ContentLanguage[] = ['en', 'ar', 'es', 'cop']

// All reading sections in display order
const readingSections = [
	'Prophecies',
	'Pauline',
	'Catholic',
	'Acts',
	'LPsalm',
	'LGospel',
	'VPsalm',
	'VGospel',
	'MPsalm',
	'MGospel',
	'EPPsalm',
	'EPGospel',
] as const
type ReadingSection = (typeof readingSections)[number]

async function getReadings(date?: string, lang?: string): Promise<ReadingsData | null> {
	try {
		const params = new URLSearchParams({ detailed: 'true' })
		if (lang && lang !== 'en') {
			params.set('lang', lang)
		}
		// Always send a date to ensure consistency with synaxarium page
		const effectiveDate = date || getTodayDateString()
		const endpoint = `${API_BASE_URL}/readings/${effectiveDate}?${params}`
		// Readings don't change - cache for 1 hour
		const res = await fetch(endpoint, { next: { revalidate: 300 } })
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

	// Read content languages from cookie
	const cookieStore = await cookies()
	const contentLangCookie = cookieStore.get(CONTENT_LANGUAGES_COOKIE)?.value
	const contentLanguages = parseContentLanguages(contentLangCookie)
	const selectedLanguages =
		contentLanguages.length > 0 ? contentLanguages : defaultContentLanguages.en

	// Filter to only languages the API supports
	const languagesToFetch = selectedLanguages.filter((lang) =>
		supportedContentLanguages.includes(lang),
	) as BibleTranslation[]

	// Parse display settings from URL
	const viewMode: ViewMode = params.view === 'verse' ? 'verse' : 'continuous'
	const showVerses = params.verses !== 'hide'
	const textSize: TextSize = (params.size as TextSize) || 'md'
	const fontFamily: FontFamily = (params.font as FontFamily) || 'sans'
	const lineSpacing: LineSpacing = (params.spacing as LineSpacing) || 'normal'
	const wordSpacing: WordSpacing = (params.wordSpacing as WordSpacing) || 'normal'
	const theme: ReadingTheme = (params.theme as ReadingTheme) || 'light'
	const width: ReadingWidth = (params.width as ReadingWidth) || 'normal'
	const fontWeight: FontWeight = (params.weight as FontWeight) || 'normal'

	// Fetch readings for all selected languages in parallel
	const readingsResults = await Promise.all(
		languagesToFetch.map(async (lang) => ({
			lang,
			data: await getReadings(params.date, lang === 'en' ? undefined : lang),
		})),
	)

	// Build a map of readings by language
	const readingsByLang: Record<BibleTranslation, ReadingsData | null> = {
		en: null,
		ar: null,
		es: null,
		cop: null,
	}
	for (const result of readingsResults) {
		readingsByLang[result.lang] = result.data
	}

	// Use the first available readings for metadata/structure
	const readings = readingsResults.find((r) => r.data)?.data ?? null

	// Build synaxarium entries by language for multi-language display
	// Only English and Arabic synaxarium are available
	const synaxariumLangs: BibleTranslation[] = ['en', 'ar']
	const synaxariumByLang: Partial<Record<BibleTranslation, ReadingsData['Synaxarium']>> = {}
	for (const lang of languagesToFetch.filter((l) => synaxariumLangs.includes(l))) {
		const langSynaxarium = readingsByLang[lang]?.Synaxarium
		if (langSynaxarium?.length) {
			synaxariumByLang[lang] = langSynaxarium
		}
	}

	const displayDate = params.date ? parseDateString(params.date) : new Date()
	const gregorianDate = formatGregorianDate(displayDate)
	const serverToday = getTodayDateString()
	const isToday = !params.date || params.date === serverToday

	// Preserve settings when navigating back to today
	const backToTodayParams = new URLSearchParams()
	for (const [key, value] of Object.entries(params)) {
		if (key !== 'date' && value) backToTodayParams.set(key, value)
	}
	const backToTodayQuery = backToTodayParams.toString()

	// Common props for all ScriptureReading components
	const scriptureProps = {
		viewMode,
		showVerses,
		textSize,
		fontFamily,
		lineSpacing,
		wordSpacing,
		theme,
		width,
		weight: fontWeight,
		languages: languagesToFetch,
	}

	// Render a scripture section if it has data in any language
	const renderSection = (key: ReadingSection, service?: string) => {
		// Check if any language has data for this section
		const hasAnyData = languagesToFetch.some((lang) => readingsByLang[lang]?.[key]?.length)
		if (!hasAnyData) return null

		// Build readings map for this section
		const readingsMap: Partial<Record<BibleTranslation, ReadingsData[ReadingSection]>> = {}
		for (const lang of languagesToFetch) {
			const data = readingsByLang[lang]?.[key]
			if (data?.length) {
				readingsMap[lang] = data
			}
		}

		const labels = getSectionLabels(key)
		return (
			<ScriptureReading
				key={key}
				id={`reading-${key}`}
				readingsByLang={readingsMap}
				labels={labels}
				service={service}
				{...scriptureProps}
			/>
		)
	}

	const stickyHeader = (
		<>
			<Suspense fallback={null}>
				<ReadingProgress />
			</Suspense>
			<ReadingsHeader
				theme={theme}
				sections={readings ? getAvailableSections(readings).mobileReadings : undefined}
			>
				{/* Date navigation - centered, with padding for settings button */}
				<div className="flex items-center gap-1.5 sm:gap-2 pr-10 sm:pr-12">
					<Suspense
						fallback={
							<span className="text-sm sm:text-base font-semibold">
								{readings?.fullDate?.dateString || gregorianDate}
							</span>
						}
					>
						<DateNavigation theme={theme}>
							<div className="text-center min-w-0">
								<h1 className="text-sm sm:text-base font-bold truncate">
									{readings?.fullDate?.dateString || gregorianDate}
								</h1>
								<p className={`text-[10px] sm:text-xs ${themeClasses.muted[theme]}`}>
									{readings?.seasonDay || (readings?.fullDate ? gregorianDate : '')}
								</p>
							</div>
						</DateNavigation>
					</Suspense>
					{!isToday && (
						<Link
							href={`/readings${backToTodayQuery ? `?${backToTodayQuery}` : ''}`}
							className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${themeClasses.pillBadge[theme]} hover:opacity-80`}
						>
							Today
						</Link>
					)}
				</div>

				{/* Display settings - absolute right */}
				<div className="absolute right-2 sm:right-4">
					<Suspense fallback={null}>
						<DisplaySettings />
					</Suspense>
				</div>
			</ReadingsHeader>
		</>
	)

	return (
		<ReadingPageLayout theme={theme} header={stickyHeader}>
			{readings ? (
				<Suspense fallback={<div className="px-3 sm:px-6 pt-4 pb-32 lg:pb-24" />}>
					<SwipeableContainer basePath="/readings" className="px-3 sm:px-6 pt-4 pb-32 lg:pb-24">
						{(() => {
							const ServiceDivider = ({ label }: { label: string }) => (
								<div className={'max-w-full sm:max-w-2xl mx-auto my-12'}>
									<div className="flex items-center gap-4">
										<div className={`flex-1 border-t ${themeClasses.border[theme]}`} />
										<span
											className={`text-xs font-semibold tracking-widest uppercase ${themeClasses.muted[theme]}`}
										>
											{label}
										</span>
										<div className={`flex-1 border-t ${themeClasses.border[theme]}`} />
									</div>
								</div>
							)

							const hasVespers = readings.VPsalm?.length || readings.VGospel?.length
							const hasMatins =
								readings.Prophecies?.length || readings.MPsalm?.length || readings.MGospel?.length

							return (
								<>
									{/* LITURGY */}
									{renderSection('Pauline', 'Liturgy')}
									{renderSection('Catholic', 'Liturgy')}
									{renderSection('Acts', 'Liturgy')}
									{Object.keys(synaxariumByLang).length > 0 ? (
										<SynaxariumReading
											entriesByLang={synaxariumByLang}
											languages={languagesToFetch.filter((l) => synaxariumLangs.includes(l))}
											textSize={textSize}
											theme={theme}
											width={width}
											service="Liturgy"
											fontFamily={fontFamily}
											weight={fontWeight}
											lineSpacing={lineSpacing}
											wordSpacing={wordSpacing}
										/>
									) : null}
									{renderSection('LPsalm', 'Liturgy')}
									{renderSection('LGospel', 'Liturgy')}

									{/* VESPERS */}
									{hasVespers && (
										<>
											<ServiceDivider label="Vespers" />
											{renderSection('VPsalm', 'Vespers')}
											{renderSection('VGospel', 'Vespers')}
										</>
									)}

									{/* MATINS */}
									{hasMatins && (
										<>
											<ServiceDivider label="Matins" />
											{renderSection('Prophecies', 'Matins')}
											{renderSection('MPsalm', 'Matins')}
											{renderSection('MGospel', 'Matins')}
										</>
									)}

									{/* EVENING PRAYER (Lent only) */}
									{readings.EPPsalm?.length || readings.EPGospel?.length ? (
										<>
											<ServiceDivider label="Evening Prayer" />
											{renderSection('EPPsalm' as ReadingSection, 'Evening Prayer')}
											{renderSection('EPGospel' as ReadingSection, 'Evening Prayer')}
										</>
									) : null}
								</>
							)
						})()}
					</SwipeableContainer>
				</Suspense>
			) : (
				<section className="px-3 sm:px-6 py-12">
					<NoReadingsState theme={theme} />
				</section>
			)}

			{/* Timeline navigation */}
			{readings && <ReadingTimeline sections={getAvailableSections(readings)} />}

			{/* Back to top */}
			<BackToTop />
		</ReadingPageLayout>
	)
}
