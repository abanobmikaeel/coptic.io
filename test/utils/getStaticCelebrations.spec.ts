import { getStaticCelebrationsForDay } from '../../src/utils/calculations/getStaticCelebrations'

describe('Get calendar date with celebration on it', () => {
	it('Returns the correct celebration', () => {
		// months are zero based
		expect(getStaticCelebrationsForDay(new Date(2022, 11, 9))).toMatchObject([
			{ id: 4, name: 'Advent Fast', type: 'fast' },
		])
	})
})
