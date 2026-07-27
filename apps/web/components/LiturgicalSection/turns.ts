export type Speaker = 'Priest' | 'Deacon' | 'People'

export interface FlatLine {
	text: string
	speaker?: Speaker
	isRubric: boolean
	isNewSpeakerGroup: boolean
	// Verse number for scripture lines (psalm/gospel); rendered as a gutter.
	num?: number
}

export interface LiturgicalLine {
	speaker?: Speaker
	text: string
	isRubric?: boolean
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
			})
		} else {
			const isNew = item.speaker !== undefined && item.speaker !== currentSpeaker
			if (item.speaker !== undefined) currentSpeaker = item.speaker
			result.push({
				text: item.text,
				speaker: item.speaker ?? currentSpeaker,
				isRubric: item.isRubric ?? false,
				isNewSpeakerGroup: isNew,
			})
		}
	}
	return result
}
