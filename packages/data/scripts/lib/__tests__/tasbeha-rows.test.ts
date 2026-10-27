import { describe, expect, it } from 'vitest'
import { parseRows } from '../tasbeha-rows'

// A line in the hymn library's word-synced layout: Coptic words each carry a
// transliteration twin, and the English and Arabic phrases sit beside them.
const word = (w: string, i: number) =>
	`<span class="wp" data-w="${i}"><span class="w sync-translit" data-w="${i}">tr</span><span class="w sync-coptic coptictext_utf8" data-w="${i}" lang="cop">${w}</span></span>`

const line = (en: string, cop: string[], ar: string, cue = false) => `
<div class="sync-line row${cue ? ' sync-cue' : ''}" data-idx="0">
<div class="sync-text">${cop.map(word).join(' ')}</div><div class="sync-translation"><div class="sync-english">${en}</div><div class="sync-arabic arabictext" dir="rtl" lang="ar">${ar}</div></div></div>`

const para = (...lines: string[]) => `<div class="sync-para" data-para="0">${lines.join('')}</div>`
const page = (...paras: string[]) =>
	`<nav>menu</nav><div class="sync-panel"><div class="sync-body">${paras.join('\n')}</div></div>`

describe('parseRows', () => {
	it('makes one row per paragraph, joining its phrases with spaces', () => {
		const rows = parseRows(
			page(
				para(
					line('Holy God,', ['Ⲁ̀ⲅⲓⲟⲥ', 'ⲟ̀', 'Ⲑⲉⲟⲥ:'], 'قدوس الله،'),
					line('holy Mighty,', ['ⲁ̀ⲅⲓⲟⲥ', 'Ⲓⲥⲭⲩⲣⲟⲥ:'], 'قدوس القوي،'),
				),
			),
		)
		// Joined, not newline-separated: a Coptic phrase ending in a colon on a line of its
		// own would read as an inline rubric to the importers.
		expect(rows).toEqual([
			{
				en: 'Holy God, holy Mighty,',
				cop: 'Ⲁ̀ⲅⲓⲟⲥ ⲟ̀ Ⲑⲉⲟⲥ: ⲁ̀ⲅⲓⲟⲥ Ⲓⲥⲭⲩⲣⲟⲥ:',
				ar: 'قدوس الله، قدوس القوي،',
			},
		])
	})

	it('puts a speaker cue on its own line ahead of the text it introduces', () => {
		const rows = parseRows(
			page(
				para(
					line('Priest:', ['Ⲡⲓⲟⲩⲏⲃ:'], 'الكاهن:', true),
					line('The Lord be with you all.', ['Ⲟ̀', 'Ⲕⲩⲣⲓⲟⲥ'], 'الرب مع جميعكم.'),
				),
			),
		)
		expect(rows[0]).toEqual({
			en: 'Priest:\nThe Lord be with you all.',
			cop: 'Ⲡⲓⲟⲩⲏⲃ:\nⲞ̀ Ⲕⲩⲣⲓⲟⲥ',
			ar: 'الكاهن:\nالرب مع جميعكم.',
		})
	})

	it('treats a speaker label the source left unmarked as a cue', () => {
		const rows = parseRows(
			page(
				para(
					line('Priest:', ['Ⲡⲓⲡ̀ⲣⲉⲥⲃⲩⲧⲉⲣⲟⲥ:'], 'الكاهن:'),
					line('Glory and honor,', ['Ⲟⲩⲱ̀ⲟⲩ'], 'مجدا'),
				),
			),
		)
		expect(rows[0]?.en).toBe('Priest:\nGlory and honor,')
	})

	it('reads the dash the source uses for an empty column as blank', () => {
		// A staging direction: English and Arabic, no Coptic — the importers' rubric test.
		const rows = parseRows(
			page(para(line('In the presence of a bishop:', ['-'], 'في حضور الأب الأسقف:', true))),
		)
		expect(rows).toEqual([
			{ en: 'In the presence of a bishop:', cop: '', ar: 'في حضور الأب الأسقف:' },
		])
	})

	it('decodes entities and skips paragraphs with no text', () => {
		const rows = parseRows(page(para(line('Glory &amp; honor', ['Ⲱ̀ⲟⲩ'], 'مجد')), para()))
		expect(rows).toEqual([{ en: 'Glory & honor', cop: 'Ⲱ̀ⲟⲩ', ar: 'مجد' }])
	})

	it('returns nothing for a page without the synced text body', () => {
		expect(parseRows("<div class='row'>an older layout</div>")).toEqual([])
	})
})
