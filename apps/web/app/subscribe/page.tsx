'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckIcon } from '@/components/ui/Icons'
import { Input } from '@/components/ui/Input'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { DEFAULT_TIMEZONE } from '@/constants'
import { useFetch } from '@/lib/hooks'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

type Step = 'email' | 'verify' | 'success'

function SubscribeContent() {
	const searchParams = useSearchParams()

	// Initialize state from URL params
	const urlEmail = searchParams.get('email')
	const urlStep = searchParams.get('step')
	const urlTz = searchParams.get('tz')

	const [step, setStep] = useState<Step>(() =>
		urlEmail && urlStep === 'verify' ? 'verify' : 'email',
	)
	const [email, setEmail] = useState(() => urlEmail || '')
	const [code, setCode] = useState('')
	const [name, setName] = useState('')
	const [patronSaint, setPatronSaint] = useState('')
	const [timezone] = useState(
		() =>
			urlTz ||
			(typeof window !== 'undefined'
				? Intl.DateTimeFormat().resolvedOptions().timeZone
				: DEFAULT_TIMEZONE),
	)

	const subscribeFetch = useFetch()
	const verifyFetch = useFetch<{ token?: string }>()

	async function handleEmailSubmit(e: React.FormEvent) {
		e.preventDefault()
		const result = await subscribeFetch.execute('/api/subscribe', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		})
		if (result) {
			setStep('verify')
		}
	}

	async function handleCodeSubmit(e: React.FormEvent) {
		e.preventDefault()
		const result = await verifyFetch.execute('/api/verify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, code, name, patronSaint, timezone }),
		})
		if (result) {
			if (result.token) {
				localStorage.setItem('subscriberToken', result.token)
			}
			setStep('success')
		}
	}

	async function handleResendCode() {
		await subscribeFetch.execute('/api/subscribe', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		})
		setCode('')
	}

	const loading = subscribeFetch.loading || verifyFetch.loading
	const error = subscribeFetch.error || verifyFetch.error

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
									Receive daily scripture readings and feast day reminders from the Coptic Orthodox
									calendar.
								</p>

								<form onSubmit={handleEmailSubmit}>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
									>
										Email address
									</label>
									<Input
										type="email"
										id="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@example.com"
										required
										error={!!error}
									/>

									{error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

									<Button type="submit" loading={loading} className="mt-4 w-full">
										Continue
									</Button>
								</form>
							</>
						)}

						{step === 'verify' && (
							<>
								<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
									Complete your subscription
								</h1>
								<p className="text-gray-600 dark:text-gray-400 mb-6">
									We sent a 6-digit code to{' '}
									<span className="font-medium text-gray-900 dark:text-white">{email}</span>
								</p>

								<form onSubmit={handleCodeSubmit} className="space-y-4">
									<div>
										<label
											htmlFor="code"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
										>
											Verification code
										</label>
										<Input
											type="text"
											id="code"
											value={code}
											onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
											placeholder="000000"
											required
											maxLength={6}
											className="text-center text-2xl tracking-widest font-mono"
											error={!!error}
										/>
									</div>

									<div>
										<label
											htmlFor="name"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
										>
											Your name <span className="text-gray-400 font-normal">(optional)</span>
										</label>
										<Input
											type="text"
											id="name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="e.g. Mina"
										/>
									</div>

									<div>
										<label
											htmlFor="patronSaint"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
										>
											Patron saint <span className="text-gray-400 font-normal">(optional)</span>
										</label>
										<Input
											type="text"
											id="patronSaint"
											value={patronSaint}
											onChange={(e) => setPatronSaint(e.target.value)}
											placeholder="e.g. St. Mary, St. George"
										/>
									</div>

									{error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

									<Button
										type="submit"
										loading={loading}
										disabled={code.length !== 6}
										className="w-full"
									>
										Subscribe
									</Button>
								</form>

								<div className="mt-4 flex items-center justify-between text-sm">
									<Button variant="ghost" onClick={() => setStep('email')} className="py-2">
										Change email
									</Button>
									<Button
										variant="ghost"
										onClick={handleResendCode}
										disabled={loading}
										className="py-2 text-amber-600 hover:text-amber-500"
									>
										Resend code
									</Button>
								</div>
							</>
						)}

						{step === 'success' && (
							<div className="text-center py-4">
								<div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
									<CheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
								</div>
								<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
									You&apos;re subscribed!
								</h1>
								<p className="text-gray-600 dark:text-gray-400 mb-6">
									Check your inbox for a welcome email. You&apos;ll start receiving daily readings
									and feast reminders.
								</p>
								<div className="space-y-3">
									<Link
										href="/preferences"
										className="block w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
									>
										Manage preferences
									</Link>
									<Link
										href="/"
										className="block w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium py-2 transition-colors text-center"
									>
										Return home
									</Link>
								</div>
							</div>
						)}
					</Card>
				</div>
			</section>
		</main>
	)
}

export default function SubscribePage() {
	return (
		<Suspense
			fallback={
				<main className="min-h-screen relative overflow-hidden">
					<section className="relative pt-24 pb-12 px-6">
						<div className="max-w-md mx-auto">
							<CardSkeleton />
						</div>
					</section>
				</main>
			}
		>
			<SubscribeContent />
		</Suspense>
	)
}
