const BASE_STYLES = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;`
const HEADING_STYLES = 'color: #d97706; margin-bottom: 24px;'
const TEXT_STYLES = 'color: #374151; line-height: 1.6;'
const MUTED_STYLES = 'color: #6b7280; font-size: 14px;'
const LINK_STYLES = 'color: #d97706;'
const FOOTER_STYLES = 'color: #9ca3af; font-size: 12px;'

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
	`
}

export function otpEmailText(code: string): string {
	return `Your Coptic.io verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email.`
}

export function welcomeEmailHtml(
	greeting: string,
	preferencesUrl: string,
	unsubscribeUrl: string,
): string {
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
	`
}

export function welcomeEmailText(
	greeting: string,
	preferencesUrl: string,
	unsubscribeUrl: string,
): string {
	return `${greeting}\n\nThank you for subscribing! You'll now receive:\n- Daily scripture readings from the Coptic Orthodox lectionary\n- Reminders for upcoming feast days and celebrations\n\nManage your preferences: ${preferencesUrl}\n\nUnsubscribe: ${unsubscribeUrl}`
}

// ---- Daily Readings Email ---------------------------------------------------

export interface DailyReadingEntry {
	label: string
	reference: string
	firstVerse?: string
}

export interface DailyEmailData {
	gregorianDate: string
	copticDate: string
	season?: string | null
	seasonDay?: string | null
	isFasting: boolean
	fastType?: string | null
	celebrations: string[]
	vespers: DailyReadingEntry[]
	matins: DailyReadingEntry[]
	liturgy: DailyReadingEntry[]
	synaxariumNames: string[]
}

function badge(text: string, bg: string, color: string): string {
	return `<span style="display:inline-block;background:${bg};color:${color};font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;margin:4px 4px 0 0;text-transform:uppercase;letter-spacing:0.5px;">${text}</span>`
}

function readingRow(entry: DailyReadingEntry): string {
	const preview = entry.firstVerse
		? `<br><span style="color:#6b7280;font-size:13px;font-style:italic;line-height:1.5;">"${entry.firstVerse}"</span>`
		: ''
	return `<tr>
		<td style="padding:5px 12px 5px 0;vertical-align:top;white-space:nowrap;">
			<span style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">${entry.label}</span>
		</td>
		<td style="padding:5px 0;vertical-align:top;">
			<span style="color:#1f2937;font-size:14px;font-weight:500;">${entry.reference}</span>${preview}
		</td>
	</tr>`
}

function serviceSection(title: string, entries: DailyReadingEntry[]): string {
	if (entries.length === 0) return ''
	return `<div style="margin-bottom:20px;">
		<p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#92400e;border-bottom:1px solid #fef3c7;padding-bottom:6px;">${title}</p>
		<table style="width:100%;border-collapse:collapse;"><tbody>${entries.map(readingRow).join('')}</tbody></table>
	</div>`
}

