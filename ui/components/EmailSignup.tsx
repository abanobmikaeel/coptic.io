'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmailSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          // Already subscribed
          setError('This email is already subscribed');
        } else {
          setError(data.error || 'Something went wrong');
        }
        return;
      }

      // Redirect to subscribe page to complete verification
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
      router.push(`/subscribe?email=${encodeURIComponent(email)}&step=verify&tz=${encodeURIComponent(tz)}`);
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-500 disabled:bg-amber-400 text-white font-medium py-3 px-6 rounded-xl transition-colors whitespace-nowrap"
        >
          {loading ? 'Sending...' : 'Get Daily Readings'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
      )}
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        Free daily emails. Unsubscribe anytime.
      </p>
    </form>
  );
}
