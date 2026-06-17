'use client'

import { getNavGroups } from '@/lib/navConfig'
import type { MobileReadingItem } from '@/lib/reading-sections'
import { themeClasses } from '@/lib/reading-styles'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import CopticCross from './CopticCross'
import { CloseIcon, MenuIcon } from './ui/Icons'

interface MobileMenuProps {
	theme?: 'light' | 'sepia' | 'dark'
	sections?: MobileReadingItem[]
}

export function MobileMenu({ theme = 'light', sections }: MobileMenuProps) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const pathname = usePathname()
	const t = useTranslations('nav')
	const [activeSection, setActiveSection] = useState<string | null>(null)

	const openMenu = useCallback(() => {
		dialogRef.current?.showModal()
	}, [])

	const closeMenu = useCallback(() => {
		dialogRef.current?.close()
	}, [])

	// Close menu on route change
	useEffect(() => {
		closeMenu()
	}, [closeMenu])

	// Track active section based on scroll
	useEffect(() => {
		if (!sections?.length) return

		const handleScroll = () => {
			const scrollY = window.scrollY
			const viewportMiddle = scrollY + window.innerHeight / 3

			let current: string | null = null
			for (const r of sections) {
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
	}, [sections])

	const scrollToReading = useCallback(
		(key: string) => {
			const element = document.getElementById(`reading-${key}`)
			if (element) {
				const offset = 100
				const top = element.getBoundingClientRect().top + window.scrollY - offset
				window.scrollTo({ top, behavior: 'smooth' })
			}
			closeMenu()
		},
		[closeMenu],
	)

	const { read, pray, more } = getNavGroups(t)
	const moreMenuItems = [
		{ label: t('calendar'), description: t('calendarDescription'), href: '/calendar' },
		...more,
	]

	const renderItem = (item: { label: string; description: string; href: string }) => {
		const isActive = pathname.startsWith(item.href)
		return (
			<Link
				key={item.href}
				href={item.href}
				onClick={closeMenu}
				className={`block px-3 py-1.5 rounded-lg transition-colors ${
					isActive ? themeClasses.drawerNavActive[theme] : themeClasses.drawerNavInactive[theme]
				}`}
			>
				<span className="block text-sm font-medium">{item.label}</span>
				<span className={`block text-[11px] ${themeClasses.dropdownMuted[theme]}`}>
					{item.description}
				</span>
			</Link>
		)
	}

	const sectionHeading = (label: string) => (
		<h2
			className={`text-[10px] font-semibold uppercase tracking-wider ${themeClasses.dropdownMuted[theme]} mb-1`}
		>
			{label}
		</h2>
	)

	return (
		<>
			<button
				type="button"
				onClick={openMenu}
				className={`p-2 transition-colors ${themeClasses.drawerButton[theme]}`}
				aria-label="Open menu"
			>
				<MenuIcon className="w-5 h-5" />
			</button>

			<dialog
				ref={dialogRef}
				className={`m-0 p-0 h-full max-h-full w-72 max-w-full border-none bg-transparent ${themeClasses.drawerBackdrop[theme]}`}
				onClick={(e) => {
					if (e.target === dialogRef.current) closeMenu()
				}}
				onKeyDown={(e) => {
					if (e.key === 'Escape') closeMenu()
				}}
			>
				<div className={`h-full ${themeClasses.drawerBg[theme]} shadow-xl`}>
					{/* Header */}
					<div
						className={`flex items-center justify-between px-4 py-3 border-b ${themeClasses.drawerBorder[theme]}`}
					>
						<Link href="/" className="flex items-center gap-2 group" onClick={closeMenu}>
							<CopticCross size={20} />
							<span className={`text-sm font-semibold ${themeClasses.breadcrumbActive[theme]}`}>
								Coptic IO
							</span>
						</Link>
						<button
							type="button"
							onClick={closeMenu}
							className={`p-2 transition-colors ${themeClasses.drawerButton[theme]}`}
							aria-label="Close menu"
						>
							<CloseIcon className="w-5 h-5" />
						</button>
					</div>

					{/* Navigation */}
					<nav className="py-2 overflow-y-auto max-h-[calc(100vh-56px)]">
						{/* Read section */}
						<div className="px-4 mb-2">
							{sectionHeading(t('read'))}
							<div className="space-y-0.5">{read.map(renderItem)}</div>
						</div>

						{/* Pray section */}
						<div className="px-4 mb-2">
							{sectionHeading(t('pray'))}
							<div className="space-y-0.5">{pray.map(renderItem)}</div>
						</div>

						{/* Sections navigation (if available) */}
						{sections && sections.length > 0 && (
							<>
								<div className={`border-t ${themeClasses.drawerBorder[theme]} mx-4 my-2`} />
								<div className="px-4 mb-2">
									<h2
										className={`text-[10px] font-semibold uppercase tracking-wider ${themeClasses.dropdownMuted[theme]} mb-1`}
									>
										Jump to
									</h2>
									<div className="flex flex-wrap gap-1.5">
										{sections.map((section) => {
											const isActive = activeSection === section.key
											return (
												<button
													key={section.key}
													type="button"
													onClick={() => scrollToReading(section.key)}
													className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
														isActive
															? themeClasses.drawerSectionActive[theme]
															: themeClasses.drawerSectionInactive[theme]
													}`}
												>
													{section.label}
												</button>
											)
										})}
									</div>
								</div>
							</>
						)}

						<div className={`border-t ${themeClasses.drawerBorder[theme]} mx-4 my-2`} />

						{/* More section */}
						<div className="px-4">
							{sectionHeading(t('more'))}
							<div className="space-y-0.5">{moreMenuItems.map(renderItem)}</div>
						</div>
					</nav>
				</div>
			</dialog>
		</>
	)
}
