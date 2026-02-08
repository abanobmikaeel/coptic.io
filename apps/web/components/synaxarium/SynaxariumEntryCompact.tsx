'use client'

import { ChevronRightIcon } from '@/components/ui/Icons'
import type { SynaxariumEntry } from '@/lib/types'
import Link from 'next/link'

interface SynaxariumEntryCompactProps {
	entry: SynaxariumEntry
	categoryLabel: string
	categoryColor: string
	isExpanded: boolean
	onToggle: () => void
	isLoadingDetail?: boolean
	detailsUrl?: string
}

export function SynaxariumEntryCompact({
	entry,
	categoryLabel,
	categoryColor,
	isExpanded,
	onToggle,
	isLoadingDetail,
	detailsUrl,
}: SynaxariumEntryCompactProps) {
	const content = (
		<>
			<span
				className={`inline-block px-2 py-0.5 rounded text-xs font-medium shrink-0 ${categoryColor}`}
			>
				{categoryLabel}
			</span>
			<span className="flex-1 text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-500 line-clamp-2 transition-colors">
				{entry.name}
			</span>
			{isLoadingDetail ? (
				<div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
			) : (
				<ChevronRightIcon
					className={`w-5 h-5 text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-500 shrink-0 transition-transform duration-200 ${
						isExpanded ? 'rotate-90' : ''
					}`}
				/>
			)}
		</>
	)

	// If detailsUrl is provided, render as a link; otherwise render as expand button
	if (detailsUrl) {
		return (
			<div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
				<Link
					href={detailsUrl}
					className="w-full flex items-center gap-3 py-3 px-2 -mx-2 min-h-[48px] text-left group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
				>
					{content}
				</Link>
			</div>
		)
	}

	return (
		<div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
			<button
				type="button"
				onClick={onToggle}
				className="w-full flex items-center gap-3 py-3 px-2 -mx-2 min-h-[48px] text-left group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
			>
				{content}
			</button>

			{isExpanded && entry.text && (
				<div className="pb-3 pl-2 pr-2 animate-in fade-in slide-in-from-top-2 duration-200">
					<div className="ml-[calc(theme(spacing.2)+theme(spacing.0.5))] pl-3 border-l-2 border-amber-200 dark:border-amber-800">
						<p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
							{entry.text}
						</p>
						{entry.url && (
							<a
								href={entry.url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-block mt-3 text-sm text-amber-600 dark:text-amber-500 hover:underline"
							>
								Read on copticchurch.net →
							</a>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
