import { describe, expect, it } from 'vitest'
import { flattenToLines } from '../../components/LiturgicalSection/turns'

const DOXA_COPTIC = 'Ⲇⲟⲝⲁ Ⲡⲁⲧⲣⲓ ⲕⲉ Ⲩ̀ⲓⲱ ⲕⲉ Ⲁ̀ⲅⲓⲱ Ⲡ̀ⲛⲉⲩⲙⲁⲧⲓ:'
const KENIN_COPTIC = 'ⲕⲉ ⲛⲩⲛ ⲕⲉ ⲁ̀ⲓ̀ ⲕⲉ ⲓⲥ ⲧⲟⲩⲥ ⲉ̀ⲱ̀ⲛⲁⲥ ⲧⲱⲛ ⲉ̀ⲱ̀ⲛⲱⲛ. Ⲁ̀ⲙⲏⲛ.'

describe('flattenToLines response grouping', () => {
	it('collapses a Coptic response and its vernacular translation into one line', () => {
		const lines = flattenToLines([
			'If the righteous one is hardly saved…',
			DOXA_COPTIC,
			'Glory to the Father and the Son and the Holy Spirit.',
		])
		expect(lines).toHaveLength(2)
		expect(lines[0].isResponse).toBe(false)
		expect(lines[1].isResponse).toBe(true)
		// The vernacular leads; the Coptic script is the alternative.
		expect(lines[1].text).toBe('Glory to the Father and the Son and the Holy Spirit.')
		expect(lines[1].responseCoptic).toBe(DOXA_COPTIC)
	})

	it('groups the Ke-nin response (Now and forever) in both languages', () => {
		const en = flattenToLines([KENIN_COPTIC, 'Now and forever and unto the age of all ages. Amen.'])
		expect(en).toHaveLength(1)
		expect(en[0].isResponse).toBe(true)
		expect(en[0].text).toBe('Now and forever and unto the age of all ages. Amen.')
		expect(en[0].responseCoptic).toBe(KENIN_COPTIC)

		const ar = flattenToLines([DOXA_COPTIC, 'المجد للآب والابن والروح القدس'])
		expect(ar).toHaveLength(1)
		expect(ar[0].isResponse).toBe(true)
		expect(ar[0].text).toBe('المجد للآب والابن والروح القدس')
		expect(ar[0].responseCoptic).toBe(DOXA_COPTIC)
	})

	it('leaves a lone vernacular response detected without a Coptic pair', () => {
		const lines = flattenToLines(['Glory to the Father and the Son and the Holy Spirit.'])
		expect(lines).toHaveLength(1)
		expect(lines[0].isResponse).toBe(true)
		expect(lines[0].responseCoptic).toBeUndefined()
	})

	it('does not treat ordinary petition prose as a response', () => {
		const lines = flattenToLines(['O my Saviour, hasten to open Your fatherly bosom to me.'])
		expect(lines[0].isResponse).toBe(false)
		expect(lines[0].responseCoptic).toBeUndefined()
	})

	it('keeps a Coptic line that has no vernacular pair as a plain line', () => {
		// A Doxa with nothing after it should not swallow a following petition.
		const lines = flattenToLines([DOXA_COPTIC, 'O heavenly King, the Comforter…'])
		expect(lines).toHaveLength(2)
		expect(lines[0].isResponse).toBe(false)
		expect(lines[1].isResponse).toBe(false)
	})
})
