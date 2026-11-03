// Verifies Amazon SNS message signatures, so only genuine notifications from our own
// SES topics can confirm the subscription or remove subscribers.
// https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html

export interface SNSMessage {
	Type: string
	MessageId: string
	Message: string
	Subject?: string
	Timestamp: string
	TopicArn: string
	Token?: string
	SubscribeURL?: string
	Signature: string
	SignatureVersion: string
	SigningCertURL: string
}

type HashName = 'SHA-1' | 'SHA-256'

/** Loads the RSA public key from an SNS signing certificate. */
export type SigningKeyLoader = (certUrl: string, hash: HashName) => Promise<CryptoKey>

// Fields covered by the signature, in the order SNS signs them. Subject is signed only
// when present.
const SIGNED_FIELDS: Record<string, Array<keyof SNSMessage>> = {
	Notification: ['Message', 'MessageId', 'Subject', 'Timestamp', 'TopicArn', 'Type'],
	SubscriptionConfirmation: [
		'Message',
		'MessageId',
		'SubscribeURL',
		'Timestamp',
		'Token',
		'TopicArn',
		'Type',
	],
	UnsubscribeConfirmation: [
		'Message',
		'MessageId',
		'SubscribeURL',
		'Timestamp',
		'Token',
		'TopicArn',
		'Type',
	],
}

const HASHES: Record<string, HashName> = { '1': 'SHA-1', '2': 'SHA-256' }

/** The text SNS signs: each present field name and value, one per line. */
export const stringToSign = (message: SNSMessage, fields: Array<keyof SNSMessage>): string =>
	fields
		.filter((field) => message[field] !== undefined)
		.map((field) => `${field}\n${message[field]}\n`)
		.join('')

const CERT_FILE = /^SimpleNotificationService-[0-9a-f]+\.pem$/

/**
 * The signing certificate URL, or null when `value` is not a certificate on the SNS host
 * of `topicArn`'s region. The host comes from our own configured topic, never from the
 * request; only the file name is taken from `value`.
 */
export const trustedCertUrl = (value: string, topicArn: string): string | null => {
	const region = topicArn.split(':')[3] ?? ''
	if (!/^[a-z0-9-]+$/.test(region)) return null
	const origin = `https://sns.${region}.amazonaws.com/`
	const file = value.startsWith(origin) ? value.slice(origin.length) : ''
	return CERT_FILE.test(file) ? origin + file : null
}

const base64ToBytes = (base64: string): Uint8Array<ArrayBuffer> =>
	Uint8Array.from(atob(base64), (char) => char.codePointAt(0) ?? 0)

/** Reads one DER element at `offset`: where its content starts and where it ends. */
const readElement = (der: Uint8Array, offset: number) => {
	const tag = der[offset]
	let length = der[offset + 1] ?? 0
	let start = offset + 2
	if (length & 0x80) {
		const bytes = length & 0x7f
		length = 0
		for (let i = 0; i < bytes; i++) length = length * 256 + (der[start + i] ?? 0)
		start += bytes
	}
	return { tag, start, end: start + length }
}

/**
 * Extracts the SubjectPublicKeyInfo from a PEM certificate, which Web Crypto can import
 * directly. Certificate → tbsCertificate → [version], serial, signature, issuer,
 * validity, subject, subjectPublicKeyInfo.
 */
export const spkiFromCertificate = (pem: string): Uint8Array<ArrayBuffer> => {
	const der = base64ToBytes(pem.replace(/-----[^-]+-----|\s/g, ''))
	const certificate = readElement(der, 0)
	const tbs = readElement(der, certificate.start)

	let offset = tbs.start
	if (readElement(der, offset).tag === 0xa0) offset = readElement(der, offset).end
	for (let i = 0; i < 5; i++) offset = readElement(der, offset).end

	const spki = readElement(der, offset)
	if (spki.tag !== 0x30) throw new Error('Certificate has no public key')
	return der.slice(offset, spki.end)
}

const keyCache = new Map<string, Promise<CryptoKey>>()

const loadSigningKey: SigningKeyLoader = (certUrl, hash) => {
	const cacheKey = `${hash} ${certUrl}`
	let key = keyCache.get(cacheKey)
	if (!key) {
		key = fetch(certUrl)
			.then((res) => {
				if (!res.ok) throw new Error(`Could not fetch SNS signing certificate (${res.status})`)
				return res.text()
			})
			.then((pem) =>
				crypto.subtle.importKey(
					'spki',
					spkiFromCertificate(pem),
					{ name: 'RSASSA-PKCS1-v1_5', hash },
					false,
					['verify'],
				),
			)
		key.catch(() => keyCache.delete(cacheKey))
		keyCache.set(cacheKey, key)
	}
	return key
}

/**
 * True when `message` is signed by SNS and comes from one of `allowedTopics`. The topic
 * check matters: anyone can create an SNS topic and send validly signed messages from it.
 */
export async function verifySnsMessage(
	message: Partial<SNSMessage>,
	allowedTopics: string[],
	loadKey: SigningKeyLoader = loadSigningKey,
): Promise<boolean> {
	const fields = message.Type ? SIGNED_FIELDS[message.Type] : undefined
	const hash = message.SignatureVersion ? HASHES[message.SignatureVersion] : undefined
	const topic = allowedTopics.find((arn) => arn === message.TopicArn)
	if (!fields || !hash || !topic) {
		return false
	}
	const certUrl = message.SigningCertURL ? trustedCertUrl(message.SigningCertURL, topic) : null
	if (!message.Signature || !certUrl) {
		return false
	}
	if (fields.some((field) => field !== 'Subject' && typeof message[field] !== 'string')) {
		return false
	}

	try {
		const key = await loadKey(certUrl, hash)
		return await crypto.subtle.verify(
			'RSASSA-PKCS1-v1_5',
			key,
			base64ToBytes(message.Signature),
			new TextEncoder().encode(stringToSign(message as SNSMessage, fields)),
		)
	} catch (error) {
		console.error('SNS signature check failed:', error)
		return false
	}
}
