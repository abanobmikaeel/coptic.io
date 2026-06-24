import { COPTIC_MONTHS } from '@coptic/core'

/**
 * Helpers for the `/synaxarium/[date]` route, which encodes a "{day} {month}"
 * Coptic date as a URL segment with spaces → hyphens (e.g. "15 Toba" → "15-Toba").
 *
 * The canonical month list and Coptic-date validity are owned by `@coptic/core`;
 * the functions below are web-routing concerns layered on top.
 */

/**
 * Every Coptic synaxarium day as a URL segment, e.g. ["1-Tout", …, "5-Nasie"].
 *
 * Nasie yields 5 of its (up to) 6 days: the leap day "6 Nasie" is a valid date
 * that `canonicalizeCopticDate` accepts, but we don't pre-render it — it resolves
 * on-demand instead, so non-leap years never expose a dead URL.
 */
export function copticDateSegments(): string[] {
	const segments: string[] = []
	for (const month of COPTIC_MONTHS) {
		const days = month === 'Nasie' ? 5 : 30
		for (let day = 1; day <= days; day++) {
			segments.push(`${day}-${month}`)
		}
	}
	return segments
}

/** Decode a route segment ("15-Toba") into the Coptic date string ("15 Toba"). */
export function copticDateFromSegment(segment: string): string {
	return decodeURIComponent(segment).replace(/-/g, ' ')
}

/**
 * Normalize a Coptic date string to its canonical "{day} {Month}" form, or null
 * if it isn't a valid Coptic date. The API is case-sensitive and rejects leading
 * zeros, so "15 toba"/"05 toba" → "15 Toba"/"5 Toba". Used to redirect non-
 * canonical URLs to a single canonical one (avoids 404s and duplicate content).
 */
export function canonicalizeCopticDate(copticDate: string): string | null {
	const match = copticDate.trim().match(/^(\d{1,2})\s+(.+)$/)
	if (!match) return null
	const day = Number(match[1])
	const month = COPTIC_MONTHS.find((m) => m.toLowerCase() === match[2].trim().toLowerCase())
	if (!month) return null
	const maxDay = month === 'Nasie' ? 6 : 30 // Nasie has 5 days (6 in leap years)
	if (day < 1 || day > maxDay) return null
	return `${day} ${month}`
}

/** Canonical Coptic date string ("15 Toba") → URL segment ("15-Toba"). */
export function copticDateToSegment(copticDate: string): string {
	return copticDate.replace(/ /g, '-')
}
