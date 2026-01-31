'use client'

import type { Reading } from '@/lib/types'
import { useState } from 'react'
import type { ViewMode } from './ViewModeToggle'

interface CollapsibleReadingProps {
	readings: Reading[]
	label: { title: string; subtitle: string }
	isRtl: boolean
	viewMode: ViewMode
	id: string
}

export function CollapsibleReading({
	readings,
	label,
	isRtl,
	viewMode,
	id,
}: CollapsibleReadingProps) {
	const [isOpen, setIsOpen] = useState(true)

	// Get the reference string for display
	const reference = readings
		.map((reading) =>
			reading.chapters
				.map((chapter) => {
					const firstVerse = chapter.verses[0]?.num
					const lastVerse = chapter.verses[chapter.verses.length - 1]?.num
					return `${reading.bookName} ${chapter.chapterNum}:${firstVerse}${firstVerse !== lastVerse ? `-${lastVerse}` : ''}`
				})
				.join('; '),
		)
		.join('; ')

	return (
		<div id={id} className="mb-6 scroll-mt-20">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full text-left pb-2 border-b border-gray-100 dark:border-gray-800 group"
			>
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 min-w-0">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
							{label.title}
						</h3>
						<p className="text-sm text-gray-500 dark:text-gray-500">{label.subtitle}</p>
						<p className="text-sm text-amber-600 dark:text-amber-500 mt-1 truncate">{reference}</p>
					</div>
					<div className="flex-shrink-0 mt-1">
						<span
							className={`inline-flex items-center justify-center w-6 h-6 rounded text-gray-400 dark:text-gray-500 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-transform ${isOpen ? '' : '-rotate-90'}`}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="m6 9 6 6 6-6" />
							</svg>
						</span>
					</div>
				</div>
			</button>

			{isOpen && (
				<div className="mt-4">
					{readings.map((reading, idx) => (
						<div key={idx} className="mb-4">
							{reading.chapters.map((chapter, cidx) => (
								<div key={cidx}>
									{viewMode === 'continuous' ? (
										<p
											className={`text-gray-700 dark:text-gray-300 leading-loose text-lg ${isRtl ? 'font-arabic text-right' : ''}`}
											dir={isRtl ? 'rtl' : 'ltr'}
										>
											{chapter.verses.map((verse, vidx) => (
												<span key={verse.num}>
													<sup
														className={`text-amber-600/70 dark:text-amber-500/70 text-xs font-medium ${isRtl ? 'ml-1' : 'mr-1'}`}
													>
														{verse.num}
													</sup>
													{verse.text}
													{vidx < chapter.verses.length - 1 && ' '}
												</span>
											))}
										</p>
									) : (
										<div
											className={`space-y-3 ${isRtl ? 'font-arabic text-right' : ''}`}
											dir={isRtl ? 'rtl' : 'ltr'}
										>
											{chapter.verses.map((verse) => (
												<p
													key={verse.num}
													className="text-gray-700 dark:text-gray-300 leading-relaxed"
												>
													<span
														className={`text-gray-400 dark:text-gray-600 text-sm ${isRtl ? 'ml-2' : 'mr-2'}`}
													>
														{verse.num}
													</span>
													{verse.text}
												</p>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
