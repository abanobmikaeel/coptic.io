import CalendarSubscribeLinks from '@/components/CalendarSubscribeLinks'
import { MailIcon } from '@/components/ui/Icons'
import Link from 'next/link'

export default function SubscribeButton() {
	return (
		<div className="text-center space-y-4">
			<div className="flex flex-col sm:flex-row gap-3 justify-center">
				<CalendarSubscribeLinks />
				<Link
					href="/subscribe"
					className="inline-flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-4 px-6 rounded-xl transition-all text-base border border-gray-200 dark:border-gray-700"
				>
					<MailIcon />
					Email Updates
				</Link>
			</div>
			<p className="text-gray-500 dark:text-gray-500 text-sm">
				Subscribe via calendar app or receive daily email readings
			</p>
		</div>
	)
}
