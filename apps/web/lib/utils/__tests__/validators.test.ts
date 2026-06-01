import { describe, expect, it } from 'vitest'
import { isValidEmail, isValidOtp } from '../validators'

describe('isValidEmail', () => {
	describe('valid emails', () => {
		it('should accept standard emails', () => {
			expect(isValidEmail('user@example.com')).toBe(true)
			expect(isValidEmail('user@domain.co.uk')).toBe(true)
			expect(isValidEmail('user.name+tag@example.org')).toBe(true)
		})

		it('should accept minimal valid email', () => {
			expect(isValidEmail('a@b.c')).toBe(true)
		})

		it('should accept email at exactly 320 characters', () => {
			// 320 = max allowed per RFC 5321
			const local = 'a'.repeat(64)
			const domain = `${'b'.repeat(251)}.com`
			const email = `${local}@${domain}`
			expect(email.length).toBe(320)
			expect(isValidEmail(email)).toBe(true)
		})
	})

	describe('length validation', () => {
		it('should reject emails longer than 320 characters', () => {
			const email = `${'a'.repeat(300)}@${'b'.repeat(20)}.com`
			expect(email.length).toBeGreaterThan(320)
			expect(isValidEmail(email)).toBe(false)
		})

		it('should reject empty string', () => {
			expect(isValidEmail('')).toBe(false)
		})
	})

	describe('@ sign validation', () => {
		it('should reject email with no @ sign', () => {
			expect(isValidEmail('nodomain.com')).toBe(false)
		})

		it('should reject email starting with @', () => {
			expect(isValidEmail('@domain.com')).toBe(false)
		})

		it('should reject email with multiple @ signs', () => {
			expect(isValidEmail('user@@domain.com')).toBe(false)
			expect(isValidEmail('user@domain@com')).toBe(false)
			expect(isValidEmail('a@b@c.com')).toBe(false)
		})

		it('should reject email that is just @', () => {
			expect(isValidEmail('@')).toBe(false)
		})
	})

	describe('whitespace in local part (security regression from [A-z] fix)', () => {
		it('should reject email with space in local part', () => {
			expect(isValidEmail('user name@domain.com')).toBe(false)
		})

		it('should reject email with leading space in local part', () => {
			expect(isValidEmail(' user@domain.com')).toBe(false)
		})

		it('should reject email with tab in local part', () => {
			expect(isValidEmail('user\t@domain.com')).toBe(false)
		})

		it('should reject email with newline in local part', () => {
			expect(isValidEmail('user\n@domain.com')).toBe(false)
		})
	})

	describe('domain validation', () => {
		it('should reject domain with no dot', () => {
			expect(isValidEmail('user@domain')).toBe(false)
		})

		it('should reject domain ending with a dot', () => {
			expect(isValidEmail('user@domain.')).toBe(false)
		})

		it('should reject domain starting with a dot', () => {
			// The dot check is on lastIndexOf, so this passes the dot check
			// but this documents the current behaviour
			expect(isValidEmail('user@.com')).toBe(false)
		})

		it('should reject domain with space', () => {
			expect(isValidEmail('user@domain .com')).toBe(false)
		})

		it('should reject domain with tab', () => {
			expect(isValidEmail('user@domain\t.com')).toBe(false)
		})

		it('should reject empty domain', () => {
			expect(isValidEmail('user@')).toBe(false)
		})
	})

	describe('creative/edge inputs', () => {
		it('should reject carriage return in local part', () => {
			expect(isValidEmail('user\r@domain.com')).toBe(false)
		})

		it('should handle email with subdomains', () => {
			expect(isValidEmail('user@mail.subdomain.example.com')).toBe(true)
		})

		it('should handle numeric local part', () => {
			expect(isValidEmail('123@domain.com')).toBe(true)
		})

		it('should handle special chars in local part (RFC-valid but permissive)', () => {
			expect(isValidEmail('user+filter@domain.com')).toBe(true)
			expect(isValidEmail('user.name@domain.com')).toBe(true)
		})
	})
})

describe('isValidOtp', () => {
	it('should accept a valid 6-digit OTP', () => {
		expect(isValidOtp('123456')).toBe(true)
		expect(isValidOtp('000000')).toBe(true)
		expect(isValidOtp('999999')).toBe(true)
	})

	it('should reject OTP with wrong length', () => {
		expect(isValidOtp('12345')).toBe(false)
		expect(isValidOtp('1234567')).toBe(false)
		expect(isValidOtp('')).toBe(false)
	})

	it('should reject OTP with non-digit characters', () => {
		expect(isValidOtp('12345a')).toBe(false)
		expect(isValidOtp('12 456')).toBe(false)
		expect(isValidOtp('123.56')).toBe(false)
	})

	it('should accept custom length OTP', () => {
		expect(isValidOtp('1234', 4)).toBe(true)
		expect(isValidOtp('12345678', 8)).toBe(true)
	})

	it('should reject OTP that is right length but wrong type', () => {
		expect(isValidOtp('abcdef', 6)).toBe(false)
	})

	it('should reject creative bypass attempts', () => {
		expect(isValidOtp('1e5+00', 6)).toBe(false)
		expect(isValidOtp(' 12345', 6)).toBe(false)
		expect(isValidOtp('12345\n', 6)).toBe(false)
	})
})
