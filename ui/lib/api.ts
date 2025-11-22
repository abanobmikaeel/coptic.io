import type { CalendarData, UpcomingCelebration, Celebration } from './types';

const API_BASE = 'https://copticio-production.up.railway.app/api';

export async function getCalendarData(): Promise<CalendarData | null> {
  try {
    const res = await fetch(`${API_BASE}/calendar`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching calendar:', error);
    return null;
  }
}

export async function getTodayCelebrations(): Promise<Celebration[] | null> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const res = await fetch(`${API_BASE}/celebrations/${today}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching celebrations:', error);
    return null;
  }
}

export async function getUpcomingCelebrations(days: number = 60): Promise<UpcomingCelebration[] | null> {
  try {
    const res = await fetch(`${API_BASE}/celebrations/upcoming/list?days=${days}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching upcoming:', error);
    return null;
  }
}
