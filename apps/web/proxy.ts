import { type NextRequest, NextResponse } from 'next/server'

/**
 * Middleware to ensure date-dependent pages always have an explicit date param.
 *
 * On Vercel, new Date() returns UTC which can be a different day than the user's
 * local timezone. This middleware uses Vercel's x-vercel-ip-timezone header to
 * determine the user's local "today" and redirects to include it in the URL.
 */
export function proxy(request: NextRequest) {
	const { pathname, searchParams } = request.nextUrl

	// Only intercept date-dependent pages that have no explicit date
	if (searchParams.has('date')) return

	const needsDate = pathname === '/readings' || pathname === '/synaxarium'
	if (!needsDate) return

	// Get timezone from Vercel geo header, fall back to system timezone
	const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone
	const tz = request.headers.get('x-vercel-ip-timezone') || systemTz

	let today: string
	try {
		// en-CA locale gives YYYY-MM-DD format
		today = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
	} catch {
		// Invalid timezone, fall back to system timezone
		today = new Intl.DateTimeFormat('en-CA', { timeZone: systemTz }).format(new Date())
	}

	const url = request.nextUrl.clone()
	url.searchParams.set('date', today)
	return NextResponse.redirect(url)
}

export const config = {
	matcher: ['/readings', '/synaxarium'],
}
