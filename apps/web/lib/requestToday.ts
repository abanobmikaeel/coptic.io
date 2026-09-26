import { headers } from 'next/headers'

// en-CA formats as YYYY-MM-DD
const formatInZone = (timeZone: string) =>
	new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date())

/**
 * Today's date (YYYY-MM-DD) for the visitor. On Vercel the server clock is UTC, which can
 * be a different day than the visitor's, so use the timezone Vercel derives from their IP.
 */
export async function getRequestToday(): Promise<string> {
	const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone
	const tz = (await headers()).get('x-vercel-ip-timezone') || systemTz
	try {
		return formatInZone(tz)
	} catch {
		// Invalid timezone header
		return formatInZone(systemTz)
	}
}
