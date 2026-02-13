'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function AgpeyaError({
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	return (
		<main className="min-h-screen relative">
			<section className="relative pt-20 pb-8 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Agpeya</h1>
				</div>
			</section>
			<section className="relative px-6 pb-16">
				<div className="max-w-4xl mx-auto">
					<Card>
						<div className="text-center py-8">
							<p className="text-gray-500 dark:text-gray-400 mb-4">
								Unable to load Agpeya. Please try again.
							</p>
							<Button onClick={reset}>Retry</Button>
						</div>
					</Card>
				</div>
			</section>
		</main>
	)
}
