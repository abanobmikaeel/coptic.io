import { describe, expect, it } from 'vitest'
import { getAgpeyaHour, getAvailableTranslations } from '../../services/agpeya.service'

describe('Spanish Agpeya service', () => {
	it('advertises Spanish as complete prose', () => {
		expect(getAvailableTranslations()).toContain('es')
	})

	it('serves the embedded LXX-numbered Spanish psalter by default', () => {
		const prime = getAgpeyaHour('prime', 'es')
		if (!prime || 'watches' in prime) throw new Error('Spanish Prime is missing')
		expect(prime.name).toBe('Plegaria del Alba')
		expect(prime.psalms).toHaveLength(19)
		expect(prime.psalms[0].reference).toBe('Salmo 1 (LXX)')
		expect(prime.psalms[0].verses[0].text).toContain('bienaventurado')
		expect(prime.psalms[0].verses[0].num).toBeUndefined()
	})

	it('only uses Reina-Valera when the Bible option is requested', () => {
		const liturgical = getAgpeyaHour('prime', 'es', 'septuagint')
		const bible = getAgpeyaHour('prime', 'es', 'bible')
		if (!liturgical || 'watches' in liturgical || !bible || 'watches' in bible) {
			throw new Error('Spanish Prime is missing')
		}
		expect(liturgical.psalms[0].verses[0].text).not.toBe(bible.psalms[0].verses[0].text)
		expect(bible.psalms[0].verses[0].num).toBe(1)
	})

	it('returns localized Midnight watch labels', () => {
		const midnight = getAgpeyaHour('midnight', 'es')
		if (!midnight || !('watches' in midnight)) throw new Error('Spanish Midnight is missing')
		expect(midnight.watches.map(({ name }) => name)).toEqual([
			'Primera Vigilia',
			'Segunda Vigilia',
			'Tercera Vigilia',
		])
	})
})
