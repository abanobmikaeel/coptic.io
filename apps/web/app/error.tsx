'use client'

import { Button } from '@/components/ui/Button'
import Link from 'next/link'

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js error page convention
export default function Error({
	error: _error,
	reset,
}: {
	error: globalThis.Error & { digest?: string }
	reset: () => void
}) {
	return (
		<main className="min-h-screen relative overflow-hidden">
			<section className="relative pt-24 pb-12 px-6">
				<div className="max-w-md mx-auto text-center">
					<div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg
							className="w-8 h-8 text-red-600 dark:text-red-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
						Something went wrong
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						We encountered an error loading this page. Please try again.
					</p>
					<div className="space-y-3">
						<Button onClick={reset} className="w-full">
							Try again
						</Button>
						<Link
							href="/"
							className="block w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium py-2 transition-colors text-center"
						>
							Return home
						</Link>
					</div>
				</div>
			</section>
		</main>
	)
}