export function dailyReadingsEmailHtml(
	greeting: string,
	data: DailyEmailData,
	readingsUrl: string,
	preferencesUrl: string,
	unsubscribeUrl: string,
): string {
	const hasReadings = data.vespers.length > 0 || data.matins.length > 0 || data.liturgy.length > 0

	const badges = [
		data.season ? badge(data.season, '#fef3c7', '#92400e') : '',
		data.isFasting ? badge(data.fastType ?? 'Fasting Day', '#fce7f3', '#9d174d') : '',
	]
		.filter(Boolean)
		.join('')

	const celebrationsSection =
		data.celebrations.length > 0
			? `<div style="background:#fffbeb;border-top:3px solid #f59e0b;padding:14px 24px;">
			<p style="margin:0 0 6px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#92400e;">Today's Celebrations</p>
			${data.celebrations.map((c) => `<p style="margin:3px 0;color:#1f2937;font-size:14px;">&#x2726; ${c}</p>`).join('')}
		</div>`
			: ''

	const synaxariumSection =
		data.synaxariumNames.length > 0
			? `<div style="border-top:1px solid #f3f4f6;padding:16px 24px;">
			<p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Saints of the Day</p>
			${data.synaxariumNames.map((n) => `<p style="margin:3px 0;color:#374151;font-size:14px;">&#xB7; ${n}</p>`).join('')}
		</div>`
			: ''

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Daily Readings - Coptic.io</title>
</head>
<body style="margin:0;padding:16px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

	<!-- Header -->
	<div style="background:#92400e;padding:28px 24px;text-align:center;">
		<p style="margin:0;color:#fde68a;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Coptic.io</p>
		<h1 style="margin:6px 0 0 0;color:#ffffff;font-size:22px;font-weight:600;letter-spacing:-0.3px;">Daily Readings</h1>
	</div>

	<!-- Date -->
	<div style="padding:18px 24px 14px;border-bottom:1px solid #f3f4f6;">
		<p style="margin:0;color:#1f2937;font-size:16px;font-weight:600;">${data.copticDate}</p>
		<p style="margin:3px 0 8px;color:#6b7280;font-size:13px;">${data.gregorianDate}</p>
		${badges}
		${data.seasonDay ? `<p style="margin:8px 0 0;color:#a16207;font-size:13px;">${data.seasonDay}</p>` : ''}
	</div>

	${celebrationsSection}

	<!-- Greeting -->
	<div style="padding:20px 24px 4px;">
		<p style="margin:0;color:#374151;font-size:15px;">${greeting},</p>
		<p style="margin:6px 0 0;color:#6b7280;font-size:14px;">Here are today's readings from the Coptic Orthodox lectionary.</p>
	</div>

	<!-- Readings -->
	${
		hasReadings
			? `<div style="padding:16px 24px 4px;">
		${serviceSection('Vespers', data.vespers)}
		${serviceSection('Matins', data.matins)}
		${serviceSection('Divine Liturgy', data.liturgy)}
	</div>`
			: ''
	}

	${synaxariumSection}

	<!-- CTA -->
	<div style="padding:16px 24px 24px;text-align:center;">
		<a href="${readingsUrl}" style="display:inline-block;background:#d97706;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;letter-spacing:0.2px;">Read Full Passages &#x2192;</a>
	</div>

	<!-- Footer -->
	<div style="border-top:1px solid #f3f4f6;padding:14px 24px;text-align:center;background:#f9fafb;">
		<p style="margin:0;color:#9ca3af;font-size:12px;">
			<a href="${preferencesUrl}" style="color:#9ca3af;text-decoration:underline;">Manage preferences</a>
			&nbsp;&#xB7;&nbsp;
			<a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
		</p>
		<p style="margin:6px 0 0;color:#d1d5db;font-size:11px;">Coptic.io &mdash; Daily Coptic Orthodox Readings</p>
	</div>

</div>
</body>
</html>`
}

export function dailyReadingsEmailText(
	greeting: string,
	data: DailyEmailData,
	readingsUrl: string,
	unsubscribeUrl: string,
): string {
	const lines: string[] = [
		'COPTIC.IO - Daily Readings',
		`${data.copticDate} | ${data.gregorianDate}`,
	]
	if (data.season) lines.push(data.isFasting ? `${data.season} | Fasting Day` : data.season)
	lines.push('', `${greeting},`, "Here are today's readings from the Coptic Orthodox lectionary.")

	if (data.celebrations.length > 0) {
		lines.push('', "TODAY'S CELEBRATIONS", ...data.celebrations.map((c) => `* ${c}`))
	}

	const groups: Array<{ service: string; entries: DailyReadingEntry[] }> = [
		{ service: 'VESPERS', entries: data.vespers },
		{ service: 'MATINS', entries: data.matins },
		{ service: 'DIVINE LITURGY', entries: data.liturgy },
	]
	for (const { service, entries } of groups) {
		if (entries.length > 0) {
			lines.push('', service, ...entries.map((e) => `  ${e.label}: ${e.reference}`))
		}
	}

	if (data.synaxariumNames.length > 0) {
		lines.push('', 'SAINTS OF THE DAY', ...data.synaxariumNames.map((n) => `* ${n}`))
	}

	lines.push('', `Read full passages: ${readingsUrl}`, '', `Unsubscribe: ${unsubscribeUrl}`)
	return lines.join('\n')
}
