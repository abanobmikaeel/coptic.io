import { type Context, Hono } from 'hono'
import type { Bindings } from '../env'
import { DatabaseUnavailableError, type Db, withDb } from '../services/subscriptions/db'
import { sendOTPEmail, sendWelcomeEmail, siteUrl } from '../services/subscriptions/email'
import { generateOTP, generateToken, isValidEmail } from '../services/subscriptions/tokens'

// Email sign-up, verification and preference management. The web app proxies its
// /api/{subscribe,verify,unsubscribe,preferences,webhooks/ses} paths here.

const DEFAULT_TIMEZONE = 'America/New_York'

type Env = { Bindings: Bindings }

const subscriptions = new Hono<Env>()

/** Runs a handler with a request-scoped DB connection; maps a missing DB to 503. */
const handle =
	(scope: string, fn: (c: Context<Env>, db: Db) => Promise<Response>) =>
	async (c: Context<Env>): Promise<Response> => {
		try {
			return await withDb(c.env, (db) => fn(c, db))
		} catch (error) {
			if (error instanceof DatabaseUnavailableError) {
				return c.json({ error: 'Subscriptions are temporarily unavailable' }, 503)
			}
			console.error(`Error in subscriptions/${scope}:`, error)
			return c.json({ error: `Failed to ${scope}` }, 500)
		}
	}

const readJson = async (c: Context<Env>): Promise<Record<string, unknown>> =>
	c.req.json<Record<string, unknown>>().catch(() => ({}))

subscriptions.post(
	'/subscribe',
	handle('process subscription', async (c, db) => {
		const { email } = await readJson(c)

		if (!email || typeof email !== 'string') {
			return c.json({ error: 'Email is required' }, 400)
		}
		if (!isValidEmail(email)) {
			return c.json({ error: 'Invalid email format' }, 400)
		}

		const normalizedEmail = email.toLowerCase().trim()

		const existing = await db.queryOne<{ verified: number }>(
			'SELECT verified FROM subscribers WHERE email = ?1',
			[normalizedEmail],
		)
		if (existing?.verified) {
			return c.json({ error: 'Email already subscribed' }, 409)
		}

		const code = generateOTP()
		await db.query('DELETE FROM otp_codes WHERE email = ?1 AND used = FALSE', [normalizedEmail])
		// Use DB time to avoid timezone issues
		await db.query(
			`INSERT INTO otp_codes (id, email, code, expires_at)
       VALUES (?1, ?2, ?3, datetime('now', '+10 minutes'))`,
			[crypto.randomUUID(), normalizedEmail, code],
		)

		await sendOTPEmail(c.env, normalizedEmail, code)
		return c.json({ message: 'Verification code sent' })
	}),
)

subscriptions.post(
	'/verify',
	handle('verify email', async (c, db) => {
		const { email, code, name, patronSaint, timezone } = await readJson(c)

		if (!email || !code || typeof email !== 'string' || typeof code !== 'string') {
			return c.json({ error: 'Email and code are required' }, 400)
		}

		const subscriberName = typeof name === 'string' ? name.trim() : null
		const subscriberPatronSaint = typeof patronSaint === 'string' ? patronSaint.trim() : null
		const subscriberTimezone = typeof timezone === 'string' ? timezone : DEFAULT_TIMEZONE
		const normalizedEmail = email.toLowerCase().trim()

		const otp = await db.queryOne<{ id: string }>(
			`SELECT id FROM otp_codes
       WHERE email = ?1 AND code = ?2 AND used = FALSE AND expires_at > datetime('now')
       ORDER BY created_at DESC LIMIT 1`,
			[normalizedEmail, code],
		)
		if (!otp) {
			return c.json({ error: 'Invalid or expired code' }, 400)
		}

		await db.query('UPDATE otp_codes SET used = TRUE WHERE id = ?1', [otp.id])

		const token = generateToken()
		const subscriber = await db.queryOne<{ token: string }>(
			`INSERT INTO subscribers (id, email, name, patron_saint, timezone, verified, token, updated_at)
       VALUES (?6, ?1, ?2, ?3, ?4, TRUE, ?5, datetime('now'))
       ON CONFLICT (email) DO UPDATE SET
         name = COALESCE(?2, subscribers.name),
         patron_saint = COALESCE(?3, subscribers.patron_saint),
         timezone = COALESCE(?4, subscribers.timezone),
         verified = TRUE,
         token = ?5,
         updated_at = datetime('now')
       RETURNING token`,
			[
				normalizedEmail,
				subscriberName,
				subscriberPatronSaint,
				subscriberTimezone,
				token,
				crypto.randomUUID(),
			],
		)

		if (subscriber) {
			await sendWelcomeEmail(c.env, subscriberName || normalizedEmail, normalizedEmail, token)
		}

		return c.json({ message: 'Email verified successfully', token: subscriber?.token })
	}),
)

const deleteByToken = (db: Db, token: string) =>
	db.query<{ id: string }>('DELETE FROM subscribers WHERE token = ?1 RETURNING id', [token])

subscriptions.post(
	'/unsubscribe',
	handle('unsubscribe', async (c, db) => {
		const token = c.req.query('token') || (await readJson(c)).token
		if (!token || typeof token !== 'string') {
			return c.json({ error: 'Token is required' }, 400)
		}

		const removed = await deleteByToken(db, token)
		if (removed.length === 0) {
			return c.json({ error: 'Subscriber not found' }, 404)
		}
		return c.json({ message: 'Successfully unsubscribed' })
	}),
)

