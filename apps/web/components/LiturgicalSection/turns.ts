export type Speaker = 'Priest' | 'Deacon' | 'People'

export interface FlatLine {
	text: string
	speaker?: Speaker
	isRubric: boolean
	isNewSpeakerGroup: boolean
	// Verse number for scripture lines (psalm/gospel); rendered as a gutter.
	num?: number
	// A padding line inserted to keep columns aligned where one language has a rubric the
	// others lack (Coptic carries none). Rendered invisibly, occupying the rubric's height.
	isSpacer?: boolean
}

export interface LiturgicalLine {
	speaker?: Speaker
	text: string
	isRubric?: boolean
}

export type LiturgicalContent = string | LiturgicalLine

export interface Turn {
	speaker?: Speaker
	lines: LiturgicalContent[]
}

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

// Align per-language line arrays so rubric lines occupy the same logical index across
// languages. Coptic carries no rubrics, so wherever another language has one it would shift
// that column's prayer lines out of step (pagination slices every column by a shared index).
// Each language that lacks a rubric at a given step gets an invisible spacer instead — sized
// from the rubric's own text — keeping the prayer rows lined up.
//
// Relies on the data invariant (enforced by the parity test) that the non-rubric line
// sequence is identical across languages; only rubric placement differs.
export function alignByRubric(
	byLang: Record<string, FlatLine[]>,
	langs: string[],
): Record<string, FlatLine[]> {
	if (langs.length < 2) return byLang
	const ptr: Record<string, number> = {}
	const out: Record<string, FlatLine[]> = {}
	for (const l of langs) {
		ptr[l] = 0
		out[l] = []
	}

	const more = () => langs.some((l) => ptr[l] < byLang[l].length)
	while (more()) {
		const rubricLangs = langs.filter((l) => byLang[l][ptr[l]]?.isRubric)
		if (rubricLangs.length > 0) {
			const refText = byLang[rubricLangs[0]][ptr[rubricLangs[0]]].text
			for (const l of langs) {
				if (byLang[l][ptr[l]]?.isRubric) {
					out[l].push(byLang[l][ptr[l]])
					ptr[l]++
				} else {
					out[l].push({ text: refText, isRubric: true, isSpacer: true, isNewSpeakerGroup: false })
				}
			}
		} else {
			for (const l of langs) {
				const line = byLang[l][ptr[l]]
				if (line) {
					out[l].push(line)
					ptr[l]++
				} else {
					out[l].push({ text: '', isRubric: false, isSpacer: true, isNewSpeakerGroup: false })
				}
			}
		}
	}
	return out
}

// Groups consecutive content lines into speaker turns.
// A new labeled line always starts a new turn; unlabeled lines continue the current turn.
export function groupByTurns(content: LiturgicalContent[]): Turn[] {
	const turns: Turn[] = []
	let current: Turn | null = null
	for (const line of content) {
		const speaker = typeof line === 'object' ? line.speaker : undefined
		if (speaker !== undefined) {
			if (current) turns.push(current)
			current = { speaker, lines: [line] }
		} else if (!current) {
			current = { speaker: undefined, lines: [line] }
		} else {
			current.lines.push(line)
		}
	}
	if (current) turns.push(current)
	return turns
}
