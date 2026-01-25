import { OTP_LENGTH, TOKEN_LENGTH } from '@/constants'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { otpEmailHtml, otpEmailText, welcomeEmailHtml, welcomeEmailText } from './email/templates'

const ses = new SESClient({
	region: process.env.AWS_REGION || 'us-east-1',
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
	},
})

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@coptic.io'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://coptic.io'

export async function sendOTPEmail(email: string, code: string): Promise<void> {
	const command = new SendEmailCommand({
		Source: FROM_EMAIL,
		Destination: { ToAddresses: [email] },
		Message: {
			Subject: { Data: `Your Coptic.io verification code: ${code}` },
			Body: {
				Html: { Data: otpEmailHtml(code) },
				Text: { Data: otpEmailText(code) },
			},
		},
	})

	await ses.send(command)
}

export async function sendWelcomeEmail(
	nameOrEmail: string,
	email: string,
	token: string,
): Promise<void> {
	const preferencesUrl = `${BASE_URL}/preferences?token=${token}`
	const unsubscribeUrl = `${BASE_URL}/api/unsubscribe?token=${token}`
	const greeting = nameOrEmail.includes('@') ? 'Welcome to Coptic.io!' : `Welcome, ${nameOrEmail}!`

	const command = new SendEmailCommand({
		Source: FROM_EMAIL,
		Destination: { ToAddresses: [email] },
		Message: {
			Subject: { Data: 'Welcome to Coptic.io Daily Readings' },
			Body: {
				Html: { Data: welcomeEmailHtml(greeting, preferencesUrl, unsubscribeUrl) },
				Text: { Data: welcomeEmailText(greeting, preferencesUrl, unsubscribeUrl) },
			},
		},
	})

	await ses.send(command)
}

export function generateOTP(): string {
	const min = 10 ** (OTP_LENGTH - 1)
	const max = 10 ** OTP_LENGTH - 1
	return Math.floor(min + Math.random() * (max - min + 1)).toString()
}

export function generateToken(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let token = ''
	for (let i = 0; i < TOKEN_LENGTH; i++) {
		token += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return token
}
