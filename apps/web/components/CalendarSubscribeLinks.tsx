import GoogleCalendarButton from '@/components/GoogleCalendarButton'
import CopyButton from '@/components/ui/CopyButton'
import { CalendarIcon } from '@/components/ui/Icons'
import { ICAL_SUBSCRIBE_HTTPS_URL, ICAL_SUBSCRIBE_URL } from '@/config'
import { getTranslations } from 'next-intl/server'

const LINK_CLASSES =
	'inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3 font-medium transition-colors'

/**
 * Calendar subscription entry points.
 *
 * All three are one click. Google's carries its own recovery hint because its deep link can
 * no-op; Apple Calendar and Outlook use the webcal:// scheme their OS handler claims, which a
 * browser can hijack - Chrome hands it to Google Calendar when Google has registered as the
 * handler, and drops it entirely when nothing has. The plain feed URL is offered alongside both
 * as the route that depends on neither.
 */
export default async function CalendarSubscribeLinks() {
	const t = await getTranslations('home')

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row items-start justify-center gap-3">
				<GoogleCalendarButton
					label={t('addToGoogleCalendar')}
					fallbackPrompt={t('googleFallbackPrompt')}
					fallbackLinkLabel={t('googleFallbackLink')}
					className={`${LINK_CLASSES} bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700`}
				/>
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
			<p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
				{t('subscribeHelp')}
			</p>
		</div>
	)
}
