import { getSynaxariumByDate } from '@/lib/api'
import { getTodayDateString } from '@/lib/utils/dateFormatters'
import { ChevronRightIcon } from './ui/Icons'
import Link from 'next/link'

interface HomeUpcomingSynaxariumProps {
	limit?: number
}

export default async function HomeUpcomingSynaxarium({ limit = 5 }: HomeUpcomingSynaxariumProps) {
	const today = getTodayDateString()
	const entries = await getSynaxariumByDate(today, false)

	if (!entries || entries.length === 0) {
		return <p className="text-gray-500 dark:text-gray-400 text-sm">No commemorations today</p>
	}

	const visibleEntries = entries.slice(0, limit)
	const hasMore = entries.length > limit

	return (
		<div className="space-y-1">
			{visibleEntries.map((entry, idx) => (
				<div
					key={idx}
					className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
				>
					<div className="flex-1 min-w-0">
						<p className="text-gray-900 dark:text-white font-medium truncate">{entry.name}</p>
						<p className="text-xs text-amber-600 dark:text-amber-500">Commemoration</p>
					</div>
				</div>
			))}

			{hasMore && (
				<Link
					href="/synaxarium"
					className="flex items-center justify-center gap-1 w-full mt-3 py-2.5 text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 text-sm transition-colors"
				>
					View all {entries.length} commemorations
					<ChevronRightIcon className="w-4 h-4" />
				</Link>
			)}
		</div>
	)
}
