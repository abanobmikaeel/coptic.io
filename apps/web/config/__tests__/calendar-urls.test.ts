import { describe, expect, it } from 'vitest'
import {
	GOOGLE_CALENDAR_ADD_BY_URL,
	GOOGLE_CALENDAR_SUBSCRIBE_URL,
	ICAL_SUBSCRIBE_HTTPS_URL,
	ICAL_SUBSCRIBE_URL,
} from '../index'

describe('calendar subscription URLs', () => {
	it('exposes the feed over https for manual "add by URL" entry', () => {
		expect(ICAL_SUBSCRIBE_HTTPS_URL).toMatch(/^https?:\/\//)
		expect(ICAL_SUBSCRIBE_HTTPS_URL).toContain('/calendar/ical/subscribe')
	})

	it('offers webcal:// so an OS calendar handler can claim the link', () => {
		expect(ICAL_SUBSCRIBE_URL).toMatch(/^webcal:\/\//)
		expect(ICAL_SUBSCRIBE_URL).toContain('/calendar/ical/subscribe')
	})

	it('sends Google the webcal form, never the https one', () => {
		// Google answers "Unable to add calendar. Invalid URL" when cid carries the https feed
		const cid = new URL(GOOGLE_CALENDAR_SUBSCRIBE_URL).searchParams.get('cid')

		expect(cid).toBe(ICAL_SUBSCRIBE_URL)
		expect(cid).toMatch(/^webcal:\/\//)
		expect(cid).not.toMatch(/^https?:\/\//)
	})

	it('keeps a manual add-by-URL fallback for when the deep link no-ops', () => {
		const url = new URL(GOOGLE_CALENDAR_ADD_BY_URL)

		expect(url.hostname).toBe('calendar.google.com')
		expect(url.pathname).toBe('/calendar/r/settings/addbyurl')
		// The fallback must not be the endpoint it exists to recover from
		expect(GOOGLE_CALENDAR_ADD_BY_URL).not.toContain('cid=')
	})
})
