/**
 * How a spoken line is stored, shared by every service that prints one.
 *
 * The Incense and Liturgy modules each declared these independently and
 * identically. Beyond the duplication, the per-language barrels `export *` from
 * both, and two same-named declarations from different modules are ambiguous —
 * re-exporting one shared declaration is not.
 */

/** Who says the line. Sections prayed by everyone store a plain string instead. */
export type ContentSpeaker = 'Priest' | 'Deacon' | 'People'

export interface ContentLine {
	speaker?: ContentSpeaker
	text: string
	/** A staging direction rather than text to pray — rendered, but never aligned across languages. */
	isRubric?: boolean
}
