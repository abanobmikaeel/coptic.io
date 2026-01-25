const BASE_STYLES = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;`;
const HEADING_STYLES = `color: #d97706; margin-bottom: 24px;`;
const TEXT_STYLES = `color: #374151; line-height: 1.6;`;
const MUTED_STYLES = `color: #6b7280; font-size: 14px;`;
const LINK_STYLES = `color: #d97706;`;
const FOOTER_STYLES = `color: #9ca3af; font-size: 12px;`;

export function otpEmailHtml(code: string): string {
	return `
		<div style="${BASE_STYLES}">
			<h2 style="${HEADING_STYLES}">Coptic.io Email Verification</h2>
			<p style="${TEXT_STYLES}">Your verification code is:</p>
			<div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
				<span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
			</div>
			<p style="${MUTED_STYLES}">This code expires in 10 minutes.</p>
			<p style="${MUTED_STYLES} margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
		</div>
	`;
}

export function otpEmailText(code: string): string {
	return `Your Coptic.io verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email.`;
}

export function welcomeEmailHtml(greeting: string, preferencesUrl: string, unsubscribeUrl: string): string {
	return `
		<div style="${BASE_STYLES}">
			<h2 style="${HEADING_STYLES}">${greeting}</h2>
			<p style="${TEXT_STYLES}">Thank you for subscribing! You'll now receive:</p>
			<ul style="${TEXT_STYLES} line-height: 1.8;">
				<li>Daily scripture readings from the Coptic Orthodox lectionary</li>
				<li>Reminders for upcoming feast days and celebrations</li>
			</ul>
			<p style="${TEXT_STYLES} margin-top: 24px;">
				<a href="${preferencesUrl}" style="${LINK_STYLES}">Manage your preferences</a>
			</p>
			<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
			<p style="${FOOTER_STYLES}">
				<a href="${unsubscribeUrl}" style="${FOOTER_STYLES}">Unsubscribe</a>
			</p>
		</div>
	`;
}

export function welcomeEmailText(greeting: string, preferencesUrl: string, unsubscribeUrl: string): string {
	return `${greeting}\n\nThank you for subscribing! You'll now receive:\n- Daily scripture readings from the Coptic Orthodox lectionary\n- Reminders for upcoming feast days and celebrations\n\nManage your preferences: ${preferencesUrl}\n\nUnsubscribe: ${unsubscribeUrl}`;
}
