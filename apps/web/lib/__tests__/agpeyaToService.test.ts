import { describe, expect, it } from 'vitest'
import { type ResolvedAgpeyaHour, agpeyaToService } from '../agpeyaToService'
import type { CopticDate } from '../types'

const copticDate = { dateString: 'Tout 16, 1743' } as CopticDate
const verse = (text: string) => [{ num: 1, text }]

const hour: ResolvedAgpeyaHour = {
	id: 'terce',
	name: 'Terce',
	introduction: 'We pray the Third Hour…',
	psalmsIntro: 'From the Psalms of our father David…',
	sections: [
		{ id: 'opening', kind: 'opening', content: ['In the name of the Father…'] },
		{
			id: 'psalm-50',
			kind: 'intro-psalm',
			title: 'Psalm 50',
			reference: 'Psalm 50',
			verses: verse('Have mercy…'),
		},
		{
			id: 'terce-psalm-19',
			kind: 'psalm',
			title: 'Psalm 19',
			reference: 'Psalm 19',
			verses: verse('May the Lord…'),
		},
		{
			id: 'terce-psalm-22',
			kind: 'psalm',
			title: 'Psalm 22',
			reference: 'Psalm 22',
			verses: verse('The Lord shepherds me…'),
		},
		{
			id: 'terce-gospel',
			kind: 'gospel',
			reference: 'John 14:26-31',
			verses: verse('But the Helper…'),
		},
		{
			id: 'terce-gospel-2',
			kind: 'gospel',
			reference: 'John 15:26-16:15',
			verses: verse('But when the Helper comes…'),
		},
		{
			id: 'gospel-conclusion',
			kind: 'gospel-conclusion',
			title: 'Gospel Conclusion',
			content: ['Glory to God forever. Amen.'],
		},
		{ id: 'terce-litany', kind: 'litany', content: ['O Heavenly King…'] },
		{
			id: 'kyrie41',
			kind: 'conclusion',
			title: 'Lord Have Mercy (41 times)',
			content: ['Lord have mercy.'],
		},
		{
			id: 'terce-absolution',
			kind: 'conclusion',
			title: 'Absolution',
			content: ['O God of all compassion…'],
		},
	],
}

describe('agpeyaToService', () => {
	it('renders every section in the order the API sends it', () => {
		const ids = agpeyaToService(hour, '2026-09-26', copticDate).sections.map((s) => s.id)
		expect(ids).toEqual(hour.sections.map((s) => s.id))
	})

	it('keeps both of Terce’s gospels', () => {
		const sections = agpeyaToService(hour, '2026-09-26', copticDate).sections
		expect(sections.filter((s) => s.type === 'gospel').map((s) => s.reference)).toEqual([
			'John 14:26-31',
			'John 15:26-16:15',
		])
	})

	it('shows the hour’s introduction on the opening and the psalms intro on its first psalm', () => {
		const sections = agpeyaToService(hour, '2026-09-26', copticDate).sections
		expect(sections.find((s) => s.id === 'opening')?.rubric).toBe('We pray the Third Hour…')
		expect(sections.find((s) => s.id === 'psalm-50')?.rubric).toBeUndefined()
		expect(sections.find((s) => s.id === 'terce-psalm-19')?.rubric).toBe(
			'From the Psalms of our father David…',
		)
		expect(sections.find((s) => s.id === 'terce-psalm-22')?.rubric).toBeUndefined()
	})

	it('titles each section as the data names it, naming untitled ones by kind', () => {
		const sections = agpeyaToService(hour, '2026-09-26', copticDate).sections
		expect(sections.find((s) => s.id === 'terce-absolution')?.title).toBe('Absolution')
		expect(sections.find((s) => s.id === 'opening')?.title).toBe('Opening Prayer')
		expect(sections.find((s) => s.id === 'terce-litany')).toMatchObject({
			type: 'litany',
			title: 'Litanies',
		})
	})

	it('keeps only psalms and gospels when only scripture is shown (Coptic column)', () => {
		const sections = agpeyaToService(hour, '2026-09-26', copticDate, {
			scriptureOnly: true,
		}).sections
		expect(sections.map((s) => s.type)).toEqual(['psalm', 'psalm', 'psalm', 'gospel', 'gospel'])
	})
})

