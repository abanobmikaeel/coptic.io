'use client'

import type { AvailableSections, ReadingSize } from '@/lib/reading-sections'
import { useCallback, useEffect, useState } from 'react'

const sizeClasses: Record<ReadingSize, { normal: string; active: string }> = {
	sm: { normal: 'w-5 h-5 text-[9px]', active: 'w-6 h-6 text-[10px]' },
	md: { normal: 'w-7 h-7 text-[10px]', active: 'w-8 h-8 text-[11px]' },
	lg: { normal: 'w-9 h-9 text-xs', active: 'w-10 h-10 text-xs' },
}

interface ReadingTimelineProps {
	sections: AvailableSections
}

export function ReadingTimeline({ sections }: ReadingTimelineProps) {
	const { groups, allReadings, mobileReadings } = sections
	const [activeSection, setActiveSection] = useState<string | null>(null)

	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY
			const viewportMiddle = scrollY + window.innerHeight / 3

			let current: string | null = null
			for (const r of allReadings) {
				const element = document.getElementById(`reading-${r.key}`)
				if (element) {
					const rect = element.getBoundingClientRect()
					const absoluteTop = rect.top + scrollY
					if (absoluteTop <= viewportMiddle) {
						current = r.key
					}
				}
			}

			setActiveSection(current)
		}

		window.addEventListener('scroll', handleScroll, { passive: true })
		handleScroll()

		return () => window.removeEventListener('scroll', handleScroll)
	}, [allReadings])

	const scrollToReading = useCallback((key: string) => {
		const element = document.getElementById(`reading-${key}`)
		if (element) {
			const offset = 100
			const top = element.getBoundingClientRect().top + window.scrollY - offset
			window.scrollTo({ top, behavior: 'smooth' })
		}
	}, [])

	if (groups.length === 0) return null

	const activeIndex = activeSection ? allReadings.findIndex((r) => r.key === activeSection) : -1
	const mobileActiveIndex = activeSection
		? mobileReadings.findIndex((r) => r.key === activeSection)
		: -1

	return (
		<>
			{/* Mobile bottom bar */}
			<nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40" aria-label="Reading navigation">
				<div className="bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 safe-area-pb">
					<div className="flex items-center justify-around px-1 py-2">
						{mobileReadings.map((r, idx) => {
							const isActive = activeSection === r.key
							const isPast = mobileActiveIndex > idx

							return (
								<button
									key={r.key}
									type="button"
									onClick={() => scrollToReading(r.key)}
									className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all min-w-0 ${
										isActive ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'
									}`}
								>
									<span
										className={`w-1.5 h-1.5 rounded-full transition-colors ${
											isActive
												? 'bg-amber-500'
												: isPast
													? 'bg-amber-300 dark:bg-amber-700'
													: 'bg-gray-300 dark:bg-gray-600'
										}`}
									/>
									<span className="text-[10px] font-medium truncate">{r.label}</span>
								</button>
							)
						})}
					</div>
				</div>
			</nav>

			{/* Desktop sidebar */}
			<nav
				className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
				aria-label="Reading navigation"
			>
				<div className="flex flex-col items-center gap-0 py-2 px-2 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg">
					{groups.map((group, groupIdx) => (
						<div key={group.label} className="flex flex-col items-center">
							<span className="text-[8px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500 mb-1 mt-1">
								{group.label}
							</span>

							<div className="flex flex-col items-center gap-1">
								{group.readings.map((r, idx) => {
									const isActive = activeSection === r.key
									const globalIdx = allReadings.findIndex((ar) => ar.key === r.key)
									const isPast = activeIndex > globalIdx
									const sizeClass = isActive ? sizeClasses[r.size].active : sizeClasses[r.size].normal

									return (
										<button
											key={r.key}
											type="button"
											onClick={() => scrollToReading(r.key)}
											className={`group relative flex items-center justify-center rounded-full transition-all ${sizeClass} ${
												isActive
													? 'bg-amber-500 text-white'
													: isPast
														? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
														: 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
											}`}
											aria-label={r.label}
											aria-current={isActive ? 'true' : undefined}
										>
											<span className="font-semibold">{r.short}</span>
											<span className="absolute right-full mr-3 px-2 py-1 rounded bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
												{r.label}
											</span>
										</button>
									)
								})}
							</div>

							{groupIdx < groups.length - 1 && (
								<div className="w-4 h-px bg-gray-200 dark:bg-gray-700 my-2" />
							)}
						</div>
					))}
				</div>
			</nav>
		</>
	)
}
