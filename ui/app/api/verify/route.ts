import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { sendWelcomeEmail, generateToken } from '@/lib/email';

interface OTPCode {
  id: string;
  email: string;
  code: string;
  expires_at: Date;
  used: boolean;
}

interface Subscriber {
  id: string;
  email: string;
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, code, name, patronSaint } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const subscriberName = typeof name === 'string' ? name.trim() : null;
    const subscriberPatronSaint = typeof patronSaint === 'string' ? patronSaint.trim() : null;

    const normalizedEmail = email.toLowerCase().trim();

    // Find valid OTP
    const otp = await queryOne<OTPCode>(
      `SELECT id, email, code, expires_at, used FROM otp_codes
       WHERE email = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [normalizedEmail, code]
    );

    if (!otp) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Mark OTP as used
    await query('UPDATE otp_codes SET used = TRUE WHERE id = $1', [otp.id]);

    // Generate a token for managing preferences
    const token = generateToken();

    // Create or update subscriber
    const subscriber = await queryOne<Subscriber>(
      `INSERT INTO subscribers (email, name, patron_saint, verified, token, updated_at)
       VALUES ($1, $2, $3, TRUE, $4, NOW())
       ON CONFLICT (email) DO UPDATE SET
         name = COALESCE($2, subscribers.name),
         patron_saint = COALESCE($3, subscribers.patron_saint),
         verified = TRUE,
         token = $4,
         updated_at = NOW()
       RETURNING id, email, token`,
      [normalizedEmail, subscriberName, subscriberPatronSaint, token]
    );

    // Send welcome email
    if (subscriber) {
      await sendWelcomeEmail(subscriberName || normalizedEmail, normalizedEmail, token);
    }

    return NextResponse.json({
      message: 'Email verified successfully',
      token: subscriber?.token
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
  }
}
