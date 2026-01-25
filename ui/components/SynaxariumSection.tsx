'use client'

import { ChevronRightIcon } from '@/components/ui/Icons'
import type { SynaxariumEntry } from '@/lib/types'
import { useState } from 'react'

export function SynaxariumSection({ entries }: { entries: SynaxariumEntry[] }) {
	const [expanded, setExpanded] = useState<number | null>(null)

	return (
		<ul className="space-y-3">
			{entries.map((entry, idx) => (
				<li
					key={idx}
					className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-3 last:pb-0"
				>
					<button
						type="button"
						onClick={() => setExpanded(expanded === idx ? null : idx)}
						className="w-full flex items-start gap-2 text-left group"
					>
						<ChevronRightIcon
							className={`w-4 h-4 mt-1 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
								expanded === idx ? 'rotate-90' : ''
							}`}
						/>
						<span className="text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
							{entry.name}
						</span>
					</button>

					{expanded === idx && entry.text && (
						<div className="mt-3 ml-6 text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line animate-in fade-in slide-in-from-top-2 duration-200">
							{entry.text}
							{entry.url && (
								<a
									href={entry.url}
									target="_blank"
									rel="noopener noreferrer"
									className="block mt-3 text-amber-600 dark:text-amber-500 hover:underline text-xs"
								>
									Read on copticchurch.net
								</a>
							)}
						</div>
					)}
				</li>
			))}
		</ul>
	)
}
