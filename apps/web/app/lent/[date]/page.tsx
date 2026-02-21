import { BackToTop } from '@/components/BackToTop'
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
import { ReadingsHeader } from '@/components/ReadingsHeader'
import { ScriptureReading } from '@/components/ScriptureReading'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons'
import { API_BASE_URL } from '@/config'
import type { ContentLang } from '@/i18n/content-translations'
import { themeClasses } from '@/lib/reading-styles'
import type { Reading } from '@/lib/types'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { LentSwipeContainer } from './LentSwipeContainer'

type BibleTranslation = 'en' | 'ar'

interface Sermon {
	title: string
	preacher?: string
	youtubeUrl: string
	thumbnail?: string
}

interface ResolvedReference {
	reference: string
	readings: Reading[] | null
}

interface DevotionalResponse {
	dayOffset: number
	dayNumber: number
	part: string
	weekNumber: number
	weekTheme: string
	day: string
	title: string
	references: string[]
	date: string
	sermons?: Sermon[]
	sundayHolyGospelReading?: string
	resolvedReferences?: ResolvedReference[]
}

interface ScheduleDay {
	dayNumber: number
	date: string
	title: string
}

interface ScheduleResponse {
	days: ScheduleDay[]
}

async function getDevotional(
	date: string,
	lang?: string,
): Promise<DevotionalResponse | null> {
	try {
		const params = new URLSearchParams({ detailed: 'true' })
		if (lang && lang !== 'en') params.set('lang', lang)
		const res = await fetch(`${API_BASE_URL}/lent/${date}?${params}`, {
			next: { revalidate: 3600 },
		})
		if (!res.ok) return null
		return res.json()
	} catch {
		return null
	}
}

async function getSchedule(date: string): Promise<ScheduleResponse | null> {
	try {
		const year = date.split('-')[0]
		const res = await fetch(`${API_BASE_URL}/lent/schedule/${year}`, {
			next: { revalidate: 3600 },
		})
		if (!res.ok) return null
		return res.json()
	} catch {
		return null
	}
}

export async function generateMetadata({
	params,
}: { params: Promise<{ date: string }> }): Promise<Metadata> {
	const { date } = await params
	const data = await getDevotional(date)
	if (!data) {
		return { title: 'Lent Devotional' }
	}
	return {
		title: `Day ${data.dayNumber}: ${data.title} | Lent Devotional`,
		description: `Week ${data.weekNumber} — ${data.weekTheme}. ${data.references.join(', ')}`,
	}
}

