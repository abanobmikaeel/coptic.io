import { describe, expect, it, vi } from 'vitest'
import { app } from '../../index'
import { INTERNAL_ERROR_MESSAGE } from '../../utils/http'

// A failure inside a service is ours, not the client's: the global error handler
// answers it with a public-safe 500, whatever the error says.
vi.mock('../../services/liturgy.service', () => ({
	getLiturgyForDate: () => {
		throw new Error('bible-ar.json not found in R2 bucket')
	},
}))
vi.mock('../../services/incense.service', () => ({
	getAvailableCommemorations: () => [],
	getIncenseForDate: () => {
		throw new Error('No reading for Sunday 5 of month 6')
	},
}))

describe('service failures', () => {
	it.each(['/api/liturgy/basil?date=2026-06-01', '/api/incense/evening?date=2026-06-01'])(
		'%s answers 500 without leaking the error',
		async (path) => {
			const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
			const res = await app.request(path)
			expect(res.status).toBe(500)
			expect(await res.json()).toEqual({ error: INTERNAL_ERROR_MESSAGE })
			expect(spy).toHaveBeenCalled()
			spy.mockRestore()
		},
	)
})
