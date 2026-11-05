import { describe, expect, it } from 'vitest'
import { synaxariumCanonical as ar } from '../ar/synaxarium'
import { synaxariumCanonical as en } from '../en/synaxarium'

type Day = { name: string; text?: string; id?: string }[]

const arabic = ar as Record<string, Day>
const english = en as Record<string, Day>

describe('Synaxarium data', () => {
	it('covers the same days in Arabic and English', () => {
		expect(Object.keys(arabic).sort()).toEqual(Object.keys(english).sort())
	})

	it('has an entry on every day of both languages', () => {
		const emptyDays = (days: Record<string, Day>) =>
			Object.keys(days).filter((key) => !days[key]?.length)
		expect(emptyDays(arabic)).toEqual([])
		expect(emptyDays(english)).toEqual([])
	})

	it('keeps Arabic names and text in Arabic', () => {
		const inArabic = /[؀-ۿ]/
		const leaked = Object.entries(arabic).flatMap(([key, day]) =>
			day
				.filter((entry) => !inArabic.test(entry.name) || !inArabic.test(entry.text ?? ''))
				.map(() => key),
		)
		expect(leaked).toEqual([])
	})

	it('links Baba 13 to its English entry', () => {
		expect(arabic['13 Baba']?.map((entry) => entry.id)).toEqual(
			english['13 Baba']?.map((entry) => entry.id),
		)
	})
})
