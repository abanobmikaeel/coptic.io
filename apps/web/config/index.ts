// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.coptic.io/api'

// Calendar subscription feed.
// Apple Calendar and Outlook take the webcal:// scheme, which hands the URL straight to the
// OS calendar handler. Google Calendar cannot resolve webcal:// at all - it only accepts an
// https:// feed passed through the cid parameter of its "add by URL" screen.
export const ICAL_SUBSCRIBE_HTTPS_URL = `${API_BASE_URL}/calendar/ical/subscribe`
export const ICAL_SUBSCRIBE_URL = ICAL_SUBSCRIBE_HTTPS_URL.replace(/^https?:\/\//, 'webcal://')
export const GOOGLE_CALENDAR_SUBSCRIBE_URL = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(
	ICAL_SUBSCRIBE_HTTPS_URL,
)}`

// Feature Flags
export const features = {
	copticCalendarMode: process.env.NEXT_PUBLIC_ENABLE_COPTIC_MODE === 'true',
} as const
