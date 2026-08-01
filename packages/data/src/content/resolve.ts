import type { LiturgicalCondition, LiturgicalConditionalBlock, LiturgicalContent } from './types'

/**
 * The occasion a service is being prayed on — everything a condition can test.
 *
 * Built by the caller: the calendar fields come from the date, `commemorations`
 * composes the day's celebrations with any the reader selected.
 */
export interface OccasionContext {
	dayTune: string
	season: string
	/** Weekday of the liturgical day (0 = Sunday … 6 = Saturday). */
	weekday: number
	commemorations: string[]
	feasts: string[]
}

/**
 * Whether a block applies. An absent condition always matches, which is what makes
 * an unconditioned block the default.
 *
 * Each dimension narrows independently: a condition naming both a `dayTune` and a
 * `feast` applies only where both hold. Array values are "any of".
 */
export function matchesCondition(
	when: LiturgicalCondition | undefined,
	ctx: OccasionContext,
): boolean {
	if (!when) return true
	if (when.dayTune && when.dayTune !== ctx.dayTune) return false
	if (when.season && when.season !== ctx.season) return false
	if (when.weekday != null) {
		const wanted = Array.isArray(when.weekday) ? when.weekday : [when.weekday]
		if (!wanted.includes(ctx.weekday)) return false
	}
	if (when.commemoration) {
		const wanted = Array.isArray(when.commemoration) ? when.commemoration : [when.commemoration]
		if (!wanted.some((w) => ctx.commemorations.includes(w))) return false
	}
	if (when.feast) {
		const wanted = Array.isArray(when.feast) ? when.feast : [when.feast]
		if (!wanted.some((w) => ctx.feasts.includes(w))) return false
	}
	return true
}

/**
 * Additive resolution — every block whose condition matches, in order.
 *
 * Composition is the point: a saint's verses and a feast's verses both appear
 * because both matched. Mutual exclusivity needs no mechanism where the conditions
 * are themselves exclusive, as with Adam and Watos.
 *
 * Slots that must yield exactly one — the Fraction prayer is chosen from thirteen
 * overlapping occasions — need first-match instead. That is Stage 1; see
 * docs/CONDITIONAL-RESOLUTION.md.
 */
export function resolveBlocks(
	blocks: LiturgicalConditionalBlock[],
	ctx: OccasionContext,
): LiturgicalContent[] {
	return blocks.filter((b) => matchesCondition(b.when, ctx)).flatMap((b) => b.content)
}
