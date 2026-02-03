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
	const [isVisible, setIsVisible] = useState(true)
	const [lastScrollY, setLastScrollY] = useState(0)

	// Track which section is currently in view
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const sectionId = entry.target.id.replace('section-', '') as SectionId
						setActiveSection(sectionId)
					}
				})
			},
			{
				rootMargin: '-30% 0px -60% 0px',
				threshold: 0,
			},
		)

		SECTIONS.forEach((section) => {
			const element = document.getElementById(`section-${section.id}`)
			if (element) {
				observer.observe(element)
			}
		})

		return () => observer.disconnect()
	}, [])

	// Hide on scroll down, show on scroll up (mobile only)
	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY
			const isScrollingUp = currentScrollY < lastScrollY
			const isAtTop = currentScrollY < 100

			setIsVisible(isScrollingUp || isAtTop)
			setLastScrollY(currentScrollY)
		}

		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [lastScrollY])

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

	return (
		<>
			{/* Desktop sidebar */}
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
										{/* Progress dot */}
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

			{/* Mobile bottom bar */}
			<nav
				className={`
					lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300
					${isVisible ? 'translate-y-0' : 'translate-y-full'}
				`}
			>
				<div className={`border-t backdrop-blur-sm ${styles.bg} ${styles.border} safe-area-pb`}>
					<ul className="flex items-center justify-around px-2 py-2">
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
											flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all
											${isActive ? styles.activeText : styles.text}
										`}
									>
										{/* Progress dot */}
										<span
											className={`
												w-1.5 h-1.5 rounded-full transition-colors
												${isActive || isPast ? styles.activeDot : styles.inactiveDot}
											`}
										/>
										<span className={'text-xs font-medium'}>{section.shortLabel}</span>
									</button>
								</li>
							)
						})}
					</ul>
				</div>
			</nav>
		</>
	)
}
