// Vespers prayed this evening belongs to the next liturgical day, so after a local
// cutoff hour the default date rolls over to tomorrow. The cutoff is a per-device
// setting; sunset varies by location and parishes schedule Vespers differently.

export const VESPERS_ROLLOVER_KEY = 'vespers:rollover-hour'
export const DEFAULT_ROLLOVER_HOUR = 16
// Sentinel meaning "never roll over" — the local hour never reaches 24.
export const ROLLOVER_OFF = 24

export function getRolloverHour(): number {
	try {
		const raw = localStorage.getItem(VESPERS_ROLLOVER_KEY)
		if (raw != null) {
			const hour = Number(raw)
			if (Number.isInteger(hour) && hour >= 0 && hour <= ROLLOVER_OFF) return hour
		}
	} catch {
		/* unavailable storage */
	}
	return DEFAULT_ROLLOVER_HOUR
}

export function setRolloverHour(hour: number): void {
	try {
		localStorage.setItem(VESPERS_ROLLOVER_KEY, String(hour))
	} catch {
		/* best effort */
	}
}
