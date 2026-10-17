// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.coptic.io/api'

// Calendar subscription feed.
// Apple Calendar and Outlook take the webcal:// scheme, which hands the URL straight to the
// OS calendar handler.
export const ICAL_SUBSCRIBE_HTTPS_URL = `${API_BASE_URL}/calendar/ical/subscribe`
export const ICAL_SUBSCRIBE_URL = ICAL_SUBSCRIBE_HTTPS_URL.replace(/^https?:\/\//, 'webcal://')

// Google's one-click subscribe deep link. cid must carry the webcal:// form - the https:// one
// fails with "Unable to add calendar. Invalid URL". Whether cid is percent-encoded makes no
// difference, and www.google.com simply redirects here.
//
// This works for many users but not all: issuetracker.google.com/issues/442619500 (filed Sept
// 2025, still New) reports it redirecting to the calendar without ever prompting. It fails
// silently when it fails, so the button pairs it with the fallback below rather than trusting it.
export const GOOGLE_CALENDAR_SUBSCRIBE_URL = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(
	ICAL_SUBSCRIBE_URL,
)}`

// The fallback when the deep link no-ops: Google's "add by URL" screen, which always subscribes
// and imports correctly once the https feed is pasted. Its ?url= and ?cid= prefill parameters do
// not work, so the field has to be filled by hand - hence copying the URL when the button is used.
export const GOOGLE_CALENDAR_ADD_BY_URL = 'https://calendar.google.com/calendar/r/settings/addbyurl'

// Feature Flags
export const features = {
	copticCalendarMode: process.env.NEXT_PUBLIC_ENABLE_COPTIC_MODE === 'true',
} as const
