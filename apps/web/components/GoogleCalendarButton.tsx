'use client'

import { GoogleIcon } from '@/components/ui/Icons'
import {
	GOOGLE_CALENDAR_ADD_BY_URL,
	GOOGLE_CALENDAR_SUBSCRIBE_URL,
	ICAL_SUBSCRIBE_HTTPS_URL,
} from '@/config'
import { copyToClipboard } from '@/lib/clipboard'
import { useState } from 'react'

type GoogleCalendarButtonProps = {
	label: string
	fallbackPrompt: string
	fallbackLinkLabel: string
	className?: string
}

/**
 * One click to subscribe in Google Calendar, with a recovery path for when that does nothing.
 *
 * Google's /render?cid= deep link subscribes in a single click for many users, but is an open
 * regression that for others redirects to the calendar having silently done nothing - no error,
 * no dialog, no calendar. Since it opens in a new tab this page survives the attempt, so the
 * click also copies the feed URL and reveals the manual route. Anyone it worked for ignores the
 * hint; anyone it failed for has the URL already on their clipboard and one link to paste it
 * into, instead of being stranded in an empty calendar with nothing to go on.
 */
export default function GoogleCalendarButton({
	label,
	fallbackPrompt,
	fallbackLinkLabel,
	className,
}: GoogleCalendarButtonProps) {
	const [attempted, setAttempted] = useState(false)

	return (
		<span className="inline-flex flex-col items-center gap-2">
			<a
				href={GOOGLE_CALENDAR_SUBSCRIBE_URL}
				target="_blank"
				rel="noopener noreferrer"
				onClick={() => {
					void copyToClipboard(ICAL_SUBSCRIBE_HTTPS_URL)
					setAttempted(true)
				}}
				className={className}
			>
				<GoogleIcon className="w-4 h-4" />
				{label}
			</a>
			{attempted ? (
				<span
					aria-live="polite"
					className="text-xs text-gray-500 dark:text-gray-400 max-w-xs text-center leading-relaxed"
				>
					{fallbackPrompt}{' '}
					<a
						href={GOOGLE_CALENDAR_ADD_BY_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="underline hover:text-gray-900 dark:hover:text-white"
					>
						{fallbackLinkLabel}
					</a>
				</span>
			) : null}
		</span>
	)
}
