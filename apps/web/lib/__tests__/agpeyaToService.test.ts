import { describe, expect, it } from 'vitest'
import { type ResolvedAgpeyaHour, agpeyaToService } from '../agpeyaToService'
import type { CopticDate } from '../types'

const copticDate = { dateString: 'Tout 16, 1743' } as CopticDate

const hour: ResolvedAgpeyaHour = {
	id: 'terce',
	name: 'Terce',
	opening: { content: ['In the name of the Father…'] },
	psalms: [
		{ title: 'Psalm 19', reference: 'Psalm 19', verses: [{ num: 1, text: 'May the Lord…' }] },
	],
	gospel: { reference: 'John 14:26-31', verses: [{ num: 26, text: 'But the Helper…' }] },
	litanies: { content: ['O Heavenly King…'] },
	conclusion: [
		{ id: 'kyrie41', title: 'Lord Have Mercy (41 times)', content: ['Lord have mercy.'] },
		{ id: 'holy-holy-holy', title: 'Holy, Holy, Holy', content: ['Holy Holy Holy…'] },
		{ id: 'terce-absolution', title: 'Absolution', content: ['O God of all compassion…'] },
		{
			id: 'conclusion-of-every-hour',
			title: 'Conclusion of Every Hour',
			content: ['Have mercy on us…'],
		},
	],
}

describe('agpeyaToService', () => {
	it('renders the concluding prayers after the litanies, in the order the API sends them', () => {
		const ids = agpeyaToService(hour, '2026-09-26', copticDate).sections.map((s) => s.id)

		expect(ids.slice(ids.indexOf('litanies'))).toEqual([
			'litanies',
			'kyrie41',
			'holy-holy-holy',
			'terce-absolution',
			'conclusion-of-every-hour',
		])
	})

	it('keeps each concluding prayer titled as the data names it', () => {
		const sections = agpeyaToService(hour, '2026-09-26', copticDate).sections
		expect(sections.find((s) => s.id === 'terce-absolution')?.title).toBe('Absolution')
	})

	it('drops the concluding prose when only scripture is shown (Coptic column)', () => {
		const sections = agpeyaToService(hour, '2026-09-26', copticDate, {
			scriptureOnly: true,
		}).sections
		expect(sections.map((s) => s.type)).toEqual(['psalm', 'gospel'])
	})
})
