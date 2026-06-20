import { describe, expect, it } from 'vitest'
import { resolvePsalm } from '../../services/psalm-resolver'

describe('LXX Psalm resolution', () => {
	it.each([
		[114, 9],
		[115, 10],
		[116, 2],
		[146, 11],
		[147, 9],
	])('resolves LXX Psalm %i to the correct Masoretic segment', (psalmNumber, verseCount) => {
		const psalm = resolvePsalm({ psalmNumber }, 'en')
		expect(psalm?.verses).toHaveLength(verseCount)
		expect(psalm?.verses.map((verse) => verse.num)).toEqual(
			Array.from({ length: verseCount }, (_, index) => index + 1),
		)
	})

	it('applies ranges after rebuilding the LXX verse sequence', () => {
		const psalm = resolvePsalm({ psalmNumber: 115, startVerse: 2, endVerse: 4 }, 'en')
		expect(psalm?.verses.map((verse) => verse.num)).toEqual([2, 3, 4])
	})
})
