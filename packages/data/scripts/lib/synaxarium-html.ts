export interface ScrapedEntry {
	url: string
	name: string
	text: string
}

const clean = (html: string): string =>
	html
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim()

const isProse = (text: string): boolean => text.length > 10

/** Most days wrap each paragraph in <p>; a few leave it as bare text between blank lines. */
const paragraphsOf = (block: string): string[] => {
	const wrapped = [...block.matchAll(/<p>([\s\S]*?)<\/p>/gi)]
		.map((match) => clean(match[1] ?? ''))
		.filter(isProse)
	if (wrapped.length > 0) return wrapped
	return block
		.split(/\r?\n\s*\r?\n/)
		.map(clean)
		.filter(isProse)
}

/** The entries of one day's page: an <h3> header per entry, followed by its text. */
export const parseEntries = (html: string, pageUrl: string): ScrapedEntry[] => {
	const entryPattern =
		/<h3><A NAME='(\d+)'[^>]*>[\d.]*\s*([^<]+)<\/a><\/h3>([\s\S]*?)(?=<h3>|<\/div>)/gi
	return [...html.matchAll(entryPattern)].flatMap((match) => {
		const name = (match[2] ?? '').trim()
		const paragraphs = paragraphsOf(match[3] ?? '')
		if (!name || paragraphs.length === 0) return []
		return [{ url: `${pageUrl}#${match[1]}`, name, text: paragraphs.join('\n\n') }]
	})
}
