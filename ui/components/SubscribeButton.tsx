export default function SubscribeButton() {
	return (
		<div className="text-center">
			<a
				href="webcal://copticio-production.up.railway.app/api/calendar/ical/subscribe"
				className="inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-500 text-white font-medium py-4 px-8 rounded-xl transition-all text-base"
			>
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				Subscribe to Calendar
			</a>
			<p className="text-gray-500 dark:text-gray-500 text-sm mt-3">
				Works with Apple Calendar, Google Calendar, and Outlook
			</p>
		</div>
	);
}
