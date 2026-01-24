export default function SubscribeButton() {
	return (
		<div className="text-center space-y-4">
			<div className="flex flex-col sm:flex-row gap-3 justify-center">
				<a
					href="webcal://copticio-production.up.railway.app/api/calendar/ical/subscribe"
					className="inline-flex items-center justify-center gap-3 bg-amber-600 hover:bg-amber-500 text-white font-medium py-4 px-6 rounded-xl transition-all text-base"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					Calendar Feed
				</a>
				<a
					href="/subscribe"
					className="inline-flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-4 px-6 rounded-xl transition-all text-base border border-gray-200 dark:border-gray-700"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
					Email Updates
				</a>
			</div>
			<p className="text-gray-500 dark:text-gray-500 text-sm">
				Subscribe via calendar app or receive daily email readings
			</p>
		</div>
	);
}
