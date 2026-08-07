/**
 * The block resolver, and the authoring rules that keep `one` sections honest.
 *
 * See docs/CONDITIONAL-RESOLUTION.md. The cases below are the ones that motivated
 * the mode in the first place, written as the data would express them.
 */
import { describe, expect, it } from 'vitest'
import {
	type LiturgicalConditionalBlock,
	type OccasionContext,
	findOneModeAuthoringErrors,
	resolveBlocks,
} from '../content'
import { getIncenseService, getIncenseServiceTypes } from '../en/incense'

const occasion = (over: Partial<OccasionContext> = {}): OccasionContext => ({
	dayTune: 'adam',
	season: 'waters',
	weekday: 0,
	commemorations: [],
	feasts: [],
	...over,
})

const block = (
	content: string,
	when?: LiturgicalConditionalBlock['when'],
): LiturgicalConditionalBlock => ({ ...(when ? { when } : {}), content: [content] })

describe('resolveBlocks — additive (all)', () => {
	it('includes every matching block, in order', () => {
		const blocks = [
			block('always'),
			block('adam only', { dayTune: 'adam' }),
			block('watos only', { dayTune: 'watos' }),
			block('for martyrs', { commemoration: 'martyrs' }),
		]
		expect(resolveBlocks(blocks, occasion({ commemorations: ['martyrs'] }))).toEqual([
			'always',
			'adam only',
			'for martyrs',
		])
	})

	it('composes independent dimensions — a feast on a Sunday contributes both', () => {
		const blocks = [block('sunday', { weekday: 0 }), block('nativity', { feast: 'nativity' })]
		expect(resolveBlocks(blocks, occasion({ weekday: 0, feasts: ['nativity'] }))).toEqual([
			'sunday',
			'nativity',
		])
	})
})

describe('resolveBlocks — exclusive (one)', () => {
	// The case the mode exists for: Theophany is *also* a Lord's feast, so the two
	// conditions overlap and additive resolution would print two fraction prayers.
	const fractions = [
		block('theophany fraction', { feast: 'theophany' }),
		block('lordly feast fraction', { feast: ['nativity', 'theophany', 'resurrection'] }),
		block('annual fraction'),
	]

	it('takes the most specific match when conditions overlap', () => {
		expect(resolveBlocks(fractions, occasion({ feasts: ['theophany'] }), 'one')).toEqual([
			'theophany fraction',
		])
	})

	it('falls through to the next match when the most specific does not apply', () => {
		expect(resolveBlocks(fractions, occasion({ feasts: ['nativity'] }), 'one')).toEqual([
			'lordly feast fraction',
		])
	})

	it('falls back to the unconditioned default', () => {
		expect(resolveBlocks(fractions, occasion(), 'one')).toEqual(['annual fraction'])
	})

	it('is what distinguishes the two modes on the same data', () => {
		const ctx = occasion({ feasts: ['theophany'] })
		expect(resolveBlocks(fractions, ctx, 'all')).toHaveLength(3)
		expect(resolveBlocks(fractions, ctx, 'one')).toHaveLength(1)
	})
})

describe('one-mode authoring rules', () => {
	it('accepts blocks ordered most-specific-first with a default last', () => {
		expect(
			findOneModeAuthoringErrors('fraction', [
				block('specific', { feast: 'theophany' }),
				block('broader', { season: 'waters' }),
				block('default'),
			]),
		).toEqual([])
	})

	it('rejects an unconditioned block that is not last — it hides its successors', () => {
		const errors = findOneModeAuthoringErrors('fraction', [
			block('default too early'),
			block('never reached', { feast: 'theophany' }),
		])
		expect(errors).toHaveLength(2) // unreachable successors, and no trailing default
		expect(errors[0]).toMatch(/unreachable/)
	})

	it('rejects a section with no default, which could resolve to nothing', () => {
		const errors = findOneModeAuthoringErrors('fraction', [
			block('only on theophany', { feast: 'theophany' }),
		])
		expect(errors).toHaveLength(1)
		expect(errors[0]).toMatch(/unconditioned default/)
	})

	it('is vacuous for an empty block list', () => {
		expect(findOneModeAuthoringErrors('fraction', [])).toEqual([])
	})
})

describe('shipped data obeys the authoring rules', () => {
	// Nothing ships `one` yet — the fraction prayers are the first real use. This
	// guards the moment something does, rather than after the data lands.
	it('every one-mode section is ordered correctly', () => {
		for (const serviceType of getIncenseServiceTypes()) {
			for (const section of getIncenseService(serviceType).sections) {
				// Only prose sections carry blocks; psalm and gospel sections resolve from
				// the day's readings instead.
				if (!('blocks' in section) || !section.blocks || section.mode !== 'one') continue
				expect(findOneModeAuthoringErrors(`${serviceType}.${section.id}`, section.blocks)).toEqual(
					[],
				)
			}
		}
	})
})
