export type Speaker = 'Priest' | 'Deacon' | 'People'

export interface FlatLine {
	text: string
	speaker?: Speaker
	isRubric: boolean
	isNewSpeakerGroup: boolean
	// A congregational response (the Doxa/"Glory be…" or the Ke-nin/"Now and
	// forever…") that sits between the petitions of a litany. Rendered with a
	// distinct, quieter style so it reads as a reply rather than more petition.
	isResponse: boolean
	// Verse number for scripture lines (psalm/gospel); rendered as a gutter.
	num?: number
}

// The fixed liturgical responses that recur inside the litanies. Each merged line
// carries both the transliteration and the translation, so matching on the
// transliteration prefix is enough; the standalone-translation patterns remain
// for data that keeps the two forms on separate lines.
const RESPONSE_PATTERNS = [
	/^Dthoxa Patri/i,
	/^Glory to the Father and the Son and the Holy Spirit\.?$/i,
	/^Ke neen ke a-ee/i,
	/^Now and forever and unto the age of all ages\.?\s*Amen\.?$/i,
	/^\u0630\u0648\u0643\u0635\u0627\u0628\u062a\u0631\u064a/, // ذوكصابتري (Doxa)
	/^\u0627\u0644\u0645\u062c\u062f \u0644\u0644\u0622\u0628/, // المجد للآب (Glory be)
	/^\u0643\u064a \u0646\u064a\u0646/, // كي نين (Ke nin)
	/^\u0643\u064a \u0622 \u0625\u064a/, // كي آ إي (ke a ee)
	/^\u0627\u0644\u0622\u0646 \u0648\u0643\u0644 \u0623\u0648\u0627\u0646/, // الآن وكل أوان (Now and forever)
]

const isResponseLine = (text: string): boolean => {
	const t = text.trim()
	return RESPONSE_PATTERNS.some((re) => re.test(t))
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
				isResponse: isResponseLine(item),
			})
		} else {
			const isNew = item.speaker !== undefined && item.speaker !== currentSpeaker
			if (item.speaker !== undefined) currentSpeaker = item.speaker
			result.push({
				text: item.text,
				speaker: item.speaker ?? currentSpeaker,
				isRubric: item.isRubric ?? false,
				isNewSpeakerGroup: isNew,
				isResponse: isResponseLine(item.text),
			})
		}
	}
	return result
}
