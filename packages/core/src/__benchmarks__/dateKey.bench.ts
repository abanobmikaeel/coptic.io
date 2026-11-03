import { bench, describe } from 'vitest'
import { toDateKey } from '../utils/date'

// 366 consecutive days, the size of a year view
const DAYS = Array.from({ length: 366 }, (_, i) => new Date(2024, 0, 1 + i))

const cachedIntl = new Intl.DateTimeFormat('en-CA', {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
})

describe('YYYY-MM-DD for 366 days', () => {
	// The padStart template the API and web used to repeat inline
	bench('inline template with padStart', () => {
		for (const d of DAYS) {
			;`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
		}
	})

	bench('toDateKey', () => {
		for (const d of DAYS) toDateKey(d)
	})

	bench('Intl.DateTimeFormat, cached', () => {
		for (const d of DAYS) cachedIntl.format(d)
	})

	bench('Intl.DateTimeFormat, recreated per call', () => {
		for (const d of DAYS)
			new Intl.DateTimeFormat('en-CA', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			}).format(d)
	})
})
