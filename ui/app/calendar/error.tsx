'use client';

import { Button } from '@/components/ui/Button';

export default function CalendarError({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<main className="min-h-screen relative">
			<section className="relative pt-20 pb-8 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Fasting Calendar
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						View fasting periods throughout the year
					</p>
				</div>
			</section>

			<section className="relative px-6 pb-16">
				<div className="max-w-4xl mx-auto">
					<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-sm dark:shadow-none">
						<p className="text-gray-500 dark:text-gray-400 mb-4">
							Unable to load calendar data. Please try again.
						</p>
						<Button onClick={reset}>
							Retry
						</Button>
					</div>
				</div>
			</section>
		</main>
	);
}
