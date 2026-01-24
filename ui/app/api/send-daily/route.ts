import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  daily_readings: boolean;
  token: string;
}

interface Reading {
  title: string;
  passage: string;
  text?: string;
}

interface CalendarData {
  dateString: string;
  season?: string;
}

export async function POST(request: NextRequest) {
  // Verify secret
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get subscribers who want daily readings
    const subscribers = await query<Subscriber>(
      `SELECT id, email, name, daily_readings, token
       FROM subscribers
       WHERE verified = TRUE AND daily_readings = TRUE AND unsubscribed_at IS NULL`
    );

    if (subscribers.length === 0) {
      return NextResponse.json({ message: 'No subscribers to send to', sent: 0 });
    }

    // Fetch today's readings from the API
    const baseUrl = process.env.RAILWAY_API_URL || 'https://copticio-production.up.railway.app';
    const [calendarRes, readingsRes] = await Promise.all([
      fetch(`${baseUrl}/api/calendar`),
      fetch(`${baseUrl}/api/readings`),
    ]);

    const calendar: CalendarData = await calendarRes.json();
    const readings: Reading[] = await readingsRes.json();

    // Build email content
    const copticDate = calendar.dateString || 'Today';
    const readingsList = readings
      .map((r) => `<h3 style="margin: 16px 0 8px 0; color: #d97706;">${r.title}</h3><p style="margin: 0; color: #6b7280;">${r.passage}</p>`)
      .join('');

    let sent = 0;
    let failed = 0;

    // Send to each subscriber
    for (const subscriber of subscribers) {
      const greeting = subscriber.name ? `Dear ${subscriber.name}` : 'Dear friend';
      const preferencesUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://coptic.io'}/preferences?token=${subscriber.token}`;
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://coptic.io'}/api/unsubscribe?token=${subscriber.token}`;

      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #d97706; margin: 0;">☦ Daily Readings</h1>
            <p style="color: #6b7280; margin: 8px 0 0 0;">${copticDate}</p>
          </div>

          <p>${greeting},</p>
          <p>Here are today's readings from the Coptic Orthodox lectionary:</p>

          <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
            ${readingsList}
          </div>

          <p style="margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://coptic.io'}/readings" style="color: #d97706;">Read full passages →</a>
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            <a href="${preferencesUrl}" style="color: #9ca3af;">Manage preferences</a> ·
            <a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a>
          </p>
        </body>
        </html>
      `;

      try {
        await ses.send(new SendEmailCommand({
          Source: process.env.SES_FROM_EMAIL || 'noreply@coptic.io',
          Destination: { ToAddresses: [subscriber.email] },
          Message: {
            Subject: { Data: `☦ ${copticDate} - Daily Readings` },
            Body: { Html: { Data: htmlBody } },
          },
        }));
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${subscriber.email}:`, err);
        failed++;
      }
    }

    return NextResponse.json({
      message: 'Daily emails sent',
      sent,
      failed,
      total: subscribers.length,
    });
  } catch (error) {
    console.error('Send daily error:', error);
    return NextResponse.json({ error: 'Failed to send daily emails' }, { status: 500 });
  }
}

// Also allow GET for easy testing (still requires auth)
export async function GET(request: NextRequest) {
  return POST(request);
}
