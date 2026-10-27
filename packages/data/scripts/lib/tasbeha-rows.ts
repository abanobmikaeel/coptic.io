/**
 * Row parser for tasbeha.org hymn library pages.
 *
 * Pages lay the text out as paragraphs (`sync-para`), each a run of word-synced lines
 * (`sync-line`) carrying the Coptic words, the English phrase and the Arabic phrase.
 * Phrase boundaries inside a paragraph are not aligned across languages — the Arabic
 * of "and the | powers." splits differently — so the paragraph, not the line, is the
 * unit the three languages agree on. One paragraph becomes one row.
 *
 * Each row cell takes the cell shape the importers were written against: a cue line
 * ("Priest:") on its own line, followed by the text it introduces as one line. Phrases
 * are joined with spaces, not newlines — Coptic phrases end in a colon, which the
 * importers would otherwise read as an inline rubric. A cue that is not a speaker label
 * (a staging direction) has a blank Coptic column, so the importers' rubric test —
 * English and Arabic present, Coptic absent — still applies.
 */

export type Lang = 'en' | 'ar' | 'cop'

export interface Row {
	en: string
	cop: string
	ar: string
}

function decodeEntities(s: string): string {
	return s
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, ' ')
		.replace(/&minus;/g, '−')
}

const text = (html: string): string =>
	decodeEntities(html.replace(/<[^>]+>/g, ''))
		.replace(/\s+/g, ' ')
		.trim()

/** The source marks an empty column with a lone dash. */
const blankDash = (s: string): string => (s === '-' ? '' : s)

/** Some pages leave a speaker label as an ordinary line rather than marking it a cue. */
const UNMARKED_LABEL = /^(Priest|Deacon|People|Reader)(\s*\(.*\))?:$/

interface Line extends Row {
	cue: boolean
}

function parseLine(html: string): Line {
	const words = [...html.matchAll(/<span class="w sync-coptic[^"]*"[^>]*>([\s\S]*?)<\/span>/g)]
	const en = html.match(/<div class="sync-english">([\s\S]*?)<\/div>/)?.[1] ?? ''
	const ar = html.match(/<div class="sync-arabic[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? ''
	const line = {
		en: blankDash(text(en)),
		cop: blankDash(words.map(([, w]) => text(w ?? '')).join(' ')),
		ar: blankDash(text(ar)),
	}
	return { ...line, cue: html.startsWith(' row sync-cue') || UNMARKED_LABEL.test(line.en) }
}

export function parseRows(html: string): Row[] {
	const start = html.indexOf('class="sync-body"')
	if (start < 0) return []
	const rows: Row[] = []
	for (const para of html.slice(start).split('<div class="sync-para"').slice(1)) {
		const lines = para.split('<div class="sync-line').slice(1).map(parseLine)
		const row: Row = { en: '', cop: '', ar: '' }
		for (const lang of ['en', 'cop', 'ar'] as Lang[]) {
			const cell: string[] = []
			let phrases: string[] = []
			const flush = () => {
				if (phrases.length > 0) cell.push(phrases.join(' '))
				phrases = []
			}
			for (const line of lines) {
				if (!line[lang]) continue
				if (line.cue) {
					flush()
					cell.push(line[lang])
				} else {
					phrases.push(line[lang])
				}
			}
			flush()
			row[lang] = cell.join('\n')
		}
		if (row.en || row.cop || row.ar) rows.push(row)
	}
	return rows
}
