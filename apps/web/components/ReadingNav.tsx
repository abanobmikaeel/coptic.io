'use client'

import type { ReadingsData } from '@/lib/types'

const readingOrder = [
	{ key: 'Pauline', label: 'Pauline' },
	{ key: 'Catholic', label: 'Catholic' },
	{ key: 'Acts', label: 'Acts' },
	{ key: 'LPsalm', label: 'Psalm' },
	{ key: 'LGospel', label: 'Gospel' },
] as const

type ReadingKey = (typeof readingOrder)[number]['key']

export function ReadingNav({ readings }: { readings: ReadingsData }) {
	const availableReadings = readingOrder.filter((r) => {
		const data = readings[r.key as keyof ReadingsData]
		return data && Array.isArray(data) && data.length > 0
	})

	if (availableReadings.length === 0) return null

	const scrollToReading = (key: string) => {
		const element = document.getElementById(`reading-${key}`)
		if (element) {
			const offset = 80 // Account for sticky header
			const top = element.getBoundingClientRect().top + window.scrollY - offset
			window.scrollTo({ top, behavior: 'smooth' })
		}
	}

	return (
		<nav className="flex items-center justify-center gap-1 flex-wrap" aria-label="Jump to reading">
			{availableReadings.map((r, idx) => (
				<span key={r.key} className="flex items-center">
					<button
						type="button"
						onClick={() => scrollToReading(r.key)}
						className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
					>
						{r.label}
					</button>
					{idx < availableReadings.length - 1 && (
						<span className="text-gray-300 dark:text-gray-700">·</span>
					)}
				</span>
			))}
		</nav>
	)
}
