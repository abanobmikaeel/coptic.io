export type Speaker = 'Priest' | 'Deacon' | 'People'

export interface FlatLine {
	text: string
	speaker?: Speaker
	isRubric: boolean
	isNewSpeakerGroup: boolean
	// A congregational response (the Doxa / Ke-nin) that sits between the petitions
	// of a litany. The reader prays it in one form or the other, so the vernacular
	// translation is `text` and the Coptic transliteration (shown beneath, prefixed
	// "or") rides in `responseCoptic`. Styled distinctly from the petitions.
	isResponse: boolean
	responseCoptic?: string
	// Verse number for scripture lines (psalm/gospel); rendered as a gutter.
	num?: number
}

// The fixed liturgical responses that recur inside the litanies, as Coptic
// transliterations. A transliteration line is paired with the vernacular line that
// follows it into a single response.
const COPTIC_RESPONSE_PATTERNS = [
	/^Dthoxa Patri/i,
	/^Ke neen ke a-ee/i,
	/^\u0630\u0648\u0643\u0635\u0627\u0628\u062a\u0631\u064a/, // ذوكصابتري (Doxa)
	/^\u0643\u064a \u0646\u064a\u0646/, // كي نين (Ke nin)
	/^\u0643\u064a \u0622 \u0625\u064a/, // كي آ إي (ke a ee)
]

// The vernacular translations of the same responses, when they appear on their own.
const VERNACULAR_RESPONSE_PATTERNS = [
	/^Glory to the Father and the Son and the Holy Spirit\.?$/i,
	/^Now and forever and unto the age of all ages\.?\s*Amen\.?$/i,
	/^\u0627\u0644\u0645\u062c\u062f \u0644\u0644\u0622\u0628/, // المجد للآب (Glory be)
	/^\u0627\u0644\u0622\u0646 \u0648\u0643\u0644 \u0623\u0648\u0627\u0646/, // الآن وكل أوان (Now and forever)
]

const isCopticResponse = (text: string): boolean => {
	const t = text.trim()
	return COPTIC_RESPONSE_PATTERNS.some((re) => re.test(t))
}
const isVernacularResponse = (text: string): boolean => {
	const t = text.trim()
	return VERNACULAR_RESPONSE_PATTERNS.some((re) => re.test(t))
}

export interface LiturgicalLine {
	speaker?: Speaker
	text: string
	isRubric?: boolean
}

export type LiturgicalContent = string | LiturgicalLine

// Flattens content into individual lines, propagating speaker context to following
// plain-string lines so each line knows who is speaking even without explicit attribution.
// A Coptic response line and the vernacular line that follows it collapse into one
// response (translation as `text`, transliteration as `responseCoptic`).
export function flattenToLines(content: LiturgicalContent[]): FlatLine[] {
	const texts = content.map((item) => (typeof item === 'string' ? item : item.text))
	const result: FlatLine[] = []
	let currentSpeaker: Speaker | undefined
	for (let i = 0; i < content.length; i++) {
		const item = content[i]
		const raw = typeof item === 'string' ? item : item.text
		const trimmed = raw.trim()

		// A Coptic transliteration directly followed by its vernacular translation
		// becomes a single bilingual response.
		if (isCopticResponse(trimmed) && isVernacularResponse(texts[i + 1] ?? '')) {
			result.push({
				text: (texts[i + 1] ?? '').trim(),
				responseCoptic: trimmed,
				speaker: currentSpeaker,
				isRubric: false,
				isNewSpeakerGroup: false,
				isResponse: true,
			})
			i++ // consume the vernacular line
			continue
		}

		if (typeof item === 'string') {
			result.push({
				text: item,
				speaker: currentSpeaker,
				isRubric: false,
				isNewSpeakerGroup: false,
				isResponse: isVernacularResponse(item),
			})
		} else {
			const isNew = item.speaker !== undefined && item.speaker !== currentSpeaker
			if (item.speaker !== undefined) currentSpeaker = item.speaker
			result.push({
				text: item.text,
				speaker: item.speaker ?? currentSpeaker,
				isRubric: item.isRubric ?? false,
				isNewSpeakerGroup: isNew,
				isResponse: isVernacularResponse(item.text),
			})
		}
	}
	return result
}
