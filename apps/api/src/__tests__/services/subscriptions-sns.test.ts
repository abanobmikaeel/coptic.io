import { X509Certificate } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import {
	type SNSMessage,
	spkiFromCertificate,
	stringToSign,
	trustedCertUrl,
	verifySnsMessage,
} from '../../services/subscriptions/sns'

// Self-signed certificate used only to check public key extraction. Its private key was
// never kept.
const FIXTURE_CERT = `-----BEGIN CERTIFICATE-----
MIIC+DCCAeCgAwIBAgIUe8bs2BJzO3iEhB8Tva+G12JccEowDQYJKoZIhvcNAQEL
BQAwGzEZMBcGA1UEAwwQc25zLXRlc3QtZml4dHVyZTAgFw0yNjExMDMwMjE2NTZa
GA8yMTI2MTAxMDAyMTY1NlowGzEZMBcGA1UEAwwQc25zLXRlc3QtZml4dHVyZTCC
ASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL4u3AbPc/BTxbmMrOn6iu6W
grnbLs1OOLg1n2neQTKvTknuns4Jxsx9wtAM5Vy4Cs8KMothsTSeyIgrqW+ldkQq
KtL0Nyb1gK1iRR3iPpNYdsTn7+HZ7fDYxTMgCyFJ8w072nhn5h5du6qVzwTqapuA
cFX8Wt03vk6xODkYRY3eUXz7vc6Hnr9W/JNKJ6mdDAt0Iw1svI4a6HyA1sDbpdsx
bb4dZRQus7NloWMvCLXKrLLQfp5V2Y7PRn+GIZxPu6hJ6Nf8dk5p0d0uRwLp7TV6
Gs7+d5og6e6Uy6jrRphNkzdwNuadSZcN8sqllTQoqeQPFBkSksurhePPTnoHHq0C
AwEAAaMyMDAwHQYDVR0OBBYEFDqIux9zaS7EyJw3+6yTeirtg4EJMA8GA1UdEwEB
/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAHYqJ2ZeGGsj9uHP8g3hS85g9vSp
gBVNmAUhiKT4eMR1lbGlLIYT05O8TH+DkAmLGrQRkG0O2OVtvEUqhQf1oSeFY+Ql
hUGyIMHjbK2DLxLD9JQNsIpD1KtaWyeMDn1cnZcUo1Es1FqtEwJ0ZGK70Io+VVv6
e4VvaYgUHRXZkIOpzxTnlWrLeyNVAHqAsiVaAqosJGtyFWGcC3boSjp/NBeZJMOt
GU5aIrNCFB2OL3YRI0tpVAyWzOTeEyth6sXqqzLXtYM7vFx62tsXUnesFISksHfQ
Y/kxiB/7IT/bNS5uRg7JsP8QRjCPxUpW8C7NBzFZgHsht/pwL839pBrSlYo=
-----END CERTIFICATE-----`

const TOPIC = 'arn:aws:sns:us-east-1:123456789012:ses-bounces'
const CERT_URL = 'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-abc.pem'

const NOTIFICATION_FIELDS: Array<keyof SNSMessage> = [
	'Message',
	'MessageId',
	'Subject',
	'Timestamp',
	'TopicArn',
	'Type',
]

const notification = (overrides: Partial<SNSMessage> = {}): SNSMessage => ({
	Type: 'Notification',
	MessageId: 'm-1',
	Message: '{"notificationType":"Bounce"}',
	Timestamp: '2026-11-02T20:00:00.000Z',
	TopicArn: TOPIC,
	Signature: '',
	SignatureVersion: '2',
	SigningCertURL: CERT_URL,
	...overrides,
})

const toBase64 = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes)))

/** Signs `message` the way SNS does and returns it with a key loader for the signer. */
async function signed(message: SNSMessage, fields: Array<keyof SNSMessage>) {
	const hash = message.SignatureVersion === '1' ? 'SHA-1' : 'SHA-256'
	const keys = (await crypto.subtle.generateKey(
		{
			name: 'RSASSA-PKCS1-v1_5',
			modulusLength: 2048,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash,
		},
		false,
		['sign', 'verify'],
	)) as CryptoKeyPair
	const signature = await crypto.subtle.sign(
		'RSASSA-PKCS1-v1_5',
		keys.privateKey,
		new TextEncoder().encode(stringToSign(message, fields)),
	)
	return {
		message: { ...message, Signature: toBase64(signature) },
		loadKey: vi.fn(async () => keys.publicKey),
	}
}

describe('stringToSign', () => {
	it('lists each present field and value on its own line, skipping a missing Subject', () => {
		expect(stringToSign(notification(), NOTIFICATION_FIELDS)).toBe(
			`Message\n{"notificationType":"Bounce"}\nMessageId\nm-1\nTimestamp\n2026-11-02T20:00:00.000Z\nTopicArn\n${TOPIC}\nType\nNotification\n`,
		)
		expect(stringToSign(notification({ Subject: 'Hi' }), NOTIFICATION_FIELDS)).toContain(
			'MessageId\nm-1\nSubject\nHi\nTimestamp\n',
		)
	})
})

