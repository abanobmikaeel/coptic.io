import { describe, expect, it } from 'vitest'
import {
	filterFeastsOnly,
	filterUpcomingFasts,
	filterUpcomingFeasts,
} from '../filterUpcomingFeasts'

// The deprecated `type` is deliberately misleading here: grouping must follow `category`
const upcoming = [
	{
		date: '2027-01-06',
		celebrations: [{ name: 'Advent Fast', type: 'feast', category: 'fast' }],
	},
	{
		date: '2027-01-07',
		celebrations: [
			{ name: 'Advent Fast', type: 'feast', category: 'fast' },
			{ name: 'Nativity Feast', type: 'feast', category: 'majorFeast' },
		],
	},
	{
		date: '2027-01-08',
		celebrations: [{ name: 'Advent Fast', type: 'feast', category: 'fast' }],
	},
]

describe('filterUpcomingFeasts', () => {
	it('keeps feasts and shows only the first and last day of a fast', () => {
		const labels = filterUpcomingFeasts(upcoming).map((e) => e.displayName ?? e.name)

		expect(labels).toEqual(['Advent Fast begins', 'Nativity Feast', 'Advent Fast ends'])
	})
})

describe('filterUpcomingFasts', () => {
	it('returns only the start and end of each fast', () => {
		const fasts = filterUpcomingFasts(upcoming)

		expect(fasts.map((e) => [e.date, e.displayName])).toEqual([
			['2027-01-06', 'Advent Fast begins'],
			['2027-01-08', 'Advent Fast ends'],
		])
	})
})

describe('filterFeastsOnly', () => {
	it('drops fasts by category', () => {
		const feasts = filterFeastsOnly(filterUpcomingFeasts(upcoming))

		expect(feasts.map((e) => e.name)).toEqual(['Nativity Feast'])
	})
})
