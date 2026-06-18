import DeveloperSection from '@/components/DeveloperSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Coptic IO — Daily Readings, Prayers & Calendar',
	description:
		'Your Coptic Orthodox companion: daily Katameros readings, the Agpeya hours, the Raising of Incense, the Synaxarium, and the Coptic calendar — beautifully presented.',
	openGraph: {
		title: 'Coptic IO — Daily Readings, Prayers & Calendar',
		description:
			'Your Coptic Orthodox companion: daily readings, the Agpeya, Vespers, the Synaxarium, and the Coptic calendar.',
	},
}
import EmailSignup from '@/components/EmailSignup'
import HomeUpcomingSynaxarium from '@/components/HomeUpcomingSynaxarium'
import { OfferingsGrid } from '@/components/OfferingsGrid'
import UpcomingFastsList from '@/components/UpcomingFastsList'
import UpcomingFeastsList from '@/components/UpcomingFeastsList'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { CalendarIcon, ChevronRightIcon } from '@/components/ui/Icons'
import { ICAL_SUBSCRIBE_URL } from '@/config'
import {
	getCalendarData,
	getFastingForDate,
	getReadingReferences,
	getTodayCelebrations,
	getUpcomingCelebrations,
} from '@/lib/api'
import {
	filterFeastsOnly,
	filterUpcomingFasts,
	filterUpcomingFeasts,
} from '@/lib/filterUpcomingFeasts'
import { formatGregorianDate, parseDateString } from '@/lib/utils'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Suspense } from 'react'

// Page revalidates via API caching (5 minute ISR)

