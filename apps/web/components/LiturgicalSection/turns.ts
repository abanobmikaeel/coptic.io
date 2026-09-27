export type Speaker = 'Priest' | 'Deacon' | 'People'

export interface FlatLine {
	text: string
	speaker?: Speaker
	isRubric: boolean
	isNewSpeakerGroup: boolean
	// A congregational response (the Doxa / Ke-nin) that sits between the petitions
	// of a litany. The reader prays it in one form or the other, so the vernacular
	// translation is `text` and the Coptic script rides in `responseCoptic`, shown
	// beneath. Styled distinctly from the petitions.
	isResponse: boolean
	responseCoptic?: string
	// Verse number for scripture lines (psalm/gospel); rendered as a gutter.
	num?: number
}

export interface LiturgicalLine {
	speaker?: Speaker
	text: string
	isRubric?: boolean
	// Marked in the data; the reader never infers a response from the text.
	isResponse?: boolean
	coptic?: string
}

export type LiturgicalContent = string | LiturgicalLine

// Flattens content into individual lines, propagating speaker context to following
// plain-string lines so each line knows who is speaking even without explicit attribution.
export function flattenToLines(content: LiturgicalContent[]): FlatLine[] {
	const result: FlatLine[] = []
	let currentSpeaker: Speaker | undefined
	for (const item of content) {
		if (typeof item === 'string') {
			result.push({
				text: item,
				speaker: currentSpeaker,
				isRubric: false,
				isNewSpeakerGroup: false,
				isResponse: false,
			})
			continue
		}
		const isNew = item.speaker !== undefined && item.speaker !== currentSpeaker
		if (item.speaker !== undefined) currentSpeaker = item.speaker
		result.push({
			text: item.text,
			speaker: item.speaker ?? currentSpeaker,
			isRubric: item.isRubric ?? false,
			isNewSpeakerGroup: isNew,
			isResponse: item.isResponse ?? false,
			...(item.coptic ? { responseCoptic: item.coptic } : {}),
		})
	}
	return result
}