describe('trustedCertUrl', () => {
	it('accepts only certificates on the SNS host of the topic’s region', () => {
		expect(trustedCertUrl(CERT_URL, TOPIC)).toBe(CERT_URL)
		for (const url of [
			CERT_URL.replace('https:', 'http:'),
			CERT_URL.replace('us-east-1', 'eu-west-1'),
			'https://sns.us-east-1.amazonaws.com.evil.example/SimpleNotificationService-abc.pem',
			'https://evil.example/sns.us-east-1.amazonaws.com/SimpleNotificationService-abc.pem',
			'https://user@sns.us-east-1.amazonaws.com/SimpleNotificationService-abc.pem',
			`${CERT_URL}?x=1`,
			'https://sns.us-east-1.amazonaws.com/other.pem',
			'https://sns.us-east-1.amazonaws.com/sub/SimpleNotificationService-abc.pem',
			'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-abc.txt',
			'not a url',
		]) {
			expect(trustedCertUrl(url, TOPIC)).toBeNull()
		}
		expect(trustedCertUrl(CERT_URL, 'not-an-arn')).toBeNull()
	})
})

describe('spkiFromCertificate', () => {
	it('extracts the same public key Node reads from the certificate', () => {
		const expected = new X509Certificate(FIXTURE_CERT).publicKey.export({
			type: 'spki',
			format: 'der',
		})
		expect(Buffer.from(spkiFromCertificate(FIXTURE_CERT))).toEqual(expected)
	})
})

describe('verifySnsMessage', () => {
	it('accepts a SHA-256 (v2) and a SHA-1 (v1) signed notification from an allowed topic', async () => {
		for (const SignatureVersion of ['2', '1']) {
			const { message, loadKey } = await signed(
				notification({ SignatureVersion }),
				NOTIFICATION_FIELDS,
			)
			expect(await verifySnsMessage(message, [TOPIC], loadKey)).toBe(true)
			expect(loadKey).toHaveBeenCalledWith(CERT_URL, SignatureVersion === '1' ? 'SHA-1' : 'SHA-256')
		}
	})

	it('accepts a signed subscription confirmation', async () => {
		const { message, loadKey } = await signed(
			notification({
				Type: 'SubscriptionConfirmation',
				Token: 'tok',
				SubscribeURL: 'https://sns.us-east-1.amazonaws.com/?Action=ConfirmSubscription',
			}),
			['Message', 'MessageId', 'SubscribeURL', 'Timestamp', 'Token', 'TopicArn', 'Type'],
		)
		expect(await verifySnsMessage(message, [TOPIC], loadKey)).toBe(true)
	})

	it('rejects a message whose content changed after signing', async () => {
		const { message, loadKey } = await signed(notification(), NOTIFICATION_FIELDS)
		const tampered = { ...message, Message: '{"notificationType":"Complaint"}' }
		expect(await verifySnsMessage(tampered, [TOPIC], loadKey)).toBe(false)
	})

	it('rejects a validly signed message from a topic that is not ours', async () => {
		const { message, loadKey } = await signed(notification(), NOTIFICATION_FIELDS)
		expect(await verifySnsMessage(message, ['arn:aws:sns:us-east-1:1:other'], loadKey)).toBe(false)
		expect(await verifySnsMessage(message, [], loadKey)).toBe(false)
		expect(loadKey).not.toHaveBeenCalled()
	})

	it('never fetches a certificate from outside SNS', async () => {
		const { message, loadKey } = await signed(
			notification({ SigningCertURL: 'https://evil.example/cert.pem' }),
			NOTIFICATION_FIELDS,
		)
		expect(await verifySnsMessage(message, [TOPIC], loadKey)).toBe(false)
		expect(loadKey).not.toHaveBeenCalled()
	})

	it('rejects unknown types, versions, missing fields and garbage signatures', async () => {
		const { message, loadKey } = await signed(notification(), NOTIFICATION_FIELDS)
		expect(await verifySnsMessage({ ...message, Type: 'Other' }, [TOPIC], loadKey)).toBe(false)
		expect(await verifySnsMessage({ ...message, SignatureVersion: '3' }, [TOPIC], loadKey)).toBe(
			false,
		)
		expect(await verifySnsMessage({ ...message, MessageId: undefined }, [TOPIC], loadKey)).toBe(
			false,
		)
		expect(await verifySnsMessage({ ...message, Signature: '%%%' }, [TOPIC], loadKey)).toBe(false)
		expect(await verifySnsMessage({}, [TOPIC], loadKey)).toBe(false)
	})

	it('treats a certificate that cannot be loaded as a failed check', async () => {
		const { message } = await signed(notification(), NOTIFICATION_FIELDS)
		const failing = vi.fn(async () => {
			throw new Error('network')
		})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		expect(await verifySnsMessage(message, [TOPIC], failing)).toBe(false)
	})
})
