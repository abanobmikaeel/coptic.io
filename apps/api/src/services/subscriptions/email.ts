import { AwsClient } from 'aws4fetch'
import type { Bindings } from '../../env'
import { otpEmailHtml, otpEmailText, welcomeEmailHtml, welcomeEmailText } from './templates'

export interface EmailMessage {
	to: string
	subject: string
	html: string
	text?: string
}

const DEFAULT_REGION = 'us-east-1'
const DEFAULT_FROM = 'noreply@coptic.io'
export const DEFAULT_SITE_URL = 'https://coptic.io'

// Bindings in Workers; process.env under Bun.
const setting = (env: Bindings | undefined, key: keyof Bindings): string | undefined =>
	(env?.[key] as string | undefined) ?? globalThis.process?.env?.[key]

export const siteUrl = (env?: Bindings): string => setting(env, 'SITE_URL') ?? DEFAULT_SITE_URL

/** Sends one message through the SES v2 API. Throws on any non-2xx response. */
export async function sendEmail(env: Bindings | undefined, message: EmailMessage): Promise<void> {
	const accessKeyId = setting(env, 'AWS_ACCESS_KEY_ID')
	const secretAccessKey = setting(env, 'AWS_SECRET_ACCESS_KEY')
	if (!accessKeyId || !secretAccessKey) throw new Error('SES credentials are not configured')

	const region = setting(env, 'AWS_REGION') ?? DEFAULT_REGION
	const aws = new AwsClient({ accessKeyId, secretAccessKey, service: 'ses', region })

	const body: Record<string, unknown> = { Html: { Data: message.html } }
	if (message.text) body.Text = { Data: message.text }

	const res = await aws.fetch(`https://email.${region}.amazonaws.com/v2/email/outbound-emails`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			FromEmailAddress: setting(env, 'SES_FROM_EMAIL') ?? DEFAULT_FROM,
			Destination: { ToAddresses: [message.to] },
			Content: { Simple: { Subject: { Data: message.subject }, Body: body } },
		}),
	})
	if (!res.ok) {
		throw new Error(`SES SendEmail failed with ${res.status}: ${await res.text()}`)
	}
}

export const sendOTPEmail = (env: Bindings | undefined, email: string, code: string) =>
	sendEmail(env, {
		to: email,
		subject: `Your Coptic.io verification code: ${code}`,
		html: otpEmailHtml(code),
		text: otpEmailText(code),
	})

export const subscriberLinks = (env: Bindings | undefined, token: string) => ({
	preferencesUrl: `${siteUrl(env)}/preferences?token=${token}`,
	unsubscribeUrl: `${siteUrl(env)}/api/unsubscribe?token=${token}`,
})

export function sendWelcomeEmail(
	env: Bindings | undefined,
	nameOrEmail: string,
	email: string,
	token: string,
): Promise<void> {
	const { preferencesUrl, unsubscribeUrl } = subscriberLinks(env, token)
	const greeting = nameOrEmail.includes('@') ? 'Welcome to Coptic.io!' : `Welcome, ${nameOrEmail}!`

	return sendEmail(env, {
		to: email,
		subject: 'Welcome to Coptic.io Daily Readings',
		html: welcomeEmailHtml(greeting, preferencesUrl, unsubscribeUrl),
		text: welcomeEmailText(greeting, preferencesUrl, unsubscribeUrl),
	})
}
