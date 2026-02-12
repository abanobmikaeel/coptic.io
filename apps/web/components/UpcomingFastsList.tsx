'use client'

import { formatDateShortUTC } from '@/lib/utils'
import { useState } from 'react'

interface Fast {
	name: string
	type: string
	date: string
	displayName?: string
}

interface UpcomingFastsListProps {
	fasts: Fast[]
}

export default function UpcomingFastsList({ fasts }: UpcomingFastsListProps) {
	const [visibleCount, setVisibleCount] = useState(5)

	const visibleFasts = fasts.slice(0, visibleCount)
	const hasMore = visibleCount < fasts.length

	if (visibleFasts.length === 0) {
		return <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming fasts</p>
	}

	return (
		<div className="space-y-1">
			{visibleFasts.map((fast, idx) => (
				<div
					key={idx}
					className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
				>
					<div className="flex-1 min-w-0">
						<p className="text-gray-900 dark:text-white font-medium truncate">
							{fast.displayName || fast.name}
						</p>
						<p className="text-xs text-purple-600 dark:text-purple-400">Fast</p>
					</div>
					<p className="text-gray-500 dark:text-gray-400 text-sm ml-4 whitespace-nowrap">
						{formatDateShortUTC(new Date(fast.date))}
					</p>
				</div>
			))}

			{hasMore && (
				<button
					type="button"
					onClick={() => setVisibleCount((prev) => prev + 5)}
					className="w-full mt-3 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
				>
					Show more
				</button>
			)}
		</div>
	)
}
