import { getCalendarData, getTodayCelebrations, getUpcomingCelebrations } from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import SubscribeButton from "@/components/SubscribeButton";
import DeveloperSection from "@/components/DeveloperSection";
import UpcomingFeastsList from "@/components/UpcomingFeastsList";
import { filterUpcomingFeasts } from "@/lib/filterUpcomingFeasts";

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
			<section className="relative pt-24 pb-12 px-6">
				<div className="max-w-2xl mx-auto text-center">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[13px] text-gray-600 dark:text-gray-300 mb-6">
						<span className="w-1.5 h-1.5 rounded-full bg-green-500" />
						Live API
					</div>
					<h1 className="text-4xl md:text-[44px] font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
						The Coptic Orthodox<br />Liturgical Calendar
					</h1>
					<p className="text-[17px] text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
						Daily readings, feast days, fasting periods, and saint commemorations via a modern API.
					</p>
				</div>
			</section>

			{/* Today's Date Card */}
			<section className="relative px-6 pb-6">
				<div className="max-w-xl mx-auto">
					<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-sm dark:shadow-none">
						<p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mb-4">Today</p>
						<h2 className="text-2xl md:text-[32px] font-bold text-amber-600 dark:text-amber-500 mb-2">
							{copticDate}
						</h2>
						<p className="text-[15px] text-gray-600 dark:text-gray-400">{gregorianDate}</p>

						{todayFeast && (
							<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
								<p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mb-2">Feast</p>
								<p className="text-gray-900 dark:text-white text-[17px]">{todayFeast.name}</p>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Main Content */}
			<section className="relative px-6 pb-16">
				<div className="max-w-xl mx-auto space-y-5">
					{/* Upcoming Feasts */}
					<Card>
						<CardHeader>Upcoming Feasts</CardHeader>
						<CardContent>
							<UpcomingFeastsList feasts={upcomingFeasts} />
						</CardContent>
					</Card>

					{/* Subscribe */}
					<div className="py-6">
						<SubscribeButton />
					</div>

					{/* Developer Section */}
					<DeveloperSection />
				</div>
			</section>

			{/* Footer */}
			<footer className="relative border-t border-gray-200 dark:border-gray-800 py-8 px-6">
				<div className="max-w-xl mx-auto flex items-center justify-between">
					<p className="text-gray-500 dark:text-gray-400 text-[13px]">
						Built for the Coptic community
					</p>
					<a
						href="https://copticio-production.up.railway.app/api/readings"
						target="_blank"
						rel="noopener noreferrer"
						className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-[13px] transition-colors"
					>
						API Status
					</a>
				</div>
			</footer>
		</main>
	);
}
