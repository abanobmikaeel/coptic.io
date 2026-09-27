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

const midnight: ResolvedAgpeyaHour = {
	id: 'midnight',
	name: 'Midnight',
	opening: { content: ['In the name of the Father…'] },
	watches: [
		{
			id: 'midnight-1',
			name: 'First Watch',
			psalms: [{ title: 'Psalm 3', reference: 'Psalm 3', verses: [{ num: 1, text: 'O Lord…' }] }],
			litanies: { content: ['Behold the Bridegroom…'] },
			conclusion: [
				{ id: 'kyrie41', title: 'Lord Have Mercy (41 times)', content: ['Lord have mercy.'] },
				{ id: 'lords-prayer', title: "The Lord's Prayer", content: ['Our Father…'] },
			],
		},
	],
	// Midnight prays Kyrie and Holy Holy Holy twice in its ending.
	conclusion: [
		{ id: 'kyrie41', title: 'Lord Have Mercy (41 times)', content: ['Lord have mercy.'] },
		{ id: 'holy-holy-holy', title: 'Holy, Holy, Holy', content: ['Holy Holy Holy…'] },
		{
			id: 'midnight-gospel-2',
			kind: 'gospel',
			content: [],
			reference: 'Luke 2:29-32',
			verses: [{ num: 29, text: 'Lord, now You are letting…' }],
		},
		{ id: 'creed', title: 'The Orthodox Creed', content: ['We believe in one God…'] },
		{ id: 'kyrie41', title: 'Lord Have Mercy (41 times)', content: ['Lord have mercy.'] },
		{ id: 'holy-holy-holy', title: 'Holy, Holy, Holy', content: ['Holy Holy Holy…'] },
	],
}

describe('agpeyaToService — midnight', () => {
	it('gives every section a unique id, suffixing repeated prayers', () => {
		const ids = agpeyaToService(midnight, '2026-09-26', copticDate).sections.map((s) => s.id)
		expect(new Set(ids).size).toBe(ids.length)
		expect(ids.slice(ids.indexOf('kyrie41'))).toEqual([
			'kyrie41',
			'holy-holy-holy',
			'midnight-gospel-2',
			'creed',
			'kyrie41-2',
			'holy-holy-holy-2',
		])
	})

	it("prays each watch's own ending after its litanies, under watch-scoped ids", () => {
		const ids = agpeyaToService(midnight, '2026-09-26', copticDate).sections.map((s) => s.id)
		const litanies = ids.indexOf('watch-midnight-1-litanies')
		expect(ids.slice(litanies, litanies + 3)).toEqual([
			'watch-midnight-1-litanies',
			'watch-midnight-1-kyrie41',
			'watch-midnight-1-lords-prayer',
		])
	})

	it('renders the ending gospel as scripture, in order after the watches', () => {
		const sections = agpeyaToService(midnight, '2026-09-26', copticDate).sections
		const gospel = sections.find((s) => s.id === 'midnight-gospel-2')
		expect(gospel?.type).toBe('gospel')
		expect(gospel?.reference).toBe('Luke 2:29-32')
		expect(gospel?.verses).toHaveLength(1)
	})

	it('keeps the ending gospel in a scripture-only column', () => {
		const sections = agpeyaToService(midnight, '2026-09-26', copticDate, {
			scriptureOnly: true,
		}).sections
		expect(sections.map((s) => s.type)).toEqual(['psalm', 'gospel'])
	})
})
