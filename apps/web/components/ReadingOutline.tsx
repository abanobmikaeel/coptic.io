'use client'

import type { ReadingTheme } from '@/lib/reading-preferences'
import { themeClasses } from '@/lib/reading-styles'
import type { ReadingPage } from './PaginatedReadingView'

interface ReadingOutlineProps {
	pages: ReadingPage[]
	currentIndex: number
	theme: ReadingTheme
	onSelectPage: (index: number) => void
}

export function ReadingOutline({
	pages,
	currentIndex,
	theme,
	onSelectPage,
}: ReadingOutlineProps) {
	// Group pages by service
	const groupedPages = pages.reduce(
		(acc, page, index) => {
			const service = page.service
			if (!acc[service]) {
				acc[service] = []
			}
			acc[service].push({ ...page, index })
			return acc
		},
		{} as Record<string, (ReadingPage & { index: number })[]>,
	)

	const services = Object.keys(groupedPages)

	return (
		<nav className="py-4" aria-label="Reading sections outline">
			{services.map((service) => (
				<div key={service} className="mb-4">
					{/* Service header */}
					<h3
						className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${themeClasses.muted[theme]}`}
					>
						{service}
					</h3>

					{/* Section items */}
					<ul className="space-y-1">
						{groupedPages[service].map((page) => {
							const isActive = page.index === currentIndex

							return (
								<li key={page.id}>
									<button
										type="button"
										onClick={() => onSelectPage(page.index)}
										className={`w-full text-left px-4 py-3 transition-colors ${
											isActive
												? `${themeClasses.collapsedBg[theme]} ${themeClasses.accent[theme]} font-medium`
												: `${themeClasses.text[theme]} hover:${themeClasses.headerBg[theme]}`
										}`}
									>
										<div className="flex items-center gap-3">
											{/* Active indicator */}
											<span
												className={`w-1.5 h-1.5 rounded-full transition-all ${
													isActive
														? 'bg-amber-500 scale-100'
														: 'bg-transparent scale-0'
												}`}
											/>
											<span className="truncate">{page.section}</span>
										</div>
									</button>
								</li>
							)
						})}
					</ul>
				</div>
			))}
		</nav>
	)
}
