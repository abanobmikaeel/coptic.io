'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';

interface Preferences {
  email: string;
  name: string | null;
  patronSaint: string | null;
  dailyReadings: boolean;
  feastReminders: boolean;
}

function PreferencesContent() {
  const searchParams = useSearchParams();
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from URL or localStorage
    const urlToken = searchParams.get('token');
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('subscriberToken') : null;
    const activeToken = urlToken || storedToken;

    if (urlToken && typeof window !== 'undefined') {
      // Store token from URL for future use
      localStorage.setItem('subscriberToken', urlToken);
    }

    setToken(activeToken);

    if (!activeToken) {
      setLoading(false);
      return;
    }

    // Fetch preferences
    fetch(`/api/preferences?token=${activeToken}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load preferences');
        return res.json();
      })
      .then((data) => {
        setPreferences(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  async function handleSave() {
    if (!preferences || !token) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch(`/api/preferences?token=${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: preferences.name,
          patronSaint: preferences.patronSaint,
          dailyReadings: preferences.dailyReadings,
          feastReminders: preferences.feastReminders,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save preferences');
      }

      setSuccess('Preferences saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  }

  async function handleUnsubscribe() {
    if (!token) return;

    if (!confirm('Are you sure you want to unsubscribe? You will stop receiving all emails.')) {
      return;
    }

    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to unsubscribe');
      }

      // Clear stored token
      localStorage.removeItem('subscriberToken');

      // Redirect to home
      window.location.href = '/?unsubscribed=true';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen relative overflow-hidden">
        <section className="relative pt-24 pb-12 px-6">
          <div className="max-w-md mx-auto">
            <Card>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-8"></div>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </Card>
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
                To manage your email preferences, please use the link from any email we've sent you, or subscribe to get started.
              </p>
              <a
                href="/subscribe"
                className="block w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
              >
                Subscribe
              </a>
            </Card>
          </div>
        </section>
      </main>
    );
  }

  if (error && !preferences) {
    return (
      <main className="min-h-screen relative overflow-hidden">
        <section className="relative pt-24 pb-12 px-6">
          <div className="max-w-md mx-auto">
            <Card>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Unable to load preferences
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}. The link may have expired or be invalid.
              </p>
              <a
                href="/subscribe"
                className="block w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
              >
                Subscribe again
              </a>
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
              Manage your subscription settings for <span className="font-medium text-gray-900 dark:text-white">{preferences?.email}</span>
            </p>

            {/* Profile Section */}
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your name
                </label>
                <input
                  type="text"
                  id="name"
                  value={preferences?.name || ''}
                  onChange={(e) =>
                    setPreferences((prev) =>
                      prev ? { ...prev, name: e.target.value || null } : null
                    )
                  }
                  placeholder="e.g. Mina"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="patronSaint" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Patron saint
                </label>
                <input
                  type="text"
                  id="patronSaint"
                  value={preferences?.patronSaint || ''}
                  onChange={(e) =>
                    setPreferences((prev) =>
                      prev ? { ...prev, patronSaint: e.target.value || null } : null
                    )
                  }
                  placeholder="e.g. St. Mary, St. George"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Preferences Section */}
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Email notifications</p>
            <div className="space-y-3 mb-6">
              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Daily Readings</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Scripture readings for each day</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences?.dailyReadings ?? true}
                  onChange={(e) =>
                    setPreferences((prev) =>
                      prev ? { ...prev, dailyReadings: e.target.checked } : null
                    )
                  }
                  className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Feast Reminders</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notifications for upcoming feast days</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences?.feastReminders ?? true}
                  onChange={(e) =>
                    setPreferences((prev) =>
                      prev ? { ...prev, feastReminders: e.target.checked } : null
                    )
                  }
                  className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
              </label>
            </div>

            {error && (
              <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {success && (
              <p className="mb-4 text-sm text-green-600 dark:text-green-400">{success}</p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-400 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4"
            >
              {saving ? 'Saving...' : 'Save preferences'}
            </button>

            <hr className="border-gray-200 dark:border-gray-700 my-6" />

            <button
              onClick={handleUnsubscribe}
              disabled={saving}
              className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium py-2 transition-colors"
            >
              Unsubscribe from all emails
            </button>
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
            <Card>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-8"></div>
              </div>
            </Card>
          </div>
        </section>
      </main>
    }>
      <PreferencesContent />
    </Suspense>
  );
}
