import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  patron_saint: string | null;
  verified: boolean;
  daily_readings: boolean;
  feast_reminders: boolean;
}

function getToken(request: NextRequest): string | null {
  const url = new URL(request.url);
  return url.searchParams.get('token') || request.headers.get('x-subscriber-token');
}

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const subscriber = await queryOne<Subscriber>(
      `SELECT id, email, name, patron_saint, verified, daily_readings, feast_reminders
       FROM subscribers WHERE token = $1 AND verified = TRUE`,
      [token]
    );

    if (!subscriber) {
      return NextResponse.json({ error: 'Invalid token or subscriber not found' }, { status: 404 });
    }

    return NextResponse.json({
      email: subscriber.email,
      name: subscriber.name,
      patronSaint: subscriber.patron_saint,
      dailyReadings: subscriber.daily_readings,
      feastReminders: subscriber.feast_reminders,
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json({ error: 'Failed to get preferences' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getToken(request);

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const { name, patronSaint, dailyReadings, feastReminders } = await request.json();

    if (typeof dailyReadings !== 'boolean' || typeof feastReminders !== 'boolean') {
      return NextResponse.json({ error: 'Invalid preferences format' }, { status: 400 });
    }

    const subscriberName = typeof name === 'string' ? name.trim() || null : null;
    const subscriberPatronSaint = typeof patronSaint === 'string' ? patronSaint.trim() || null : null;

    const result = await query<Subscriber>(
      `UPDATE subscribers
       SET name = $1, patron_saint = $2, daily_readings = $3, feast_reminders = $4, updated_at = NOW()
       WHERE token = $5 AND verified = TRUE
       RETURNING id, email, name, patron_saint, daily_readings, feast_reminders`,
      [subscriberName, subscriberPatronSaint, dailyReadings, feastReminders, token]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: 'Invalid token or subscriber not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Preferences updated successfully',
      name: result[0].name,
      patronSaint: result[0].patron_saint,
      dailyReadings: result[0].daily_readings,
      feastReminders: result[0].feast_reminders,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