interface LentDayPageProps {
	params: Promise<{ date: string }>
	searchParams: Promise<{
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

export default async function LentDayPage({ params, searchParams }: LentDayPageProps) {
	const { date } = await params
	const sp = await searchParams

	// Parse display settings from URL
	const viewMode: ViewMode = sp.view === 'verse' ? 'verse' : 'continuous'
	const showVerses = sp.verses !== 'hide'
	const textSize: TextSize = (sp.size as TextSize) || 'md'
	const fontFamily: FontFamily = (sp.font as FontFamily) || 'sans'
	const lineSpacing: LineSpacing = (sp.spacing as LineSpacing) || 'normal'
	const wordSpacing: WordSpacing = (sp.wordSpacing as WordSpacing) || 'normal'
	const theme: ReadingTheme = (sp.theme as ReadingTheme) || 'light'
	const width: ReadingWidth = (sp.width as ReadingWidth) || 'normal'
	const fontWeight: FontWeight = (sp.weight as FontWeight) || 'normal'

	const languages: BibleTranslation[] = ['en', 'ar']

	// Fetch English, Arabic, and schedule in parallel
	const [enData, arData, schedule] = await Promise.all([
		getDevotional(date, 'en'),
		getDevotional(date, 'ar'),
		getSchedule(date),
	])

	const devotional = enData

	if (!devotional) {
		return (
			<main
				className={`min-h-screen ${themeClasses.bg[theme]} ${themeClasses.textHeading[theme]}`}
			>
				<div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
					<Link
						href="/lent"
						className={`text-sm ${themeClasses.accent[theme]} hover:underline mb-4 inline-block`}
					>
						&larr; Back to schedule
					</Link>
					<h1 className="text-2xl font-bold mb-4">No Devotional Found</h1>
					<p className={themeClasses.muted[theme]}>
						This date does not fall within Great Lent, or the devotional data is
						unavailable.
					</p>
				</div>
			</main>
		)
	}

	// Build readings map by language for each reference
	const readingsByRef: {
		reference: string
		byLang: Partial<Record<BibleTranslation, Reading[]>>
	}[] = []

	const enRefs = enData?.resolvedReferences || []
	const arRefs = arData?.resolvedReferences || []

	for (let i = 0; i < enRefs.length; i++) {
		const ref = enRefs[i]
		const byLang: Partial<Record<BibleTranslation, Reading[]>> = {}
		if (ref?.readings) byLang.en = ref.readings
		if (arRefs[i]?.readings) byLang.ar = arRefs[i].readings!
		readingsByRef.push({ reference: ref.reference, byLang })
	}

	// Find previous/next days from schedule
	const days = schedule?.days || []
	const currentIndex = days.findIndex((d) => d.date === date)
	const prevDay = currentIndex > 0 ? days[currentIndex - 1] : null
	const nextDay =
		currentIndex >= 0 && currentIndex < days.length - 1 ? days[currentIndex + 1] : null

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
		languages: languages as ContentLang[],
	}

	const chevronClass =
		theme === 'sepia'
			? 'text-amber-700 hover:bg-amber-100'
			: 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'

	return (
		<main
			className={`min-h-screen ${themeClasses.bg[theme]} ${themeClasses.textHeading[theme]} transition-colors duration-300`}
		>
			{/* Progress indicator */}
			<Suspense fallback={null}>
				<ReadingProgress />
			</Suspense>

			{/* Sticky header — inline nav arrows + title, like readings page */}
			<ReadingsHeader theme={theme} themeClasses={themeClasses}>
				<div className="flex items-center gap-1.5 sm:gap-2 pr-10 sm:pr-12">
					<div className="flex items-center justify-center gap-1 sm:gap-2">
						{prevDay ? (
							<Link
								href={`/lent/${prevDay.date}`}
								className={`p-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${chevronClass}`}
								aria-label={`Previous day: Day ${prevDay.dayNumber}`}
							>
								<ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
							</Link>
						) : (
							<span className="p-1.5 opacity-0 pointer-events-none">
								<ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
							</span>
						)}

						<div className="text-center min-w-0">
							<h1 className="text-base sm:text-lg font-bold truncate">
								{devotional.title}
							</h1>
							<p
								className={`text-xs sm:text-sm ${theme === 'sepia' ? 'text-[#8b7355]' : 'text-gray-500 dark:text-gray-400'}`}
							>
								Day {devotional.dayNumber} &middot; {devotional.weekTheme}
							</p>
						</div>

						{nextDay ? (
							<Link
								href={`/lent/${nextDay.date}`}
								className={`p-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${chevronClass}`}
								aria-label={`Next day: Day ${nextDay.dayNumber}`}
							>
								<ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
							</Link>
						) : (
							<span className="p-1.5 opacity-0 pointer-events-none">
								<ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
							</span>
						)}
					</div>

					<Link
						href="/lent"
						className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${theme === 'sepia' ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'} hover:opacity-80`}
					>
						All Days
					</Link>
				</div>

				{/* Display settings - absolute right */}
				<div className="absolute right-2 sm:right-4">
					<Suspense fallback={null}>
						<DisplaySettings />
					</Suspense>
				</div>
			</ReadingsHeader>

			<Suspense fallback={<div className="px-3 sm:px-6 pt-4 pb-32 lg:pb-24" />}>
				<LentSwipeContainer
					prevDate={prevDay?.date ?? null}
					nextDate={nextDay?.date ?? null}
					className="px-3 sm:px-6 pt-4 pb-32 lg:pb-24"
				>
					{/* Sunday holy gospel accent */}
					{devotional.sundayHolyGospelReading && (
						<div className="max-w-full sm:max-w-2xl mx-auto mb-4 text-center">
							<p className={`text-[13px] italic ${themeClasses.accent[theme]}`}>
								{devotional.sundayHolyGospelReading}
							</p>
						</div>
					)}

					{/* Scripture readings */}
					{readingsByRef.map((entry, i) => (
						<ScriptureReading
							key={entry.reference}
							id={`reading-${i}`}
							readingsByLang={entry.byLang}
							labels={{
								en: entry.reference,
								ar: entry.reference,
								es: entry.reference,
								cop: entry.reference,
							}}
							service={undefined}
							{...scriptureProps}
						/>
					))}

					{/* Sermons */}
					{devotional.sermons && devotional.sermons.length > 0 && (
						<div className="max-w-full sm:max-w-2xl mx-auto mt-10 mb-8">
							<h2
								className={`text-xs font-semibold uppercase tracking-wider ${themeClasses.muted[theme]} mb-3`}
							>
								Sermons
							</h2>
							<div className="space-y-3">
								{devotional.sermons.map((sermon) => (
									<a
										key={sermon.youtubeUrl}
										href={sermon.youtubeUrl}
										target="_blank"
										rel="noopener noreferrer"
										className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
											theme === 'sepia'
												? 'border-[#d4c9b8] hover:bg-[#ebe4d6]'
												: theme === 'dark'
													? 'border-gray-800 hover:bg-gray-800/50'
													: 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
										}`}
									>
										{sermon.thumbnail && (
											<img
												src={sermon.thumbnail}
												alt=""
												className="w-24 h-16 rounded object-cover shrink-0"
											/>
										)}
										<div className="min-w-0">
											<p className="text-sm font-medium leading-tight">
												{sermon.title}
											</p>
											{sermon.preacher && (
												<p
													className={`text-xs mt-0.5 ${themeClasses.muted[theme]}`}
												>
													{sermon.preacher}
												</p>
											)}
										</div>
									</a>
								))}
							</div>
						</div>
					)}

					{/* Bottom nav */}
					<div className="max-w-full sm:max-w-2xl mx-auto mt-12 text-center">
						<Link
							href="/lent"
							className={`text-sm ${themeClasses.accent[theme]} hover:opacity-70 transition-opacity`}
						>
							View All Days
						</Link>
					</div>
				</LentSwipeContainer>
			</Suspense>

			<BackToTop />
		</main>
	)
}
