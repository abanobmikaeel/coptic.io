export const OTP_LENGTH = 6
export const TOKEN_LENGTH = 32

/**
 * Uniform random integer in [0, maxExclusive) drawn from the platform CSPRNG.
 *
 * `Math.random()` must not be used for either value below. V8 backs it with a
 * single xorshift128+ stream per context, so an attacker who collects a handful
 * of outputs — by requesting codes for an address they control — can recover the
 * generator state and predict the code or token issued to anyone else served by
 * the same isolate. The verification code gates sign-up and the token is the only
 * credential the preferences endpoint accepts, so both are guessing targets.
 *
 * Rejection sampling keeps the result unbiased; a bare `% maxExclusive` would
 * skew towards the low end of the range.
 */
const randomInt = (maxExclusive: number): number => {
	const limit = Math.floor(0x1_0000_0000 / maxExclusive) * maxExclusive
	const buffer = new Uint32Array(1)
	let value: number
	do {
		crypto.getRandomValues(buffer)
		value = buffer[0] as number
	} while (value >= limit)
	return value % maxExclusive
}

export function generateOTP(): string {
	const min = 10 ** (OTP_LENGTH - 1)
	const max = 10 ** OTP_LENGTH - 1
	return (min + randomInt(max - min + 1)).toString()
}

export function generateToken(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let token = ''
	for (let i = 0; i < TOKEN_LENGTH; i++) {
		token += chars.charAt(randomInt(chars.length))
	}
	return token
}

export function isValidEmail(email: string): boolean {
	if (email.length > 320) return false
	const at = email.indexOf('@')
	if (at <= 0 || at !== email.lastIndexOf('@')) return false
	if (/\s/.test(email.slice(0, at))) return false
	const domain = email.slice(at + 1)
	const dot = domain.lastIndexOf('.')
	return dot > 0 && dot < domain.length - 1 && !/\s/.test(domain)
}
