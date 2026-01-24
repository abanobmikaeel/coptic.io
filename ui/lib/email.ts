import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@coptic.io';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://coptic.io';

export async function sendOTPEmail(email: string, code: string): Promise<void> {
  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: `Your Coptic.io verification code: ${code}` },
      Body: {
        Html: {
          Data: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #d97706; margin-bottom: 24px;">Coptic.io Email Verification</h2>
              <p style="color: #374151; line-height: 1.6;">Your verification code is:</p>
              <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        },
        Text: {
          Data: `Your Coptic.io verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
        },
      },
    },
  });

  await ses.send(command);
}

export async function sendWelcomeEmail(nameOrEmail: string, email: string, token: string): Promise<void> {
  const preferencesUrl = `${BASE_URL}/preferences?token=${token}`;
  const unsubscribeUrl = `${BASE_URL}/api/unsubscribe?token=${token}`;
  const greeting = nameOrEmail.includes('@') ? 'Welcome to Coptic.io!' : `Welcome, ${nameOrEmail}!`;

  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Welcome to Coptic.io Daily Readings' },
      Body: {
        Html: {
          Data: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #d97706; margin-bottom: 24px;">${greeting}</h2>
              <p style="color: #374151; line-height: 1.6;">Thank you for subscribing! You'll now receive:</p>
              <ul style="color: #374151; line-height: 1.8;">
                <li>Daily scripture readings from the Coptic Orthodox lectionary</li>
                <li>Reminders for upcoming feast days and celebrations</li>
              </ul>
              <p style="color: #374151; line-height: 1.6; margin-top: 24px;">
                <a href="${preferencesUrl}" style="color: #d97706;">Manage your preferences</a>
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              <p style="color: #9ca3af; font-size: 12px;">
                <a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a>
              </p>
            </div>
          `,
        },
        Text: {
          Data: `${greeting}\n\nThank you for subscribing! You'll now receive:\n- Daily scripture readings from the Coptic Orthodox lectionary\n- Reminders for upcoming feast days and celebrations\n\nManage your preferences: ${preferencesUrl}\n\nUnsubscribe: ${unsubscribeUrl}`,
        },
      },
    },
  });

  await ses.send(command);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
