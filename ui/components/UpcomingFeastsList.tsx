'use client'

import { formatDateShortUTC } from '@/lib/utils'
import { useState } from 'react'

interface Feast {
	name: string
	type: string
	date: string
	displayName?: string
}

interface UpcomingFeastsListProps {
	feasts: Feast[]
}

export default function UpcomingFeastsList({ feasts }: UpcomingFeastsListProps) {
	const [visibleCount, setVisibleCount] = useState(5)

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'lordlyFeast':
			case 'majorFeast':
				return 'text-amber-600 dark:text-amber-500'
			case 'fast':
				return 'text-purple-600 dark:text-purple-400'
			default:
				return 'text-gray-500 dark:text-gray-400'
		}
	}

	const formatType = (type: string) => {
		const typeMap: Record<string, string> = {
			fast: 'Fast',
			feast: 'Feast',
			lordlyFeast: 'Lordly Feast',
			majorFeast: 'Major Feast',
			minorFeast: 'Minor Feast',
		}
		return typeMap[type] || type
	}

	const visibleFeasts = feasts.slice(0, visibleCount)
	const hasMore = visibleCount < feasts.length

	if (visibleFeasts.length === 0) {
		return <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming feasts</p>
	}

	return (
		<div className="space-y-1">
			{visibleFeasts.map((feast, idx) => (
				<div
					key={idx}
					className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
				>
					<div className="flex-1 min-w-0">
						<p className="text-gray-900 dark:text-white font-medium truncate">
							{feast.displayName || feast.name}
						</p>
						<p className={`text-xs ${getTypeColor(feast.type)}`}>{formatType(feast.type)}</p>
					</div>
					<p className="text-gray-500 dark:text-gray-400 text-sm ml-4 whitespace-nowrap">
						{formatDateShortUTC(new Date(feast.date))}
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
