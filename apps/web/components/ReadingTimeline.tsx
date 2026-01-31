'use client'

import type { ReadingsData } from '@/lib/types'
import { useEffect, useState } from 'react'

// Grouped readings with importance levels
const readingGroups = [
	{
		label: 'Liturgy',
		readings: [
			{ key: 'Pauline', short: 'Pa', label: 'Pauline Epistle', size: 'md' },
			{ key: 'Catholic', short: 'Ca', label: 'Catholic Epistle', size: 'md' },
			{ key: 'Acts', short: 'Ac', label: 'Acts', size: 'md' },
			{ key: 'Synaxarium', short: 'Sx', label: 'Synaxarium', size: 'sm' },
			{ key: 'LPsalm', short: 'Ps', label: 'Psalm', size: 'sm' },
			{ key: 'LGospel', short: 'Go', label: 'Gospel', size: 'lg' },
		],
	},
	{
		label: 'Vespers',
		readings: [
			{ key: 'VPsalm', short: 'Ps', label: 'Psalm', size: 'sm' },
			{ key: 'VGospel', short: 'Go', label: 'Gospel', size: 'lg' },
		],
	},
	{
		label: 'Matins',
		readings: [
			{ key: 'MPsalm', short: 'Ps', label: 'Psalm', size: 'sm' },
			{ key: 'MGospel', short: 'Go', label: 'Gospel', size: 'lg' },
		],
	},
] as const

type ReadingSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<ReadingSize, { normal: string; active: string }> = {
	sm: { normal: 'w-5 h-5 text-[9px]', active: 'w-6 h-6 text-[10px]' },
	md: { normal: 'w-7 h-7 text-[10px]', active: 'w-8 h-8 text-[11px]' },
	lg: { normal: 'w-9 h-9 text-xs', active: 'w-10 h-10 text-xs' },
}

export function ReadingTimeline({ readings }: { readings: ReadingsData }) {
	const [activeSection, setActiveSection] = useState<string | null>(null)

	// Filter groups to only include available readings
	const availableGroups = readingGroups
		.map((group) => ({
			...group,
			readings: group.readings.filter((r) => {
				// Synaxarium uses different key in data
				const dataKey = r.key === 'Synaxarium' ? 'Synxarium' : r.key
				const data = readings[dataKey as keyof ReadingsData]
				return data && Array.isArray(data) && data.length > 0
			}),
		}))
		.filter((group) => group.readings.length > 0)

	// Flat list for scroll detection
	const allReadings = availableGroups.flatMap((g) => g.readings)

	useEffect(() => {
		const handleScroll = () => {
			const sections = allReadings
				.map((r) => ({
					key: r.key,
					element: document.getElementById(`reading-${r.key}`),
				}))
				.filter((s) => s.element !== null)

			const viewportMiddle = window.scrollY + window.innerHeight / 3

			let current: string | null = null
			for (const section of sections) {
				if (section.element) {
					const rect = section.element.getBoundingClientRect()
					const absoluteTop = rect.top + window.scrollY

					if (absoluteTop <= viewportMiddle) {
						current = section.key
					}
				}
			}

			setActiveSection(current)
		}

		window.addEventListener('scroll', handleScroll, { passive: true })
		handleScroll()

		return () => window.removeEventListener('scroll', handleScroll)
	}, [allReadings])

	const scrollToReading = (key: string) => {
		const element = document.getElementById(`reading-${key}`)
		if (element) {
			const offset = 100
			const top = element.getBoundingClientRect().top + window.scrollY - offset
			window.scrollTo({ top, behavior: 'smooth' })
		}
	}

	if (availableGroups.length === 0) return null

	const activeIndex = activeSection ? allReadings.findIndex((r) => r.key === activeSection) : -1

	return (
		<nav
			className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
			aria-label="Reading navigation"
		>
			<div className="flex flex-col items-center gap-0 py-2 px-2 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg">
				{availableGroups.map((group, groupIdx) => (
					<div key={group.label} className="flex flex-col items-center">
						{/* Group label */}
						<span className="text-[8px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500 mb-1 mt-1">
							{group.label}
						</span>

						{/* Readings in group */}
						<div className="flex flex-col items-center gap-1">
							{group.readings.map((r) => {
								const isActive = activeSection === r.key
								const isPast = activeIndex > allReadings.findIndex((ar) => ar.key === r.key)
								const size = r.size as ReadingSize
								const sizeClass = isActive ? sizeClasses[size].active : sizeClasses[size].normal

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

										{/* Tooltip */}
										<span className="absolute right-full mr-3 px-2 py-1 rounded bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
											{r.label}
										</span>
									</button>
								)
							})}
						</div>

						{/* Divider between groups */}
						{groupIdx < availableGroups.length - 1 && (
							<div className="w-4 h-px bg-gray-200 dark:bg-gray-700 my-2" />
						)}
					</div>
				))}
			</div>
		</nav>
	)
}
