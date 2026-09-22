import { describe, expect, it } from 'vitest'
import { generateMultiYearCalendar, generateYearCalendar } from '../../utils/icalGenerator'

// Reverse RFC 5545 3.1 folding: a CRLF followed by a single space is a continuation
const unfold = (ical: string): string => ical.replace(/\r\n /g, '')

describe('iCalendar Generator', () => {
	describe('generateYearCalendar', () => {
		it('should generate valid iCalendar format', () => {
			const ical = generateYearCalendar(2025)

			expect(ical).toContain('BEGIN:VCALENDAR')
			expect(ical).toContain('END:VCALENDAR')
			expect(ical).toContain('VERSION:2.0')
			expect(ical).toContain('PRODID:-//Coptic.IO//Coptic Orthodox Calendar//EN')
		})

		it('should include calendar metadata', () => {
			const ical = generateYearCalendar(2025)

			expect(ical).toContain('X-WR-CALNAME:Coptic Orthodox Calendar')
			expect(ical).toContain('X-WR-CALDESC:Coptic Orthodox liturgical calendar for 2025')
			expect(ical).toContain('CALSCALE:GREGORIAN')
			expect(ical).toContain('METHOD:PUBLISH')
		})

		it('should only include events from the specified year', () => {
			const ical = generateYearCalendar(2025)

			// Should include 2025 Nativity Fast (Nov 25, 2025)
			expect(ical).toContain('DTSTART;VALUE=DATE:20251125')

			// Should NOT include 2024 Nativity Fast
			expect(ical).not.toContain('DTSTART;VALUE=DATE:20241125')
		})

		it('should include major liturgical seasons', () => {
			const ical = generateYearCalendar(2025)

			expect(ical).toContain('Fast of Nineveh')
			expect(ical).toContain('Great Lent')
			expect(ical).toContain('Paschal Season')
		})

		it('should properly format event UIDs', () => {
			const ical = generateYearCalendar(2025)

			// UIDs should end with @coptic.io
			expect(ical).toMatch(/UID:.*@coptic\.io/g)
		})

		it('should emit slug-safe UIDs with no spaces or edge punctuation', () => {
			const uids = unfold(generateMultiYearCalendar(2025, 2028))
				.split('\r\n')
				.filter((l) => l.startsWith('UID:'))
				.map((l) => l.slice('UID:'.length))

			expect(uids.length).toBeGreaterThan(0)
			for (const uid of uids) {
				expect(uid).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*@coptic\.io$/)
			}

			// The category half is slugified too, not left as "Fasting Period"
			expect(uids).toContain('fasting-period-20260216-great-lent-begins@coptic.io')
			// A parenthesised name no longer leaves a trailing dash
			expect(uids).toContain(
				'feast-20250712-apostles-feast-martyrdom-of-sts-peter-and-paul@coptic.io',
			)
		})

		it('should escape commas in event titles', () => {
			const ical = generateYearCalendar(2025)

			// RFC 5545 3.3.11 excludes COMMA from TSAFE-CHAR, so it must be escaped in TEXT values
			expect(ical).toContain('SUMMARY:Annunciation\\, Nativity\\, and Resurrection')
			expect(ical).not.toContain('SUMMARY:Annunciation, Nativity, and Resurrection')
		})

		it('should fold content lines longer than 75 octets', () => {
			const ical = generateYearCalendar(2025)
			const lines = ical.split('\r\n')

			// A folded line is continued by a following line starting with a single space
			const overlong = lines.filter((line) => new TextEncoder().encode(line).length > 75)
			expect(overlong).toEqual([])

			// Content survives once unfolding is undone
			expect(unfold(ical)).toContain(
				'UID:feast-20250712-apostles-feast-martyrdom-of-sts-peter-and-paul@coptic.io',
			)
		})

		it('should keep folded continuation lines under the limit including the leading space', () => {
			const ical = generateYearCalendar(2025)

			for (const line of ical.split('\r\n')) {
				expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
			}
		})

		it('should include all VEVENT components properly closed', () => {
			const ical = generateYearCalendar(2025)

			const beginCount = (ical.match(/BEGIN:VEVENT/g) || []).length
			const endCount = (ical.match(/END:VEVENT/g) || []).length

			expect(beginCount).toBe(endCount)
			expect(beginCount).toBeGreaterThan(0)
		})

		it('should format dates correctly (YYYYMMDD)', () => {
			const ical = generateYearCalendar(2025)

			// All DTSTART dates should be in YYYYMMDD format
			const dateMatches = ical.match(/DTSTART;VALUE=DATE:(\d{8})/g)
			expect(dateMatches).toBeTruthy()

			dateMatches?.forEach((match) => {
				const date = match.split(':')[1]
				expect(date).toMatch(/^\d{8}$/)
				expect(date.substring(0, 4)).toBe('2025')
			})
		})
	})

	describe('multi-day celebrations', () => {
		const summariesOf = (ical: string) =>
			unfold(ical)
				.split('\r\n')
				.filter((l) => l.startsWith('SUMMARY:'))
				.map((l) => l.slice('SUMMARY:'.length))

		it('should emit a season authored across many days as a single event', () => {
			// Nayrouz is authored on Tout 1-16, which previously produced 16 duplicate events
			const occurrences = summariesOf(generateYearCalendar(2026)).filter(
				(s) => s === 'Coptic New Year (Nayrouz)',
			)

			expect(occurrences).toHaveLength(1)
		})

		it('should collapse a multi-day feast to its first day without a DTEND', () => {
			const ical = unfold(generateYearCalendar(2026))
			// The Paramoun is authored across three days; it is a feast, so it stays single-day
			const paramoun = summariesOf(ical).filter((s) => s === 'Nativity Paramoun')

			expect(paramoun).toHaveLength(1)
			expect(ical).toContain('SUMMARY:Nativity Paramoun')
		})

		it('should give a multi-day fast both a dated span and a begins marker', () => {
			const ical = unfold(generateYearCalendar(2026))
			const summaries = summariesOf(ical)

			expect(summaries).toContain('St. Mary Fast')
			expect(summaries).toContain('St. Mary Fast begins')

			// The fast runs 7-21 August and the feast falls on the 22nd, so the exclusive DTEND
			// lands on the feast day rather than a day later
			const span = ical
				.split('BEGIN:VEVENT')
				.find((block) => block.includes('SUMMARY:St. Mary Fast\r\n'))
			expect(span).toContain('DTSTART;VALUE=DATE:20260807')
			expect(span).toContain('DTEND;VALUE=DATE:20260822')
			expect(summaries).toContain('St. Mary Feast (Commemoration of Her Assumption)')
		})

		it('should not add a begins marker to a fast authored on a single day', () => {
			const summaries = summariesOf(generateYearCalendar(2026))

			// Kiahk occupies one authored day, so the event is already its own marker
			expect(summaries).toContain('Kiahk')
			expect(summaries).not.toContain('Kiahk begins')
		})

		it('should not re-announce a fast that carried over from the previous year', () => {
			// The Advent Fast is still running on 1 January, and previously produced a second
			// spurious "begins" event on that date
			const ical = unfold(generateYearCalendar(2026))
			const januaryFirstBegins = ical
				.split('BEGIN:VEVENT')
				.filter((block) => block.includes('DTSTART;VALUE=DATE:20260101'))
				.filter((block) => block.includes('begins'))

			expect(januaryFirstBegins).toEqual([])
		})

		it('should not duplicate a celebration across a multi-year feed', () => {
			const occurrences = summariesOf(generateMultiYearCalendar(2025, 2028)).filter(
				(s) => s === 'Coptic New Year (Nayrouz)',
			)

			// One per year, not one per authored day
			expect(occurrences).toHaveLength(4)
		})

		it('should not carry leading whitespace in celebration names', () => {
			expect(generateYearCalendar(2026)).not.toContain('SUMMARY: ')
		})
	})

	describe('against published diocesan dates', () => {
		// Cross-checked against copticchurch.net/calendar/feasts/2026
		const PUBLISHED_2026: Array<[string, string]> = [
			['20260107', 'Nativity Feast'],
			['20260114', 'Circumcision Feast'],
			['20260119', 'Theophany Feast'],
			['20260121', 'Wedding of Cana of Galilee Feast'],
			['20260215', 'Entrance into the Temple Feast'],
			['20260405', 'Palm Sunday'],
			['20260407', 'Annunciation Feast'],
			['20260409', 'Holy Thursday'],
			['20260412', 'Easter'],
			['20260419', 'Thomas Sunday'],
			['20260521', 'Ascension'],
			['20260531', 'Pentecost'],
			['20260601', 'Entry into Egypt'],
			['20260819', 'Transfiguration'],
			['20260911', 'Coptic New Year (Nayrouz)'],
			['20260927', 'Feast of the Cross'],
		]

		it.each(PUBLISHED_2026)('should place %s as %s', (date, name) => {
			const block = unfold(generateYearCalendar(2026))
				.split('BEGIN:VEVENT')
				.find((b) => b.includes(`SUMMARY:${name}\r\n`))

			expect(block).toBeDefined()
			expect(block).toContain(`DTSTART;VALUE=DATE:${date}`)
		})

		it('should leave Good Friday to Holy Week rather than listing it separately', () => {
			const ical = unfold(generateYearCalendar(2026))

			expect(ical).not.toContain('SUMMARY:Good Friday')
			expect(ical).toContain('SUMMARY:Holy Week begins')
		})
	})

	describe('generateMultiYearCalendar', () => {
		it('should generate calendar spanning multiple years', () => {
			const ical = generateMultiYearCalendar(2024, 2026)

			expect(ical).toContain('BEGIN:VCALENDAR')
			expect(ical).toContain('END:VCALENDAR')
			expect(ical).toContain('Coptic Orthodox liturgical calendar 2024-2026')
		})

		it('should include events from all specified years', () => {
			const ical = generateMultiYearCalendar(2024, 2026)

			// Should include events from 2024, 2025, and 2026
			expect(ical).toContain('DTSTART;VALUE=DATE:2024')
			expect(ical).toContain('DTSTART;VALUE=DATE:2025')
			expect(ical).toContain('DTSTART;VALUE=DATE:2026')
		})

		it('should not duplicate events across years', () => {
			const ical = generateMultiYearCalendar(2024, 2025)

			// Count occurrences of 2024 Nativity Fast
			const nativity2024Count = (ical.match(/20241125.*Nativity Fast begins/g) || []).length

			// Should only appear once
			expect(nativity2024Count).toBeLessThanOrEqual(1)
		})

		it('should have matching BEGIN/END VEVENT pairs', () => {
			const ical = generateMultiYearCalendar(2024, 2026)

			const beginCount = (ical.match(/BEGIN:VEVENT/g) || []).length
			const endCount = (ical.match(/END:VEVENT/g) || []).length

			expect(beginCount).toBe(endCount)
		})

		it('should only include one VCALENDAR wrapper', () => {
			const ical = generateMultiYearCalendar(2024, 2026)

			const beginCalCount = (ical.match(/BEGIN:VCALENDAR/g) || []).length
			const endCalCount = (ical.match(/END:VCALENDAR/g) || []).length

			expect(beginCalCount).toBe(1)
			expect(endCalCount).toBe(1)
		})
	})

	describe('Event categorization', () => {
		it('should categorize feasts correctly', () => {
			const ical = generateYearCalendar(2025)

			// All feasts (moveable and static) use the Feast category
			const feastEvents = ical.match(/BEGIN:VEVENT[\s\S]*?CATEGORIES:Feast[\s\S]*?END:VEVENT/g)

			expect(feastEvents).toBeTruthy()
			expect(feastEvents!.length).toBeGreaterThan(0)

			// Should include moveable feasts like Easter, Palm Sunday
			expect(ical).toContain('SUMMARY:Easter')
			expect(ical).toContain('SUMMARY:Palm Sunday')
		})

		it('should categorize the monthly commemoration on the 29th separately from feasts', () => {
			const ical = unfold(generateYearCalendar(2026))
			const commemorations = ical
				.split('BEGIN:VEVENT')
				.filter((event) => event.includes('SUMMARY:Annunciation\\, Nativity\\, and Resurrection'))

			expect(commemorations.length).toBeGreaterThan(0)
			for (const event of commemorations) {
				expect(event).toContain('CATEGORIES:Commemoration')
			}
		})

		it('should categorize fasting periods correctly', () => {
			const ical = generateYearCalendar(2025)

			// Fasting periods should have the Fasting Period category
			expect(ical).toContain('CATEGORIES:Fasting Period')
			// Should have "begins" markers for fasting seasons
			expect(ical).toContain('Great Lent begins')
		})

		it('should not duplicate fasting periods', () => {
			const ical = generateYearCalendar(2025)

			// Fasting periods should only appear once (as "begins" markers from seasons)
			// not as both moveable feasts AND season markers
			const greatLentMatches = ical.match(/Great Lent/g)
			expect(greatLentMatches?.length).toBe(1) // Only "Great Lent begins"
		})
	})

	describe('Date validation', () => {
		it('should not include future year dates in single year calendar', () => {
			const ical = generateYearCalendar(2025)

			// Should not contain any 2026 dates
			expect(ical).not.toContain('DTSTART;VALUE=DATE:2026')
		})

		it('should not include past year dates in single year calendar', () => {
			const ical = generateYearCalendar(2025)

			// Should not contain any 2024 dates
			expect(ical).not.toContain('DTSTART;VALUE=DATE:2024')
		})
	})
})
