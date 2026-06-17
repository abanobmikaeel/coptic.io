'use client'

import { CALENDAR_HREF, getNavGroups } from '@/lib/navConfig'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import CopticCross from './CopticCross'
import { MobileMenu } from './MobileMenu'
import { NavDropdown } from './NavDropdown'
import { SearchButton } from './SearchButton'
import { UtilityMenu } from './UtilityMenu'

export default function Navbar() {
	const t = useTranslations('nav')
	const [openDropdown, setOpenDropdown] = useState<string | null>(null)

	const handleDropdownOpen = useCallback((id: string) => {
		setOpenDropdown(id)
	}, [])

	const { read, pray } = getNavGroups(t)

	return (
		<nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
				{/* Left: brand + primary navigation */}
				<div className="flex items-center gap-5 min-w-0">
					{/* Mobile hamburger menu (hidden on desktop) */}
					<div className="lg:hidden">
						<MobileMenu />
					</div>
					<Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
						<CopticCross size={22} />
						<span className="text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight">
							Coptic IO
						</span>
					</Link>

					{/* Desktop primary navigation */}
					<div className="hidden lg:flex items-center gap-4">
						<NavDropdown
							label={t('read')}
							items={read}
							id="read"
							onOpen={handleDropdownOpen}
							forceClose={openDropdown !== null && openDropdown !== 'read'}
						/>
						<NavDropdown
							label={t('pray')}
							items={pray}
							id="pray"
							onOpen={handleDropdownOpen}
							forceClose={openDropdown !== null && openDropdown !== 'pray'}
						/>
						<Link
							href={CALENDAR_HREF}
							className="text-[13px] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							{t('calendar')}
						</Link>
					</div>
				</div>

				{/* Right: utilities */}
				<div className="flex items-center gap-1 shrink-0">
					<SearchButton />
					<UtilityMenu />
				</div>
			</div>
		</nav>
	)
}
