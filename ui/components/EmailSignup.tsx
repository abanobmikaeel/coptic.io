'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DEFAULT_TIMEZONE } from '@/constants'
import { useFetch } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

export default function EmailSignup() {
	const router = useRouter()
	const { loading, error, execute } = useFetch()

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const email = formData.get('email') as string

		const result = await execute('/api/subscribe', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		})

		if (result) {
			const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE
			router.push(
				`/subscribe?email=${encodeURIComponent(email)}&step=verify&tz=${encodeURIComponent(tz)}`,
			)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="w-full">
			<div className="flex flex-col sm:flex-row gap-3">
				<Input
					type="email"
					name="email"
					placeholder="Enter your email"
					required
					error={!!error}
					className="flex-1 rounded-xl"
				/>
				<Button type="submit" loading={loading} className="px-6 rounded-xl whitespace-nowrap">
					Get Daily Readings
				</Button>
			</div>
			{error && <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
			<p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
				Free daily emails. Unsubscribe anytime.
			</p>
		</form>
	)
}
