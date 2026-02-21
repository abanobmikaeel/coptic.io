'use client'

import type { MobileReadingItem } from '@/lib/reading-sections'
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

	const readMenuItems = [
		{ label: t('katamaros'), description: t('katamarosDescription'), href: '/readings' },
		{ label: t('agpeya'), description: t('agpeyaDescription'), href: '/agpeya' },
		{ label: t('synaxarium'), description: t('synaxariumDescription'), href: '/synaxarium' },
		{ label: 'Lent Guide', description: 'Great Lent devotional readings', href: '/lent' },
	]

	const moreMenuItems = [
		{ label: t('calendar'), description: 'View the Coptic calendar', href: '/calendar' },
		{ label: t('settings'), description: t('settingsDescription'), href: '/settings' },
		{ label: t('developers'), description: t('developersDescription'), href: '/docs' },
	]

	const buttonClass =
		theme === 'sepia'
			? 'text-amber-700 hover:text-amber-900'
			: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'

	const drawerBg = theme === 'sepia' ? 'bg-amber-50' : theme === 'dark' ? 'bg-gray-900' : 'bg-white'

	const borderColor =
		theme === 'sepia'
			? 'border-amber-200'
			: theme === 'dark'
				? 'border-gray-700'
				: 'border-gray-200'

	const textMuted =
		theme === 'sepia' ? 'text-amber-600' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

	const backdropClass =
		theme === 'sepia'
			? 'backdrop:bg-amber-950/50'
			: theme === 'dark'
				? 'backdrop:bg-black/70'
				: 'backdrop:bg-black/60'

	return (
		<>
			<button
				type="button"
				onClick={openMenu}
				className={`p-2 transition-colors ${buttonClass}`}
				aria-label="Open menu"
			>
				<MenuIcon className="w-5 h-5" />
			</button>

			<dialog
				ref={dialogRef}
				className={`m-0 p-0 h-full max-h-full w-72 max-w-full border-none bg-transparent ${backdropClass}`}
				onClick={(e) => {
					if (e.target === dialogRef.current) closeMenu()
				}}
				onKeyDown={(e) => {
					if (e.key === 'Escape') closeMenu()
				}}
			>
				<div className={`h-full ${drawerBg} shadow-xl`}>
					{/* Header */}
					<div className={`flex items-center justify-between px-4 py-3 border-b ${borderColor}`}>
						<Link href="/" className="flex items-center gap-2 group" onClick={closeMenu}>
							<CopticCross size={20} />
							<span
								className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
							>
								Coptic IO
							</span>
						</Link>
						<button
							type="button"
							onClick={closeMenu}
							className={`p-2 transition-colors ${buttonClass}`}
							aria-label="Close menu"
						>
							<CloseIcon className="w-5 h-5" />
						</button>
					</div>

					{/* Navigation */}
					<nav className="py-2 overflow-y-auto max-h-[calc(100vh-56px)]">
						{/* Read section */}
						<div className="px-4 mb-2">
							<h2
								className={`text-[10px] font-semibold uppercase tracking-wider ${textMuted} mb-1`}
							>
								{t('read')}
							</h2>
							<div className="space-y-0.5">
								{readMenuItems.map((item) => {
									const isActive = pathname.startsWith(item.href)
									return (
										<Link
											key={item.href}
											href={item.href}
											onClick={closeMenu}
											className={`block px-3 py-1.5 rounded-lg transition-colors ${
												isActive
													? theme === 'sepia'
														? 'bg-amber-100 text-amber-800'
														: theme === 'dark'
															? 'bg-amber-900/20 text-amber-400'
															: 'bg-amber-50 text-amber-700'
													: theme === 'sepia'
														? 'text-amber-900 hover:bg-amber-100/50'
														: theme === 'dark'
															? 'text-white hover:bg-gray-800'
															: 'text-gray-900 hover:bg-gray-100'
											}`}
										>
											<span className="block text-sm font-medium">{item.label}</span>
											<span className={`block text-[11px] ${textMuted}`}>{item.description}</span>
										</Link>
									)
								})}
							</div>
						</div>

						{/* Sections navigation (if available) */}
						{sections && sections.length > 0 && (
							<>
								<div className={`border-t ${borderColor} mx-4 my-2`} />
								<div className="px-4 mb-2">
									<h2
										className={`text-[10px] font-semibold uppercase tracking-wider ${textMuted} mb-1`}
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
															? theme === 'sepia'
																? 'bg-amber-200 text-amber-900'
																: theme === 'dark'
																	? 'bg-amber-600 text-white'
																	: 'bg-amber-500 text-white'
															: theme === 'sepia'
																? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
																: theme === 'dark'
																	? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
																	: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

						<div className={`border-t ${borderColor} mx-4 my-2`} />

						{/* More section */}
						<div className="px-4">
							<h2
								className={`text-[10px] font-semibold uppercase tracking-wider ${textMuted} mb-1`}
							>
								{t('more')}
							</h2>
							<div className="space-y-0.5">
								{moreMenuItems.map((item) => {
									const isActive = pathname.startsWith(item.href)
									return (
										<Link
											key={item.href}
											href={item.href}
											onClick={closeMenu}
											className={`block px-3 py-1.5 rounded-lg transition-colors ${
												isActive
													? theme === 'sepia'
														? 'bg-amber-100 text-amber-800'
														: theme === 'dark'
															? 'bg-amber-900/20 text-amber-400'
															: 'bg-amber-50 text-amber-700'
													: theme === 'sepia'
														? 'text-amber-900 hover:bg-amber-100/50'
														: theme === 'dark'
															? 'text-white hover:bg-gray-800'
															: 'text-gray-900 hover:bg-gray-100'
											}`}
										>
											<span className="block text-sm font-medium">{item.label}</span>
											<span className={`block text-[11px] ${textMuted}`}>{item.description}</span>
										</Link>
									)
								})}
							</div>
						</div>
					</nav>
				</div>
			</dialog>
		</>
	)
}
