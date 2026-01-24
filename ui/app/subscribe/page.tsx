'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';

type Step = 'email' | 'verify' | 'success';

function SubscribeContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [patronSaint, setPatronSaint] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle redirect from homepage with email pre-filled
  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlStep = searchParams.get('step');
    if (urlEmail) {
      setEmail(urlEmail);
      if (urlStep === 'verify') {
        setStep('verify');
      }
    }
  }, [searchParams]);

  async function handleEmailSubmit(e: React.FormEvent) {
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
        setError(data.error || 'Failed to send verification code');
        return;
      }

      setStep('verify');
    } catch {
      setError('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, name, patronSaint }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to verify code');
        return;
      }

      // Store token for preference management
      if (data.token) {
        localStorage.setItem('subscriberToken', data.token);
      }

      setStep('success');
    } catch {
      setError('Failed to verify code');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
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
        setError(data.error || 'Failed to resend code');
        return;
      }

      setCode('');
    } catch {
      setError('Failed to resend code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <section className="relative pt-24 pb-12 px-6">
        <div className="max-w-md mx-auto">
          <Card>
            {step === 'email' && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Subscribe to Daily Readings
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Receive daily scripture readings and feast day reminders from the Coptic Orthodox calendar.
                </p>

                <form onSubmit={handleEmailSubmit}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  />

                  {error && (
                    <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {loading ? 'Sending...' : 'Continue'}
                  </button>
                </form>
              </>
            )}

            {step === 'verify' && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Complete your subscription
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We sent a 6-digit code to <span className="font-medium text-gray-900 dark:text-white">{email}</span>
                </p>

                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Verification code
                    </label>
                    <input
                      type="text"
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your name <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mina"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="patronSaint" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Patron saint <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="patronSaint"
                      value={patronSaint}
                      onChange={(e) => setPatronSaint(e.target.value)}
                      placeholder="e.g. St. Mary, St. George"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {loading ? 'Verifying...' : 'Subscribe'}
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <button
                    onClick={() => setStep('email')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Change email
                  </button>
                  <button
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-amber-600 hover:text-amber-500 transition-colors"
                  >
                    Resend code
                  </button>
                </div>
              </>
            )}

            {step === 'success' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  You're subscribed!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Check your inbox for a welcome email. You'll start receiving daily readings and feast reminders.
                </p>
                <div className="space-y-3">
                  <a
                    href="/preferences"
                    className="block w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Manage preferences
                  </a>
                  <a
                    href="/"
                    className="block w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium py-2 transition-colors"
                  >
                    Return home
                  </a>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen relative overflow-hidden">
        <section className="relative pt-24 pb-12 px-6">
          <div className="max-w-md mx-auto">
            <Card>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-6"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </Card>
          </div>
        </section>
      </main>
    }>
      <SubscribeContent />
    </Suspense>
  );
}
