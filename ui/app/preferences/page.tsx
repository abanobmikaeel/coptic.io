'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useFetch } from '@/lib/hooks';
import type { SubscriberPreferences } from '@/lib/types';

function PreferencesContent() {
  const searchParams = useSearchParams();
  const [preferences, setPreferences] = useState<SubscriberPreferences | null>(null);
  const [success, setSuccess] = useState('');
  const [fetchComplete, setFetchComplete] = useState(false);

  const saveFetch = useFetch();
  const unsubscribeFetch = useFetch();

  // Compute token from URL or localStorage
  const urlToken = searchParams.get('token');
  const [token] = useState<string | null>(() => {
    if (typeof window === 'undefined') return urlToken;
    const stored = localStorage.getItem('subscriberToken');
    return urlToken || stored;
  });

  // Derive loading state
  const loading = token ? !fetchComplete : false;

  // Store URL token and fetch preferences
  useEffect(() => {
    if (urlToken && typeof window !== 'undefined') {
      localStorage.setItem('subscriberToken', urlToken);
    }

    if (!token) return;

    let cancelled = false;
    fetch(`/api/preferences?token=${token}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load preferences');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setPreferences(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFetchComplete(true);
      });

    return () => { cancelled = true; };
  }, [token, urlToken]);

  async function handleSave() {
    if (!preferences || !token) return;
    setSuccess('');

    const result = await saveFetch.execute(`/api/preferences?token=${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: preferences.name,
        patronSaint: preferences.patronSaint,
        dailyReadings: preferences.dailyReadings,
        feastReminders: preferences.feastReminders,
      }),
    });

    if (result) {
      setSuccess('Preferences saved successfully');
    }
  }

  async function handleUnsubscribe() {
    if (!token) return;

    if (!confirm('Are you sure you want to unsubscribe? You will stop receiving all emails.')) {
      return;
    }

    const result = await unsubscribeFetch.execute('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (result) {
      localStorage.removeItem('subscriberToken');
      window.location.href = '/?unsubscribed=true';
    }
  }

  const saving = saveFetch.loading || unsubscribeFetch.loading;
  const error = saveFetch.error || unsubscribeFetch.error;

  if (loading) {
    return (
      <main className="min-h-screen relative overflow-hidden">
        <section className="relative pt-24 pb-12 px-6">
          <div className="max-w-md mx-auto">
            <CardSkeleton />
          </div>
        </section>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen relative overflow-hidden">
        <section className="relative pt-24 pb-12 px-6">
          <div className="max-w-md mx-auto">
            <Card>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Manage Preferences
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                To manage your email preferences, please use the link from any email we&apos;ve sent you, or subscribe to get started.
              </p>
              <Link
                href="/subscribe"
                className="block w-full bg-amber-700 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
              >
                Subscribe
              </Link>
            </Card>
          </div>
        </section>
      </main>
    );
  }

  if (!preferences) {
    return (
      <main className="min-h-screen relative overflow-hidden">
        <section className="relative pt-24 pb-12 px-6">
          <div className="max-w-md mx-auto">
            <Card>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Unable to load preferences
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The link may have expired or be invalid.
              </p>
              <Link
                href="/subscribe"
                className="block w-full bg-amber-700 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
              >
                Subscribe again
              </Link>
            </Card>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <section className="relative pt-24 pb-12 px-6">
        <div className="max-w-md mx-auto">
          <Card>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Preferences
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Manage your subscription settings for <span className="font-medium text-gray-900 dark:text-white">{preferences.email}</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your name
                </label>
                <Input
                  type="text"
                  id="name"
                  value={preferences.name || ''}
                  onChange={(e) => setPreferences(prev => prev ? { ...prev, name: e.target.value || null } : null)}
                  placeholder="e.g. Mina"
                />
              </div>

              <div>
                <label htmlFor="patronSaint" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Patron saint
                </label>
                <Input
                  type="text"
                  id="patronSaint"
                  value={preferences.patronSaint || ''}
                  onChange={(e) => setPreferences(prev => prev ? { ...prev, patronSaint: e.target.value || null } : null)}
                  placeholder="e.g. St. Mary, St. George"
                />
              </div>
            </div>

            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Email notifications</p>
            <div className="space-y-3 mb-6">
              <Checkbox
                label="Daily Readings"
                description="Scripture readings for each day"
                checked={preferences.dailyReadings}
                onChange={(e) => setPreferences(prev => prev ? { ...prev, dailyReadings: e.target.checked } : null)}
              />
              <Checkbox
                label="Feast Reminders"
                description="Notifications for upcoming feast days"
                checked={preferences.feastReminders}
                onChange={(e) => setPreferences(prev => prev ? { ...prev, feastReminders: e.target.checked } : null)}
              />
            </div>

            {error && (
              <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {success && (
              <p className="mb-4 text-sm text-green-600 dark:text-green-400">{success}</p>
            )}

            <Button onClick={handleSave} loading={saving} className="w-full mb-4">
              Save preferences
            </Button>

            <hr className="border-gray-200 dark:border-gray-700 my-6" />

            <Button variant="ghost" onClick={handleUnsubscribe} disabled={saving} className="w-full text-red-600 hover:text-red-700">
              Unsubscribe from all emails
            </Button>
          </Card>
        </div>
      </section>
    </main>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen relative overflow-hidden">
        <section className="relative pt-24 pb-12 px-6">
          <div className="max-w-md mx-auto">
            <CardSkeleton />
          </div>
        </section>
      </main>
    }>
      <PreferencesContent />
    </Suspense>
  );
}
