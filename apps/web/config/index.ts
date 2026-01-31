// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.coptic.io/api'

// Calendar subscription URL (webcal protocol for calendar apps)
export const ICAL_SUBSCRIBE_URL = `${API_BASE_URL.replace('https://', 'webcal://')}/calendar/ical/subscribe`

// Feature Flags
export const features = {
	copticCalendarMode: process.env.NEXT_PUBLIC_ENABLE_COPTIC_MODE === 'true',
} as const
