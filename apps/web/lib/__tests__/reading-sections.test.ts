import { describe, expect, it } from 'vitest'
import { getAvailableSections } from '../reading-sections'

describe('getAvailableSections', () => {
	it('orders services as the liturgical day runs: Vespers, Matins, then the Liturgy', () => {
		const { groups } = getAvailableSections(() => true)
		expect(groups.map((g) => g.label)).toEqual(['Vespers', 'Matins', 'Liturgy', 'Evening Prayer'])
	})

	it('lists only sections that have content, and drops services left empty', () => {
		const present = new Set(['VGospel', 'Pauline', 'Synaxarium', 'LGospel'])
		const { groups, allReadings } = getAvailableSections((key) => present.has(key))

		expect(groups.map((g) => g.label)).toEqual(['Vespers', 'Liturgy'])
		expect(allReadings.map((r) => r.key)).toEqual(['VGospel', 'Pauline', 'Synaxarium', 'LGospel'])
	})

	it('keeps the mobile list to the Liturgy readings that are present', () => {
		const present = new Set(['VPsalm', 'Acts', 'LGospel'])
		const { mobileReadings } = getAvailableSections((key) => present.has(key))
		expect(mobileReadings.map((r) => r.key)).toEqual(['Acts', 'LGospel'])
	})
})
