/**
 * The primitives every liturgical service shares: how a line is stored, who says
 * it, what kind of part a section is, and how a section that varies by occasion
 * is expressed.
 *
 * These began inside the Incense module and are not incense-specific. The Liturgy
 * had redeclared several of them identically, which the per-language barrels then
 * re-exported ambiguously. Declared once here, the Incense, Liturgy and Tasbeha
 * modules re-export the same symbols instead of competing declarations.
 *
 * See docs/CONDITIONAL-RESOLUTION.md for what these are building toward.
 */

/** Who says the line. Sections prayed by everyone store a plain string instead. */
export type ContentSpeaker = 'Priest' | 'Deacon' | 'People'

export interface ContentLine {
	speaker?: ContentSpeaker
	text: string
	/** A staging direction rather than text to pray — rendered, but never aligned across languages. */
	isRubric?: boolean
}

/** A line is either prayed by everyone (plain string) or attributed to a speaker. */
export type LiturgicalContent = string | ContentLine

/** Who a section belongs to in the rite. */
export type LiturgicalSectionRole = 'all' | 'priest' | 'deacon' | 'congregation'

/**
 * What a section varies by.
 *
 * Two vocabularies in one object: the calendar half is derived from the date by
 * the resolver, the service half is supplied by the caller — a parish setting or a
 * reader choice, not a fact about the day. Authors write them together; only the
 * resolver cares where each value came from.
 */
export interface LiturgicalCondition {
	// ── Calendar ──
	dayTune?: 'adam' | 'watos'
	/**
	 * Agricultural season of the Litany for the Nature, resolved from the Coptic date:
	 * waters (Paoni 12 – Paopi 9), plants (Paopi 10 – Tobi 10), fruits (Tobi 11 – Paoni 11)
	 */
	season?: 'waters' | 'plants' | 'fruits'
	/** Weekday(s) of the liturgical day the service belongs to (0 = Sunday … 6 = Saturday). */
	weekday?: number | number[]
	commemoration?: string | string[]
	feast?: string | string[]
}

/**
 * How a section's blocks combine.
 *
 * `all` is the default and the common case: every matching block is included, in
 * order. Composition is the point — a saint's verses and a feast's verses both
 * appear because both matched — and exclusivity needs no mechanism where the
 * conditions are themselves exclusive, as with Adam and Watos.
 *
 * `one` is for slots that must yield exactly one where the conditions *overlap*
 * and so cannot be made exclusive. The Fraction prayer is chosen from thirteen
 * occasions, and Theophany is also a Lord's feast: under `all` both would print.
 * Blocks are authored most-specific-first and the first match wins.
 */
export type ResolutionMode = 'all' | 'one'

export interface LiturgicalConditionalBlock {
	/** Absent ⇒ always matches. In a `one` section this marks the default, and must come last. */
	when?: LiturgicalCondition
	/**
	 * Localized display title, used when the block is surfaced standalone — e.g. an
	 * out-of-season nature litany offered as an optional extra ("Litany of the Waters").
	 */
	title?: string
	content: LiturgicalContent[]
}
