export function isValidEmail(email: string): boolean {
	if (email.length > 320) return false
	const at = email.indexOf('@')
	if (at <= 0 || at !== email.lastIndexOf('@')) return false
	if (/\s/.test(email.slice(0, at))) return false
	const domain = email.slice(at + 1)
	const dot = domain.lastIndexOf('.')
	return dot > 0 && dot < domain.length - 1 && !/\s/.test(domain)
}

export function isValidOtp(otp: string, length = 6): boolean {
	return otp.length === length && /^\d+$/.test(otp)
}
