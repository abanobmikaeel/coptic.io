import { describe, expect, it } from 'vitest'
import { parseViewMode, withStoredPreferences } from '../reading-preferences'

describe('parseViewMode', () => {
	it('defaults to verse-by-verse when the param is absent, matching the settings panel', () => {
		expect(parseViewMode(undefined)).toBe('verse')
		expect(parseViewMode(null)).toBe('verse')
	})

	it('reads continuous and verse explicitly', () => {
		expect(parseViewMode('continuous')).toBe('continuous')
		expect(parseViewMode('verse')).toBe('verse')
	})

	it('treats an unknown value as the default', () => {
		expect(parseViewMode('upcoming')).toBe('verse')
	})
})

describe('withStoredPreferences', () => {
	const query = (params: URLSearchParams) => Object.fromEntries(params)

	it('fills unset params from stored preferences and keeps the rest', () => {
		const params = new URLSearchParams('date=2026-09-27')
		const result = withStoredPreferences(
			params,
			{ size: 'lg', view: 'continuous', font: 'serif', verses: 'hide' },
			'sepia',
		)
		expect(query(result)).toEqual({
			date: '2026-09-27',
			size: 'lg',
			view: 'continuous',
			font: 'serif',
			theme: 'sepia',
			verses: 'hide',
		})
	})

	it('lets params already in the URL win over stored preferences', () => {
		const params = new URLSearchParams('theme=sepia&view=upcoming')
		const result = withStoredPreferences(params, { view: 'continuous', size: 'lg' }, 'dark')
		expect(query(result)).toEqual({ theme: 'sepia', view: 'upcoming', size: 'lg' })
	})

	it('writes nothing for default values', () => {
		const result = withStoredPreferences(
			new URLSearchParams(),
			{
				size: 'md',
				view: 'verse',
				lang: 'en',
				font: 'sans',
				spacing: 'normal',
				wordSpacing: 'normal',
				width: 'normal',
				weight: 'normal',
				verses: null,
			},
			'light',
		)
		expect(result.toString()).toBe('')
	})

	it('does not mutate the params it was given', () => {
		const params = new URLSearchParams('date=2026-09-27')
		withStoredPreferences(params, { size: 'lg' }, 'dark')
		expect(params.toString()).toBe('date=2026-09-27')
	})
})
