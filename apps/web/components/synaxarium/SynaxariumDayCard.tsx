'use client'

import type { SynaxariumEntry } from '@/lib/types'
import { SynaxariumEntryCompact } from './SynaxariumEntryCompact'

interface SynaxariumDayCardProps {
	date: string
	displayDate: string
	isToday: boolean
	isTomorrow: boolean
	entries: SynaxariumEntry[]
	selectedCategory: string
	getCategoryLabel: (name: string) => string
	getCategoryColor: (name: string) => string
	matchesCategory: (name: string, category: string) => boolean
	onEntryExpand: (entryKey: string) => void
	expandedEntries: Set<string>
	loadingEntries: Set<string>
}

export function SynaxariumDayCard({
	date,
	displayDate,
	isToday,
	isTomorrow,
	entries,
	selectedCategory,
	getCategoryLabel,
	getCategoryColor,
	matchesCategory,
	onEntryExpand,
	expandedEntries,
	loadingEntries,
}: SynaxariumDayCardProps) {
	const filteredEntries =
		selectedCategory === 'all' ? entries : entries.filter((e) => matchesCategory(e.name, selectedCategory))

	if (filteredEntries.length === 0) {
		return null
	}

	const getDateLabel = () => {
		if (isToday) return 'Today'
		if (isTomorrow) return 'Tomorrow'
		return ''
	}

	const dateLabel = getDateLabel()

	return (
		<div className="mb-6 last:mb-0">
			{/* Sticky date header */}
			<div className="sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-sm -mx-6 px-6 py-3 border-b border-gray-200 dark:border-gray-800">
				<div className="flex items-center gap-2">
					{dateLabel && (
						<span
							className={`text-sm font-semibold ${
								isToday ? 'text-amber-600 dark:text-amber-500' : 'text-gray-600 dark:text-gray-400'
							}`}
						>
							{dateLabel}
						</span>
					)}
					{dateLabel && <span className="text-gray-400 dark:text-gray-600">—</span>}
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{displayDate}</span>
					<span className="ml-auto text-xs text-gray-500 dark:text-gray-500">
						{filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
					</span>
				</div>
			</div>

			{/* Entries */}
			<div className="pt-2">
				{filteredEntries.map((entry, idx) => {
					const entryKey = `${date}-${idx}`
					const detailsUrl = `/synaxarium?date=${date}&entry=${encodeURIComponent(entry.name)}`
					return (
						<SynaxariumEntryCompact
							key={entryKey}
							entry={entry}
							categoryLabel={getCategoryLabel(entry.name)}
							categoryColor={getCategoryColor(entry.name)}
							isExpanded={expandedEntries.has(entryKey)}
							onToggle={() => onEntryExpand(entryKey)}
							isLoadingDetail={loadingEntries.has(entryKey)}
							detailsUrl={detailsUrl}
						/>
					)
				})}
			</div>
		</div>
	)
}
