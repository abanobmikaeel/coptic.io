import { BackToTop } from '@/components/BackToTop'
import { ReadingPageLayout } from '@/components/ReadingPageLayout'
import { ScriptureReading } from '@/components/ScriptureReading'
import { API_BASE_URL } from '@/config'
import type { ContentLang } from '@/i18n/content-translations'
import { parseDisplaySettings, resolveContentLanguages, resolveTheme } from '@/lib/display-settings'
import { themeClasses } from '@/lib/reading-styles'
import type { Reading } from '@/lib/types'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Suspense } from 'react'
import { LentDayHeader } from './LentDayHeader'
import { LentNotFound } from './LentNotFound'
import { LentSermonList } from './LentSermonList'
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

async function getDevotional(date: string, lang?: string): Promise<DevotionalResponse | null> {
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

async function getSchedule(date: string): Promise<{ days: ScheduleDay[] } | null> {
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
	if (!data) return { title: 'Lent Devotional' }
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

	const cookieStore = await cookies()
	const themeFallback = resolveTheme(cookieStore)
	const lentSupportedLangs: BibleTranslation[] = ['en', 'ar']
	const languages = resolveContentLanguages(cookieStore, lentSupportedLangs)

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
	} = parseDisplaySettings(sp, themeFallback)

	const [enData, arData, schedule] = await Promise.all([
		getDevotional(date, 'en'),
		getDevotional(date, 'ar'),
		getSchedule(date),
	])

	const devotional = enData

	if (!devotional) {
		return <LentNotFound theme={theme} />
	}

	// Build readings map by language for each reference
	const enRefs = enData?.resolvedReferences || []
	const arRefs = arData?.resolvedReferences || []
	const readingsByRef = enRefs.map((ref, i) => {
		const byLang: Partial<Record<BibleTranslation, Reading[]>> = {}
		if (ref?.readings) byLang.en = ref.readings
		if (arRefs[i]?.readings) byLang.ar = arRefs[i].readings!
		return { reference: ref.reference, byLang }
	})

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

	return (
		<ReadingPageLayout
			theme={theme}
			header={
				<LentDayHeader devotional={devotional} prevDay={prevDay} nextDay={nextDay} theme={theme} />
			}
		>
			<Suspense fallback={<div className="px-3 sm:px-6 pt-4 pb-32 lg:pb-24" />}>
				<LentSwipeContainer
					prevDate={prevDay?.date ?? null}
					nextDate={nextDay?.date ?? null}
					className="px-3 sm:px-6 pt-4 pb-32 lg:pb-24"
				>
					{devotional.sundayHolyGospelReading && (
						<div className="max-w-full sm:max-w-2xl mx-auto mb-4 text-center">
							<p className={`text-[13px] italic ${themeClasses.accent[theme]}`}>
								{devotional.sundayHolyGospelReading}
							</p>
						</div>
					)}

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

					<LentSermonList sermons={devotional.sermons ?? []} theme={theme} />

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
		</ReadingPageLayout>
	)
}
