'use client'
import { useCallback, useEffect, useState } from 'react'
import type { SectionId } from './AgpeyaPrayer'
import type { ReadingTheme } from './DisplaySettings'

interface Section {
	id: SectionId
	label: string
	shortLabel: string
}

const SECTIONS: Section[] = [
	{ id: 'introduction', label: 'Introduction', shortLabel: 'Intro' },
	{ id: 'thanksgiving', label: 'Thanksgiving', shortLabel: 'Thanks' },
	{ id: 'introductory-psalm', label: 'Psalm 50', shortLabel: 'Ps 50' },
	{ id: 'psalms', label: 'Psalms', shortLabel: 'Psalms' },
	{ id: 'gospel', label: 'Gospel', shortLabel: 'Gospel' },
	{ id: 'litanies', label: 'Litanies', shortLabel: 'Litanies' },
	{ id: 'closing', label: 'Closing', shortLabel: 'Closing' },
]

interface AgpeyaProgressProps {
	theme?: ReadingTheme
	psalmsCount?: number
}

export function AgpeyaProgress({ theme = 'light', psalmsCount = 0 }: AgpeyaProgressProps) {
	const [activeSection, setActiveSection] = useState<SectionId>('introduction')

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const sectionId = entry.target.id.replace('section-', '') as SectionId
						setActiveSection(sectionId)
					}
				}
			},
			{
				rootMargin: '-30% 0px -60% 0px',
				threshold: 0,
			},
		)

		for (const section of SECTIONS) {
			const element = document.getElementById(`section-${section.id}`)
			if (element) {
				observer.observe(element)
			}
		}

		return () => observer.disconnect()
	}, [])

	const scrollToSection = useCallback((sectionId: SectionId) => {
		const element = document.getElementById(`section-${sectionId}`)
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}, [])

	const themeStyles = {
		light: {
			bg: 'bg-white/95',
			border: 'border-gray-200',
			text: 'text-gray-600',
			activeText: 'text-amber-700',
			activeBg: 'bg-amber-50',
			activeDot: 'bg-amber-500',
			inactiveDot: 'bg-gray-300',
			hoverBg: 'hover:bg-gray-50',
		},
		sepia: {
			bg: 'bg-[#f5f0e6]/95',
			border: 'border-[#d4c9b8]',
			text: 'text-[#8b7355]',
			activeText: 'text-amber-800',
			activeBg: 'bg-amber-100/50',
			activeDot: 'bg-amber-600',
			inactiveDot: 'bg-[#c4b9a8]',
			hoverBg: 'hover:bg-[#ebe4d6]',
		},
		dark: {
			bg: 'bg-gray-900/95',
			border: 'border-gray-700',
			text: 'text-gray-400',
			activeText: 'text-amber-400',
			activeBg: 'bg-amber-900/30',
			activeDot: 'bg-amber-500',
			inactiveDot: 'bg-gray-600',
			hoverBg: 'hover:bg-gray-800',
		},
	}

	const styles = themeStyles[theme]

	// Desktop sidebar only — mobile uses the global MobileMenu burger
	return (
		<nav className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-40">
			<div
				className={`py-3 px-1 rounded-xl border backdrop-blur-sm shadow-lg ${styles.bg} ${styles.border}`}
			>
				<ul className="space-y-1">
					{SECTIONS.map((section) => {
						const isActive = activeSection === section.id
						const isPast =
							SECTIONS.findIndex((s) => s.id === activeSection) >
							SECTIONS.findIndex((s) => s.id === section.id)

						return (
							<li key={section.id}>
								<button
									type="button"
									onClick={() => scrollToSection(section.id)}
									className={`
										w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
										${isActive ? `${styles.activeBg} ${styles.activeText}` : `${styles.text} ${styles.hoverBg}`}
									`}
								>
									<span
										className={`
											w-2 h-2 rounded-full transition-colors
											${isActive || isPast ? styles.activeDot : styles.inactiveDot}
										`}
									/>
									<span className={`text-sm font-medium ${isActive ? styles.activeText : ''}`}>
										{section.label}
										{section.id === 'psalms' && psalmsCount > 0 && (
											<span className="ml-1 opacity-60">({psalmsCount})</span>
										)}
									</span>
								</button>
							</li>
						)
					})}
				</ul>
			</div>
		</nav>
	)
}
