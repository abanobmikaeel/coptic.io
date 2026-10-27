import { describe, expect, it } from 'vitest'
import { buildOccasion, toCommemorationKey } from '../../services/occasion'

const local = (y: number, m: number, d: number) => new Date(y, m - 1, d)

describe('toCommemorationKey', () => {
	it('slugifies a celebration name', () => {
		expect(toCommemorationKey('Wedding of Cana of Galilee Feast')).toBe(
			'wedding-of-cana-of-galilee-feast',
		)
		expect(toCommemorationKey("  Apostles' Fast ")).toBe('apostles-fast')
	})
})

describe('buildOccasion', () => {
	it('carries the calendar facts of the day', () => {
		// Pascha 2026 is a Sunday.
		const easter = buildOccasion(local(2026, 4, 12))
		expect(easter.festiveSeason).toBe('resurrection')
		expect(easter.weekday).toBe(0)
		expect(easter.dayTune).toBe('adam')
	})

	it('names the fixed feasts from the celebration calendar', () => {
		// Tobi 6: the Circumcision closes the Nativity season.
		const circumcision = buildOccasion(local(2026, 1, 14))
		expect(circumcision.festiveSeason).toBe('nativity')
		expect(circumcision.feasts).toContain('circumcision-feast')

		// Tobi 13: Cana closes the Theophany season.
		const cana = buildOccasion(local(2026, 1, 21))
		expect(cana.festiveSeason).toBe('theophany')
		expect(cana.feasts).toContain('wedding-of-cana-of-galilee-feast')
	})

	it('joins the moveable feasts, but not the moveable fasts', () => {
		const pentecost = buildOccasion(local(2026, 5, 31))
		expect(pentecost.festiveSeason).toBe('ascension')
		expect(pentecost.feasts).toContain('pentecost')

		// Great Lent begins on a Monday 55 days before Pascha: a fast, not a feast.
		expect(buildOccasion(local(2026, 2, 16)).feasts).not.toContain('great-lent')
	})

	it('composes the reader’s commemorations on top of the calendar’s', () => {
		const ordinary = buildOccasion(local(2026, 10, 26))
		expect(ordinary.festiveSeason).toBeNull()
		const withPatron = buildOccasion(local(2026, 10, 26), ['martyrs'])
		expect(withPatron.commemorations).toEqual([...ordinary.commemorations, 'martyrs'])
	})
})
