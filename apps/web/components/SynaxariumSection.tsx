'use client'

import { themeClasses } from '@/lib/reading-styles'
import type { SynaxariumEntry } from '@/lib/types'
import { useState } from 'react'
import type { ReadingTheme, TextSize } from './DisplaySettings'
import { ChevronRightIcon } from './ui/Icons'

const textSizeClasses: Record<TextSize, { title: string; body: string }> = {
	sm: { title: 'text-base', body: 'text-base leading-relaxed' },
	md: { title: 'text-lg', body: 'text-lg leading-relaxed' },
	lg: { title: 'text-xl', body: 'text-2xl leading-loose' },
}

interface SynaxariumSectionProps {
	entries: SynaxariumEntry[]
	textSize?: TextSize
	theme?: ReadingTheme
}

export function SynaxariumSection({
	entries,
	textSize = 'md',
	theme = 'light',
}: SynaxariumSectionProps) {
	const [expanded, setExpanded] = useState<number | null>(null)
	const sizes = textSizeClasses[textSize]

	const bodyClass =
		theme === 'sepia' ? 'text-[#6b5a45]' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
	const borderClass =
		theme === 'sepia'
			? 'border-[#d4c9b8]'
			: theme === 'dark'
				? 'border-gray-800'
				: 'border-gray-100'
	const accentClass = theme === 'sepia' ? 'text-amber-700' : 'text-amber-600 dark:text-amber-500'

	return (
		<ul className="space-y-4">
			{entries.map((entry, idx) => (
				<li key={idx} className={`border-b ${borderClass} last:border-0 pb-4 last:pb-0`}>
					<button
						type="button"
						onClick={() => setExpanded(expanded === idx ? null : idx)}
						className="w-full flex items-start gap-3 text-left group"
					>
						<ChevronRightIcon
							className={`w-5 h-5 mt-0.5 flex-shrink-0 ${themeClasses.muted[theme]} transition-transform duration-200 ${
								expanded === idx ? 'rotate-90' : ''
							}`}
						/>
						<span
							className={`${sizes.title} font-medium ${themeClasses.text[theme]} group-hover:text-amber-600 transition-colors`}
						>
							{entry.name}
						</span>
					</button>

					{expanded === idx && entry.text && (
						<div
							className={`mt-4 ml-8 ${sizes.body} ${bodyClass} whitespace-pre-line animate-in fade-in slide-in-from-top-2 duration-200`}
						>
							{entry.text}
							{entry.url && (
								<a
									href={entry.url}
									target="_blank"
									rel="noopener noreferrer"
									className={`block mt-4 ${accentClass} hover:underline text-sm`}
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