const midnight: ResolvedAgpeyaHour = {
	id: 'midnight',
	name: 'Midnight',
	sections: [
		{ id: 'midnight-opening', kind: 'opening', content: ['In the name of the Father…'] },
		{
			id: 'midnight-1',
			kind: 'watch',
			title: 'First Watch',
			theme: 'Watchfulness and Vigilance',
			prayer: 'The praise of the first watch…',
			psalmsIntro: 'From the Psalms…',
			psalmsRubric: 'All the psalms of Vespers are prayed…',
			sections: [
				{
					id: 'psalm-3',
					kind: 'psalm',
					title: 'Psalm 3',
					reference: 'Psalm 3',
					verses: verse('O Lord…'),
				},
				{ id: 'midnight-1-litany', kind: 'litany', content: ['Behold the Bridegroom…'] },
				{
					id: 'kyrie41',
					kind: 'conclusion',
					title: 'Lord Have Mercy (41 times)',
					content: ['Lord have mercy.'],
				},
				{
					id: 'lords-prayer',
					kind: 'lords-prayer',
					title: "The Lord's Prayer",
					content: ['Our Father…'],
				},
			],
		},
		// Midnight prays Kyrie and Holy Holy Holy twice in its ending.
		{
			id: 'kyrie41',
			kind: 'conclusion',
			title: 'Lord Have Mercy (41 times)',
			content: ['Lord have mercy.'],
		},
		{
			id: 'holy-holy-holy',
			kind: 'conclusion',
			title: 'Holy, Holy, Holy',
			content: ['Holy Holy Holy…'],
		},
		{
			id: 'midnight-gospel-2',
			kind: 'gospel',
			reference: 'Luke 2:29-32',
			verses: verse('Lord, now You are letting…'),
		},
		{
			id: 'kyrie41',
			kind: 'conclusion',
			title: 'Lord Have Mercy (41 times)',
			content: ['Lord have mercy.'],
		},
		{
			id: 'holy-holy-holy',
			kind: 'conclusion',
			title: 'Holy, Holy, Holy',
			content: ['Holy Holy Holy…'],
		},
	],
}

describe('agpeyaToService — midnight', () => {
	it('opens each watch with a heading carrying its theme and psalms intro', () => {
		const heading = agpeyaToService(midnight, '2026-09-26', copticDate).sections.find(
			(s) => s.id === 'watch-midnight-1',
		)
		expect(heading).toMatchObject({
			title: 'First Watch',
			rubric: 'Watchfulness and Vigilance',
			content: ['The praise of the first watch…', 'From the Psalms…'],
		})
	})

	it('shows which psalms are prayed on the watch’s first psalm only', () => {
		const sections = agpeyaToService(midnight, '2026-09-26', copticDate).sections
		expect(sections.find((s) => s.id === 'watch-midnight-1-psalm-3')?.rubric).toBe(
			'All the psalms of Vespers are prayed…',
		)
		expect(
			sections.find((s) => s.id === 'watch-midnight-1-midnight-1-litany')?.rubric,
		).toBeUndefined()
	})

	it('scopes a watch’s sections to the watch, so shared prayers stay distinct', () => {
		const ids = agpeyaToService(midnight, '2026-09-26', copticDate).sections.map((s) => s.id)
		expect(ids.slice(1, 6)).toEqual([
			'watch-midnight-1',
			'watch-midnight-1-psalm-3',
			'watch-midnight-1-midnight-1-litany',
			'watch-midnight-1-kyrie41',
			'watch-midnight-1-lords-prayer',
		])
	})

	it('gives every section a unique id, suffixing repeated prayers in the ending', () => {
		const ids = agpeyaToService(midnight, '2026-09-26', copticDate).sections.map((s) => s.id)
		expect(new Set(ids).size).toBe(ids.length)
		expect(ids.slice(ids.indexOf('kyrie41'))).toEqual([
			'kyrie41',
			'holy-holy-holy',
			'midnight-gospel-2',
			'kyrie41-2',
			'holy-holy-holy-2',
		])
	})

	it('renders the ending gospel as scripture', () => {
		const gospel = agpeyaToService(midnight, '2026-09-26', copticDate).sections.find(
			(s) => s.id === 'midnight-gospel-2',
		)
		expect(gospel).toMatchObject({ type: 'gospel', reference: 'Luke 2:29-32' })
	})
})
