import CopyButton from '@/components/ui/CopyButton'
import { CalendarIcon, GoogleIcon } from '@/components/ui/Icons'
import {
	GOOGLE_CALENDAR_SUBSCRIBE_URL,
	ICAL_SUBSCRIBE_HTTPS_URL,
	ICAL_SUBSCRIBE_URL,
} from '@/config'
import { getTranslations } from 'next-intl/server'

const LINK_CLASSES =
	'inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3 font-medium transition-colors'

/**
 * Calendar subscription entry points.
 *
 * Google gets its own "add by URL" link, and Apple Calendar and Outlook get the webcal://
 * scheme their OS handler claims. Both routes depend on state outside the page - Google
 * suppresses its add prompt on a repeat visit, and a browser that has registered Google as
 * the webcal:// handler sends the second link there too - so the raw feed URL is offered
 * alongside them as a route that always works by hand.
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
			<CopyButton
				value={ICAL_SUBSCRIBE_HTTPS_URL}
				label={t('copyFeedUrl')}
				copiedLabel={t('copiedFeedUrl')}
				className={`${LINK_CLASSES} text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800`}
			/>
		</div>
	)
}
