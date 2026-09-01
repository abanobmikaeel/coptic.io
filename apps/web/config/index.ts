// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.coptic.io/api'

// Calendar subscription feed.
// Apple Calendar and Outlook take the webcal:// scheme, which hands the URL straight to the
// OS calendar handler.
export const ICAL_SUBSCRIBE_HTTPS_URL = `${API_BASE_URL}/calendar/ical/subscribe`
export const ICAL_SUBSCRIBE_URL = ICAL_SUBSCRIBE_HTTPS_URL.replace(/^https?:\/\//, 'webcal://')

// Google's "add by URL" screen takes the feed through its cid parameter, and cid must carry the
// webcal:// form. Handing it the https:// URL fails with "Unable to add calendar. Invalid URL",
// so this deliberately passes ICAL_SUBSCRIBE_URL rather than the https one.
export const GOOGLE_CALENDAR_SUBSCRIBE_URL = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(
	ICAL_SUBSCRIBE_URL,
)}`

// Feature Flags
export const features = {
	copticCalendarMode: process.env.NEXT_PUBLIC_ENABLE_COPTIC_MODE === 'true',
} as const
