import { describe, expect, it } from 'vitest'
import { getAgpeyaHourIds, getAgpeyaHourData as getEnglishHour } from '../en/agpeya'
import {
	getAgpeyaHourData as getSpanishHour,
	getAgpeyaHourIds as getSpanishIds,
} from '../es/agpeya'

describe('Spanish Agpeya data', () => {
	it('covers every canonical hour and Midnight watch', () => {
		expect(getSpanishIds()).toEqual(getAgpeyaHourIds())
		const midnight = getSpanishHour('midnight')
		expect(midnight && 'watches' in midnight ? midnight.watches.map(({ id }) => id) : []).toEqual([
			'midnight-1',
			'midnight-2',
			'midnight-3',
		])
	})

	it('localizes Midnight structure without leaking English metadata', () => {
		const midnight = getSpanishHour('midnight')
		if (!midnight || !('watches' in midnight)) throw new Error('Spanish Midnight is missing')
		expect(midnight.watches.map(({ name }) => name)).toEqual([
			'Primera Vigilia',
			'Segunda Vigilia',
			'Tercera Vigilia',
		])
		expect(midnight.watches.map(({ theme }) => theme).join(' ')).not.toMatch(
			/Watchfulness|Repentance|Judgment/,
		)
		expect(
			midnight.watches
				.flatMap(({ psalmRefs }) => psalmRefs)
				.every(({ title, rubric, note }) => title?.startsWith('Salmo ') && !rubric && !note),
		).toBe(true)
	})

	it('preserves each LXX psalm sequence with embedded Spanish text', () => {
		for (const hourId of getAgpeyaHourIds()) {
			const en = getEnglishHour(hourId)
			const es = getSpanishHour(hourId)
			expect(es, hourId).not.toBeNull()
			if (!en || !es) continue
			if ('watches' in en && 'watches' in es) {
				for (const [index, watch] of es.watches.entries()) {
					expect(watch.psalmRefs.map(({ psalmNumber }) => psalmNumber)).toEqual(
						en.watches[index].psalmRefs.map(({ psalmNumber }) => psalmNumber),
					)
					expect(watch.psalms).toHaveLength(watch.psalmRefs.length)
					expect(
						watch.psalms?.every(({ verses }) => verses.some(({ text }) => text.length > 0)),
					).toBe(true)
				}
			} else if (!('watches' in en) && !('watches' in es)) {
				expect(es.psalmRefs.map(({ psalmNumber }) => psalmNumber)).toEqual(
					en.psalmRefs.map(({ psalmNumber }) => psalmNumber),
				)
				expect(es.psalms).toHaveLength(es.psalmRefs.length)
			}
		}
	})

	it('does not invent verse labels absent from the printed edition', () => {
		const prime = getSpanishHour('prime')
		expect(prime && !('watches' in prime) ? prime.psalms : []).not.toHaveLength(0)
		if (!prime || 'watches' in prime) return
		expect(prime.psalms?.every(({ verses }) => verses.every(({ num }) => num == null))).toBe(true)
		expect(prime.introductoryPsalmText?.reference).toBe('Salmo 50 (LXX)')
	})

	it('contains sourced Spanish prose and Gospel text without English fallback', () => {
		const prime = getSpanishHour('prime')
		if (!prime || 'watches' in prime) throw new Error('Spanish Prime is missing')
		expect(prime.opening.content.join(' ')).toContain('En el nombre del Padre')
		expect(prime.thanksgiving?.content.join(' ')).toContain('Demos gracias a Dios')
		expect(prime.gospel?.verses.map(({ text }) => text).join(' ')).toContain('En el principio')
		expect(prime.closing.content.join(' ')).not.toMatch(/\b(the|and|Lord)\b/)
	})
})
