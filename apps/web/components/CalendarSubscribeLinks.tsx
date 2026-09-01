import { CalendarIcon, GoogleIcon } from '@/components/ui/Icons'
import { GOOGLE_CALENDAR_SUBSCRIBE_URL, ICAL_SUBSCRIBE_URL } from '@/config'
import { getTranslations } from 'next-intl/server'

const LINK_CLASSES =
	'inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3 font-medium transition-colors'

/**
 * Calendar subscription entry points.
 *
 * Google and the webcal:// apps need different links: Apple Calendar and Outlook register a
 * webcal:// handler, while Google Calendar cannot resolve that scheme at all and has to be
 * sent to its own "add by URL" screen with the https feed. Offering only webcal silently
 * failed for every Google user, so both are exposed explicitly.
 */
export default async function CalendarSubscribeLinks() {
	const t = await getTranslations('home')

	return (
		<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
			<a
				href={GOOGLE_CALENDAR_SUBSCRIBE_URL}
				target="_blank"
				rel="noopener noreferrer"
				className={`${LINK_CLASSES} bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700`}
			>
				<GoogleIcon className="w-4 h-4" />
				{t('addToGoogleCalendar')}
			</a>
			<a
				href={ICAL_SUBSCRIBE_URL}
				className={`${LINK_CLASSES} text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800`}
			>
				<CalendarIcon className="w-4 h-4" />
				{t('addToAppleOutlook')}
			</a>
		</div>
	)
}
