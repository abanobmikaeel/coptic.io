import { BackToTop } from '@/components/BackToTop'
import { DateNavigation } from '@/components/DateNavigation'
import { DisplaySettings } from '@/components/DisplaySettings'
import { ReadingPageLayout } from '@/components/ReadingPageLayout'
import { ReadingProgress } from '@/components/ReadingProgress'
import { ReadingTimeline } from '@/components/ReadingTimeline'
import { ReadingsHeader } from '@/components/ReadingsHeader'
import { ScriptureReading } from '@/components/ScriptureReading'
import { ServiceDivider } from '@/components/ServiceDivider'
import { SwipeableContainer } from '@/components/SwipeableContainer'
import { SynaxariumReading } from '@/components/SynaxariumReading'
import { NoReadingsState } from '@/components/ui/EmptyState'
import { API_BASE_URL } from '@/config'
import type { ContentLanguage } from '@/i18n/content-languages'
import { getSectionLabels } from '@/i18n/content-translations'
import { parseDisplaySettings, resolveContentLanguages, resolveTheme } from '@/lib/display-settings'
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

const supportedContentLanguages: ContentLanguage[] = ['en', 'ar', 'es', 'cop']

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
		if (lang && lang !== 'en') params.set('lang', lang)
		const effectiveDate = date || getTodayDateString()
		const res = await fetch(`${API_BASE_URL}/readings/${effectiveDate}?${params}`, {
			next: { revalidate: 300 },
		})
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

	const cookieStore = await cookies()
	const themeFallback = resolveTheme(cookieStore)
	const languagesToFetch = resolveContentLanguages(
		cookieStore,
		supportedContentLanguages,
	) as BibleTranslation[]

	const {
		viewMode,
		showVerses,
		textSize,
		fontFamily,
		lineSpacing,
		wordSpacing,
		theme,
		width,
		fontWeight,
	} = parseDisplaySettings(params, themeFallback)

	const readingsResults = await Promise.all(
		languagesToFetch.map(async (lang) => ({
			lang,
			data: await getReadings(params.date, lang === 'en' ? undefined : lang),
		})),
	)

	const readingsByLang: Record<BibleTranslation, ReadingsData | null> = {
		en: null,
		ar: null,
		es: null,
		cop: null,
	}
	for (const result of readingsResults) {
		readingsByLang[result.lang] = result.data
	}

	const readings = readingsResults.find((r) => r.data)?.data ?? null

	const synaxariumLangs: BibleTranslation[] = ['en', 'ar']
	const synaxariumByLang: Partial<Record<BibleTranslation, ReadingsData['Synaxarium']>> = {}
	for (const lang of languagesToFetch.filter((l) => synaxariumLangs.includes(l))) {
		const langSynaxarium = readingsByLang[lang]?.Synaxarium
		if (langSynaxarium?.length) synaxariumByLang[lang] = langSynaxarium
	}

	const displayDate = params.date ? parseDateString(params.date) : new Date()
	const gregorianDate = formatGregorianDate(displayDate)
	const isToday = !params.date || params.date === getTodayDateString()

	const backToTodayParams = new URLSearchParams()
	for (const [key, value] of Object.entries(params)) {
		if (key !== 'date' && value) backToTodayParams.set(key, value)
	}
	const backToTodayQuery = backToTodayParams.toString()

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

	const renderSection = (key: ReadingSection, service?: string) => {
		const hasAnyData = languagesToFetch.some((lang) => readingsByLang[lang]?.[key]?.length)
		if (!hasAnyData) return null

		const readingsMap: Partial<Record<BibleTranslation, ReadingsData[ReadingSection]>> = {}
		for (const lang of languagesToFetch) {
			const data = readingsByLang[lang]?.[key]
			if (data?.length) readingsMap[lang] = data
		}

		return (
			<ScriptureReading
				key={key}
				id={`reading-${key}`}
				readingsByLang={readingsMap}
				labels={getSectionLabels(key)}
				service={service}
				{...scriptureProps}
			/>
		)
	}

	const hasVespers = readings?.VPsalm?.length || readings?.VGospel?.length
	const hasMatins =
		readings?.Prophecies?.length || readings?.MPsalm?.length || readings?.MGospel?.length
	const hasEveningPrayer = readings?.EPPsalm?.length || readings?.EPGospel?.length

	const stickyHeader = (
		<>
			<Suspense fallback={null}>
				<ReadingProgress />
			</Suspense>
			<ReadingsHeader
				theme={theme}
				sections={readings ? getAvailableSections(readings).mobileReadings : undefined}
			>
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
						{hasVespers ? (
							<>
								<ServiceDivider label="Vespers" theme={theme} />
								{renderSection('VPsalm', 'Vespers')}
								{renderSection('VGospel', 'Vespers')}
							</>
						) : null}

						{/* MATINS */}
						{hasMatins ? (
							<>
								<ServiceDivider label="Matins" theme={theme} />
								{renderSection('Prophecies', 'Matins')}
								{renderSection('MPsalm', 'Matins')}
								{renderSection('MGospel', 'Matins')}
							</>
						) : null}

						{/* EVENING PRAYER (Lent only) */}
						{hasEveningPrayer ? (
							<>
								<ServiceDivider label="Evening Prayer" theme={theme} />
								{renderSection('EPPsalm' as ReadingSection, 'Evening Prayer')}
								{renderSection('EPGospel' as ReadingSection, 'Evening Prayer')}
							</>
						) : null}
					</SwipeableContainer>
				</Suspense>
			) : (
				<section className="px-3 sm:px-6 py-12">
					<NoReadingsState theme={theme} />
				</section>
			)}

			{readings && <ReadingTimeline sections={getAvailableSections(readings)} />}
			<BackToTop />
		</ReadingPageLayout>
	)
}
