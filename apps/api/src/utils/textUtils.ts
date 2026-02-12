/**
 * HTML entities that may appear in synaxarium and other text data
 */
const htmlEntities: Record<string, string> = {
	'&quot;': '"',
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&apos;': "'",
	'&#39;': "'",
	'&nbsp;': ' ',
}

const htmlEntityPattern = /&(?:quot|amp|lt|gt|apos|nbsp|#39);/g

/**
 * Decodes HTML entities in a string
 * @param text - The text containing HTML entities
 * @returns The decoded text, or the original text if null/undefined
 */
export function decodeHtmlEntities(text: string): string
export function decodeHtmlEntities(text: string | undefined): string | undefined
export function decodeHtmlEntities(text: string | null): string | null
export function decodeHtmlEntities(text: string | undefined | null): string | undefined | null {
	if (!text) return text
	return text.replace(htmlEntityPattern, (match) => htmlEntities[match] || match)
}
