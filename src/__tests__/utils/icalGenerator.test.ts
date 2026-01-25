import { describe, expect, it } from 'vitest'
import { generateMultiYearCalendar, generateYearCalendar } from '../../utils/icalGenerator'

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

		it('should not escape commas in event titles', () => {
			const ical = generateYearCalendar(2025)

			// Commas should NOT be escaped in SUMMARY (RFC 5545 only requires escaping ; \ and newlines)
			expect(ical).toContain('Annunciation, Nativity, and Resurrection')
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
		it('should categorize moveable feasts correctly', () => {
			const ical = generateYearCalendar(2025)

			// Moveable feasts should have the Moveable Feast category
			const moveableFeastEvents = ical.match(
				/BEGIN:VEVENT[\s\S]*?CATEGORIES:Moveable Feast[\s\S]*?END:VEVENT/g,
			)

			expect(moveableFeastEvents).toBeTruthy()
			expect(moveableFeastEvents!.length).toBeGreaterThan(0)
		})

		it('should categorize fasting periods correctly', () => {
			const ical = generateYearCalendar(2025)

			// Fasting periods should have the Fasting Period category
			expect(ical).toContain('CATEGORIES:Fasting Period')
		})

		it('should categorize static feasts correctly', () => {
			const ical = generateYearCalendar(2025)

			// Static celebrations should have the Feast category
			expect(ical).toContain('CATEGORIES:Feast')
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