// One-click unsubscribe links in emails land here and redirect back to the site.
subscriptions.get('/unsubscribe', async (c) => {
	const home = new URL('/', siteUrl(c.env))
	const token = c.req.query('token')
	if (!token) return c.redirect(home.toString())

	try {
		const removed = await withDb(c.env, (db) => deleteByToken(db, token))
		home.searchParams.set('unsubscribed', removed.length > 0 ? 'true' : 'not_found')
	} catch (error) {
		console.error('Error in subscriptions/unsubscribe (GET):', error)
		home.searchParams.set('unsubscribed', 'error')
	}
	return c.redirect(home.toString())
})

interface PreferencesRow {
	email: string
	name: string | null
	patron_saint: string | null
	// 0/1 from SQLite
	daily_readings: number
	feast_reminders: number
}

const subscriberToken = (c: Context<Env>): string | undefined =>
	c.req.query('token') || c.req.header('x-subscriber-token')

subscriptions.get(
	'/preferences',
	handle('get preferences', async (c, db) => {
		const token = subscriberToken(c)
		if (!token) {
			return c.json({ error: 'Token is required' }, 400)
		}

		const subscriber = await db.queryOne<PreferencesRow>(
			`SELECT email, name, patron_saint, daily_readings, feast_reminders
       FROM subscribers WHERE token = ?1 AND verified = TRUE`,
			[token],
		)
		if (!subscriber) {
			return c.json({ error: 'Invalid token or subscriber not found' }, 404)
		}

		return c.json({
			email: subscriber.email,
			name: subscriber.name,
			patronSaint: subscriber.patron_saint,
			dailyReadings: Boolean(subscriber.daily_readings),
			feastReminders: Boolean(subscriber.feast_reminders),
		})
	}),
)

subscriptions.put(
	'/preferences',
	handle('update preferences', async (c, db) => {
		const token = subscriberToken(c)
		if (!token) {
			return c.json({ error: 'Token is required' }, 400)
		}

		const { name, patronSaint, dailyReadings, feastReminders } = await readJson(c)
		if (typeof dailyReadings !== 'boolean' || typeof feastReminders !== 'boolean') {
			return c.json({ error: 'Invalid preferences format' }, 400)
		}

		const subscriberName = typeof name === 'string' ? name.trim() || null : null
		const subscriberPatronSaint =
			typeof patronSaint === 'string' ? patronSaint.trim() || null : null

		const updated = await db.queryOne<PreferencesRow>(
			`UPDATE subscribers
       SET name = ?1, patron_saint = ?2, daily_readings = ?3, feast_reminders = ?4, updated_at = datetime('now')
       WHERE token = ?5 AND verified = TRUE
       RETURNING email, name, patron_saint, daily_readings, feast_reminders`,
			[subscriberName, subscriberPatronSaint, dailyReadings, feastReminders, token],
		)
		if (!updated) {
			return c.json({ error: 'Invalid token or subscriber not found' }, 404)
		}

		return c.json({
			message: 'Preferences updated successfully',
			name: updated.name,
			patronSaint: updated.patron_saint,
			dailyReadings: Boolean(updated.daily_readings),
			feastReminders: Boolean(updated.feast_reminders),
		})
	}),
)

interface SNSMessage {
	Type: string
	Token?: string
	TopicArn: string
	Message: string
	SubscribeURL?: string
}

type SESNotification =
	| { notificationType: 'Bounce'; bounce: { bouncedRecipients: Array<{ emailAddress: string }> } }
	| {
			notificationType: 'Complaint'
			complaint: { complainedRecipients: Array<{ emailAddress: string }> }
	  }

// SES bounce/complaint notifications via SNS. Always answers 200 so SNS does not retry.
subscriptions.post('/webhooks/ses', async (c) => {
	try {
		const message = JSON.parse(await c.req.text()) as SNSMessage

		if (message.Type === 'SubscriptionConfirmation' && message.SubscribeURL) {
			if (!message.Token || !message.TopicArn) {
				return c.json({ error: 'Missing subscription confirmation fields' }, 400)
			}
			const region = message.TopicArn.split(':')[3] ?? ''
			if (!/^[a-z0-9-]+$/.test(region)) {
				return c.json({ error: 'Invalid topic region' }, 400)
			}
			const confirmUrl = new URL(`https://sns.${region}.amazonaws.com/`)
			confirmUrl.searchParams.set('Action', 'ConfirmSubscription')
			confirmUrl.searchParams.set('TopicArn', message.TopicArn)
			confirmUrl.searchParams.set('Token', message.Token)
			await fetch(confirmUrl.toString())
			console.log('SNS subscription confirmed:', message.TopicArn)
			return c.json({ message: 'Subscription confirmed' })
		}

		if (message.Type === 'Notification') {
			const notification = JSON.parse(message.Message) as SESNotification
			const emails =
				notification.notificationType === 'Bounce'
					? notification.bounce.bouncedRecipients.map((r) => r.emailAddress)
					: notification.notificationType === 'Complaint'
						? notification.complaint.complainedRecipients.map((r) => r.emailAddress)
						: []

			if (emails.length > 0) {
				await withDb(c.env, async (db) => {
					for (const email of emails) {
						await db.query('DELETE FROM subscribers WHERE email = ?1', [email.toLowerCase()])
					}
				})
				console.log(
					`Removed ${emails.length} address(es) after SES ${notification.notificationType}`,
				)
			}
			return c.json({ message: 'Notification processed' })
		}

		return c.json({ message: 'OK' })
	} catch (error) {
		console.error('Error in subscriptions/webhooks/ses:', error)
		return c.json({ error: 'Processing error' }, 200)
	}
})

export default subscriptions