interface HomeProps {
	searchParams: Promise<{ date?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
	const params = await searchParams
	const date = params.date
	const t = await getTranslations('home')
	const locale = await getLocale()

	const [calendar, celebrations, upcoming, readingRefs, fasting] = await Promise.all([
		getCalendarData(date, locale),
		getTodayCelebrations(date, locale),
		getUpcomingCelebrations(60, locale),
		getReadingReferences(date, locale),
		getFastingForDate(date, locale),
	])

	const displayDate = date ? parseDateString(date) : new Date()
	const gregorianDate = formatGregorianDate(displayDate, locale)

	const copticDate = calendar?.dateString || 'Loading...'
	const todayFeast = Array.isArray(celebrations) && celebrations.length > 0 ? celebrations[0] : null

	const hasReadingRefs = readingRefs?.reference?.LPsalm || readingRefs?.reference?.LGospel
	const isLent = !hasReadingRefs && readingRefs?.season
	// Surface the Lent Guide offering only during Great Lent. Use the
	// language-stable seasonKey so detection works regardless of locale.
	const seasonKey = readingRefs?.seasonKey ?? readingRefs?.season
	const isLentSeason = !!seasonKey && /lent/i.test(seasonKey)

	const allEvents = Array.isArray(upcoming) ? filterUpcomingFeasts(upcoming) : []
	const upcomingFeasts = filterFeastsOnly(allEvents)
	const upcomingFasts = Array.isArray(upcoming) ? filterUpcomingFasts(upcoming) : []

	return (
		<main className="min-h-screen relative overflow-hidden">
			{/* Hero: value prop + today */}
			<section className="relative px-6 pt-20 pb-14">
				<div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_55%_at_50%_-10%,rgba(245,158,11,0.10),transparent_70%)]" />
				<div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
					{/* Left: mission + CTAs */}
					<div className="text-center lg:text-start">
						<p className="text-xs font-medium text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4">
							{t('heroKicker')}
						</p>
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-5">
							{t('heroHeadline')}
						</h1>
						<p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
							{t('heroSubhead')}
						</p>
						<div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
							<Link
								href="/readings"
								className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
							>
								{t('viewTodaysReadings')}
								<ChevronRightIcon className="w-4 h-4 rtl:rotate-180" />
							</Link>
							<Link
								href="/agpeya"
								className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.05] text-sm font-medium transition-colors"
							>
								{t('prayTheHours')}
							</Link>
						</div>
					</div>

					{/* Right: today card */}
					<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-sm dark:shadow-none">
						<p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
							{t('today')}
						</p>
						<p className="text-3xl md:text-4xl font-bold text-amber-600 dark:text-amber-500 mb-2">
							{copticDate}
						</p>
						<p className="text-gray-600 dark:text-gray-400">{gregorianDate}</p>

						{fasting?.isFasting && (
							<div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-full">
								<span className="w-2 h-2 rounded-full bg-purple-500" />
								<span className="text-sm font-medium text-purple-700 dark:text-purple-300">
									{fasting.description || t('fastingToday')}
								</span>
							</div>
						)}

						{todayFeast && (
							<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
								<p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
									{t('feast')}
								</p>
								<p className="text-gray-900 dark:text-white text-lg">{todayFeast.name}</p>
							</div>
						)}

						{hasReadingRefs && (
							<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
								<p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
									{t('todaysReadings')}
								</p>
								{readingRefs?.reference?.LPsalm && (
									<p className="text-gray-700 dark:text-gray-300 text-sm">
										<span className="font-medium text-gray-900 dark:text-white">{t('psalm')}:</span>{' '}
										{readingRefs.reference.LPsalm}
									</p>
								)}
								{readingRefs?.reference?.LGospel && (
									<p className="text-gray-700 dark:text-gray-300 text-sm">
										<span className="font-medium text-gray-900 dark:text-white">
											{t('gospel')}:
										</span>{' '}
										{readingRefs.reference.LGospel}
									</p>
								)}
							</div>
						)}

						{isLent && (
							<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
								<p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
									{t('season')}
								</p>
								<p className="text-gray-900 dark:text-white text-lg">
									{readingRefs?.season}
									{readingRefs?.seasonDay && ` — ${readingRefs.seasonDay}`}
								</p>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Explore: offerings grid */}
			<section className="relative px-6 pb-10">
				<div className="max-w-4xl mx-auto">
					<h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 text-center">
						{t('explore')}
					</h2>
					<OfferingsGrid lent={isLentSeason} />
				</div>
			</section>

			{/* Upcoming Feasts */}
			<section className="relative px-6 pb-6">
				<div className="max-w-4xl mx-auto">
					<Card>
						<CardHeader>{t('upcomingFeasts')}</CardHeader>
						<CardContent>
							<UpcomingFeastsList feasts={upcomingFeasts} />
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Upcoming Fasts */}
			{upcomingFasts.length > 0 && (
				<section className="relative px-6 pb-6">
					<div className="max-w-4xl mx-auto">
						<Card>
							<CardHeader>{t('upcomingFasts')}</CardHeader>
							<CardContent>
								<UpcomingFastsList fasts={upcomingFasts} />
							</CardContent>
						</Card>
					</div>
				</section>
			)}

			{/* Today's Commemorations */}
			<section className="relative px-6 pb-12">
				<div className="max-w-4xl mx-auto">
					<Card>
						<CardHeader>{t('todaysCommemorations')}</CardHeader>
						<CardContent>
							<Suspense
								fallback={
									<div className="py-4 flex justify-center">
										<div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
									</div>
								}
							>
								<HomeUpcomingSynaxarium limit={5} />
							</Suspense>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Email Signup (secondary) */}
			<section className="relative px-6 pb-10">
				<div className="max-w-lg mx-auto">
					<p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">
						{t('emailStripTitle')}
					</p>
					<EmailSignup />
				</div>
			</section>

			{/* Calendar Sync Option */}
			<section className="relative px-6 pb-16">
				<div className="max-w-4xl mx-auto text-center">
					<p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{t('preferCalendarSync')}</p>
					<a
						href={ICAL_SUBSCRIBE_URL}
						className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
					>
						<CalendarIcon />
						{t('addToCalendar')}
					</a>
				</div>
			</section>

			{/* Developer Section */}
			<section className="relative px-6 pb-16">
				<div className="max-w-4xl mx-auto">
					<DeveloperSection />
				</div>
			</section>

			{/* Footer */}
			<footer className="relative border-t border-gray-200 dark:border-gray-800 py-8 px-6">
				<div className="max-w-4xl mx-auto flex items-center justify-center">
					<p className="text-gray-500 dark:text-gray-400 text-sm">{t('footer')}</p>
				</div>
			</footer>
		</main>
	)
}
