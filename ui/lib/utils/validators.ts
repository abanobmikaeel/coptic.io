const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
	return EMAIL_REGEX.test(email);
}

export function isValidOtp(otp: string, length = 6): boolean {
	return otp.length === length && /^\d+$/.test(otp);
}
