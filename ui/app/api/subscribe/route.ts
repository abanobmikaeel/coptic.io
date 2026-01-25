import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { sendOTPEmail, generateOTP } from '@/lib/email';
import { isValidEmail } from '@/lib/utils';
import type { Subscriber } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed and verified
    const existing = await queryOne<Subscriber>(
      'SELECT id, email, verified FROM subscribers WHERE email = $1',
      [normalizedEmail]
    );

    if (existing?.verified) {
      return NextResponse.json({ error: 'Email already subscribed' }, { status: 409 });
    }

    // Generate OTP
    const code = generateOTP();

    // Delete any existing unused OTPs for this email
    await query('DELETE FROM otp_codes WHERE email = $1 AND used = FALSE', [normalizedEmail]);

    // Insert new OTP (use DB time to avoid timezone issues)
    await query(
      `INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
      [normalizedEmail, code]
    );

    // Send OTP email
    await sendOTPEmail(normalizedEmail, code);

    return NextResponse.json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Failed to process subscription' }, { status: 500 });
  }
}
