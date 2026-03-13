'use client'

import type { SynaxariumEntry } from '@/lib/types'
import { useTranslations } from 'next-intl'
import { SynaxariumEntryCompact } from './SynaxariumEntryCompact'

interface SynaxariumDayCardProps {
	date: string
	displayDate: string
	copticDate?: string
	isToday: boolean
	isTomorrow: boolean
	entries: SynaxariumEntry[]
	selectedCategory: string
	getCategoryLabelKey: (name: string) => string
	getCategoryColor: (name: string) => string
	matchesCategory: (name: string, category: string) => boolean
	onEntryExpand: (entryKey: string) => void
	expandedEntries: Set<string>
	loadingEntries: Set<string>
}

export function SynaxariumDayCard({
	date,
	displayDate,
	copticDate,
	isToday,
	isTomorrow,
	entries,
	selectedCategory,
	getCategoryLabelKey,
	getCategoryColor,
	matchesCategory,
	onEntryExpand,
	expandedEntries,
	loadingEntries,
}: SynaxariumDayCardProps) {
	const tCommon = useTranslations('common')
	const tSynaxarium = useTranslations('synaxarium')
	const tCategories = useTranslations('categories')
	const filteredEntries =
		selectedCategory === 'all'
			? entries
			: entries.filter((e) => matchesCategory(e.name, selectedCategory))

	if (filteredEntries.length === 0) {
		return null
	}

	const getDateLabel = () => {
		if (isToday) return tCommon('today')
		if (isTomorrow) return tCommon('tomorrow')
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
					<div className="flex flex-col">
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							{displayDate}
						</span>
						{copticDate && (
							<span className="text-xs font-medium text-amber-600 dark:text-amber-500">
								{copticDate}
							</span>
						)}
					</div>
					<span className="ms-auto text-xs text-gray-500 dark:text-gray-500">
						{filteredEntries.length}{' '}
						{filteredEntries.length === 1
							? tSynaxarium('commemorations')
							: tSynaxarium('commemorationsPlural')}
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
							categoryLabel={tCategories(getCategoryLabelKey(entry.name))}
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
