// Commemorations the user has selected to include in the incense service — primarily their
// church's patron saint, but any saint with verses can be added. Stored in a cookie so the
// server component can read it and request the matching conditional verses from the API.

export const INCENSE_COMMEMORATIONS_COOKIE = 'INCENSE_COMMEMORATIONS'

export function parseCommemorations(cookieValue: string | undefined): string[] {
	if (!cookieValue) return []
	return cookieValue
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean)
}

// Turn a key like "saint-mary" or "annunciation-nativity-and-resurrection" into a label.
export function commemorationLabel(key: string): string {
	return key
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}
