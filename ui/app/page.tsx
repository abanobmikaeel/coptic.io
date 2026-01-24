import { getCalendarData, getTodayCelebrations, getUpcomingCelebrations } from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import UpcomingFeastsList from "@/components/UpcomingFeastsList";
import EmailSignup from "@/components/EmailSignup";
import DeveloperSection from "@/components/DeveloperSection";
import { filterUpcomingFeasts } from "@/lib/filterUpcomingFeasts";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Home() {
	const [calendar, celebrations, upcoming] = await Promise.all([
		getCalendarData(),
		getTodayCelebrations(),
		getUpcomingCelebrations(60),
	]);

	const gregorianDate = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const copticDate = calendar?.dateString || 'Loading...';
	const todayFeast = Array.isArray(celebrations) && celebrations.length > 0
		? celebrations[0]
		: null;

	const upcomingFeasts = Array.isArray(upcoming) ? filterUpcomingFeasts(upcoming) : [];

	return (
		<main className="min-h-screen relative overflow-hidden">
			{/* Hero Section */}
			<section className="relative pt-20 pb-8 px-6">
				<div className="max-w-3xl mx-auto text-center">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
						Stay Connected to<br />Your Faith
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
						Daily scripture readings and feast day reminders from the Coptic Orthodox calendar, delivered to your inbox.
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
				<div className="max-w-2xl mx-auto">
					<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-sm dark:shadow-none">
						<p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Today</p>
						<h2 className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-500 mb-2">
							{copticDate}
						</h2>
						<p className="text-gray-600 dark:text-gray-400">{gregorianDate}</p>

						{todayFeast && (
							<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
								<p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Feast</p>
								<p className="text-gray-900 dark:text-white text-lg">{todayFeast.name}</p>
							</div>
						)}

						<Link
							href="/readings"
							className="inline-flex items-center gap-2 mt-6 text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors"
						>
							View today&apos;s readings
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</Link>
					</div>
				</div>
			</section>

			{/* Upcoming Feasts */}
			<section className="relative px-6 pb-12">
				<div className="max-w-2xl mx-auto">
					<Card>
						<CardHeader>Upcoming Feasts</CardHeader>
						<CardContent>
							<UpcomingFeastsList feasts={upcomingFeasts} />
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Calendar Sync Option */}
			<section className="relative px-6 pb-16">
				<div className="max-w-2xl mx-auto text-center">
					<p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
						Prefer calendar sync?
					</p>
					<a
						href="webcal://copticio-production.up.railway.app/api/calendar/ical/subscribe"
						className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						Add to Apple, Google, or Outlook Calendar
					</a>
				</div>
			</section>

			{/* Developer Section */}
			<section className="relative px-6 pb-16">
				<div className="max-w-2xl mx-auto">
					<DeveloperSection />
				</div>
			</section>

			{/* Footer */}
			<footer className="relative border-t border-gray-200 dark:border-gray-800 py-8 px-6">
				<div className="max-w-2xl mx-auto flex items-center justify-center">
					<p className="text-gray-500 dark:text-gray-400 text-sm">
						Built for the Coptic community
					</p>
				</div>
			</footer>
		</main>
	);
}
