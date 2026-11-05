import { describe, expect, it } from 'vitest'
import { parseEntries } from '../synaxarium-html'

const PAGE = 'https://copticchurch.net/synaxarium/ar/2_13'

describe('parseEntries', () => {
	it('reads paragraphs wrapped in <p>', () => {
		const html = `<h3><A NAME='1'>1. First saint </a></h3>
			<p>The first paragraph of the entry.</p><p>The second paragraph of the entry.</p>
			<h3><A NAME='2'>2. Second saint </a></h3><p>The only paragraph here.</p></div>`
		expect(parseEntries(html, PAGE)).toEqual([
			{
				url: `${PAGE}#1`,
				name: 'First saint',
				text: 'The first paragraph of the entry.\n\nThe second paragraph of the entry.',
			},
			{ url: `${PAGE}#2`, name: 'Second saint', text: 'The only paragraph here.' },
		])
	})

	// Baba 13 has no <p> tags; dropping it left the day out of the Arabic Synaxarium.
	it('reads bare text between blank lines when a page has no <p> tags', () => {
		const html = `<h3><A NAME='1'>1. Bare saint </a></h3>\r\n\r\nThe first bare
			paragraph, across lines. \r\n\r\nThe closing bare paragraph. \r\n\n  </div>`
		expect(parseEntries(html, PAGE)).toEqual([
			{
				url: `${PAGE}#1`,
				name: 'Bare saint',
				text: 'The first bare paragraph, across lines.\n\nThe closing bare paragraph.',
			},
		])
	})

	it('skips a header with no text under it', () => {
		expect(parseEntries(`<h3><A NAME='1'>1. Empty </a></h3></div>`, PAGE)).toEqual([])
	})
})
