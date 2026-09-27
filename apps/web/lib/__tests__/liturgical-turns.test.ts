import { describe, expect, it } from 'vitest'
import { flattenToLines } from '../../components/LiturgicalSection/turns'

const DOXA_COPTIC = 'Ⲇⲟⲝⲁ Ⲡⲁⲧⲣⲓ ⲕⲉ Ⲩ̀ⲓⲱ ⲕⲉ Ⲁ̀ⲅⲓⲱ Ⲡ̀ⲛⲉⲩⲙⲁⲧⲓ:'

describe('flattenToLines responses', () => {
	it('renders a response marked in the data with its Coptic beneath', () => {
		const lines = flattenToLines([
			'If the righteous one is hardly saved…',
			{
				text: 'Glory to the Father and the Son and the Holy Spirit.',
				isResponse: true,
				coptic: DOXA_COPTIC,
			},
		])
		expect(lines).toHaveLength(2)
		expect(lines[0].isResponse).toBe(false)
		expect(lines[1]).toMatchObject({
			text: 'Glory to the Father and the Son and the Holy Spirit.',
			isResponse: true,
			responseCoptic: DOXA_COPTIC,
		})
	})

	it('marks an Arabic response the same way', () => {
		const [line] = flattenToLines([
			{ text: 'المجد للآب والابن والروح القدس', isResponse: true, coptic: DOXA_COPTIC },
		])
		expect(line).toMatchObject({ isResponse: true, responseCoptic: DOXA_COPTIC })
	})

	// Responses come from the data, never from the wording: the doxology closing the
	// Introduction to Every Hour reads like a response but is prayed as prose.
	it('never infers a response from the text', () => {
		const lines = flattenToLines([
			'Glory to the Father and the Son and the Holy Spirit.',
			'المجد للآب والابن والروح القدس الآن وكل أوان وإلى دهر الدهور آمين.',
			DOXA_COPTIC,
		])
		expect(lines.map((l) => l.isResponse)).toEqual([false, false, false])
		expect(lines.every((l) => l.responseCoptic === undefined)).toBe(true)
	})

	it('keeps a speaker running across plain lines', () => {
		const lines = flattenToLines([
			{ speaker: 'Priest', text: 'Let us pray.' },
			'Peace be with all.',
		])
		expect(lines.map((l) => l.speaker)).toEqual(['Priest', 'Priest'])
		expect(lines.map((l) => l.isNewSpeakerGroup)).toEqual([true, false])
	})
})
