import DeveloperSection from '@/components/DeveloperSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Coptic Calendar - Daily Readings & Feast Days',
	description:
		'Stay connected to your faith with daily scripture readings and feast day reminders from the Coptic Orthodox calendar, delivered to your inbox.',
	openGraph: {
		title: 'Coptic Calendar - Daily Readings & Feast Days',
		description:
			'Stay connected to your faith with daily scripture readings and feast day reminders from the Coptic Orthodox calendar.',
	},
}
import EmailSignup from '@/components/EmailSignup'
import HomeUpcomingSynaxarium from '@/components/HomeUpcomingSynaxarium'
import UpcomingFastsList from '@/components/UpcomingFastsList'
import UpcomingFeastsList from '@/components/UpcomingFeastsList'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { CalendarIcon, ChevronRightIcon } from '@/components/ui/Icons'
import { ICAL_SUBSCRIBE_URL } from '@/config'
import { getCalendarData, getTodayCelebrations, getUpcomingCelebrations } from '@/lib/api'
import { filterFeastsOnly, filterUpcomingFasts, filterUpcomingFeasts } from '@/lib/filterUpcomingFeasts'
import { formatGregorianDate } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Suspense } from 'react'

// Page revalidates via API caching (5 minute ISR)

export default async function Home() {
	const t = await getTranslations('home')

	const [calendar, celebrations, upcoming] = await Promise.all([
		getCalendarData(),
		getTodayCelebrations(),
		getUpcomingCelebrations(60),
	])

	const gregorianDate = formatGregorianDate(new Date())

	const copticDate = calendar?.dateString || 'Loading...'
	const todayFeast = Array.isArray(celebrations) && celebrations.length > 0 ? celebrations[0] : null

	const allEvents = Array.isArray(upcoming) ? filterUpcomingFeasts(upcoming) : []
	const upcomingFeasts = filterFeastsOnly(allEvents)
	const upcomingFasts = Array.isArray(upcoming) ? filterUpcomingFasts(upcoming) : []

	return (
		<main className="min-h-screen relative overflow-hidden">
			{/* Hero Section */}
			<section className="relative pt-20 pb-8 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
						{t('heroTitle1')}
						<br />
						{t('heroTitle2')}
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
						{t('heroSubtitle')}
					</p>
				</div>
			</section>

			{/* Email Signup - Primary CTA */}
			<section className="relative px-6 pb-8">
				<div className="max-w-lg mx-auto">
					<EmailSignup />
				</div>
			</section>

			{/* Today's Date Card */}
			<section className="relative px-6 pb-6">
				<div className="max-w-4xl mx-auto">
					<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-sm dark:shadow-none">
						<p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
							{t('today')}
						</p>
						<h2 className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-500 mb-2">
							{copticDate}
						</h2>
						<p className="text-gray-600 dark:text-gray-400">{gregorianDate}</p>

						{todayFeast && (
							<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
								<p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
									{t('feast')}
								</p>
								<p className="text-gray-900 dark:text-white text-lg">{todayFeast.name}</p>
							</div>
						)}

						<Link
							href="/readings"
							className="inline-flex items-center gap-2 mt-6 text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors"
						>
							{t('viewTodaysReadings')}
							<ChevronRightIcon className="w-4 h-4" />
						</Link>
					</div>
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
