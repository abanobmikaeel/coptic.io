'use client'

import { useNavigation } from '@/contexts/NavigationContext'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import CopticCross from './CopticCross'
import { LocaleSwitcher } from './LocaleSwitcher'
import { NavDropdown } from './NavDropdown'
import { SearchButton } from './SearchButton'
import ThemeToggle from './ThemeToggle'
import { SearchIcon } from './ui/Icons'

export default function Navbar() {
	const { mode } = useNavigation()
	const t = useTranslations('nav')

	const readMenuItems = [
		{
			label: t('katamaros'),
			description: t('katamarosDescription'),
			href: '/readings',
		},
		{
			label: t('agpeya'),
			description: t('agpeyaDescription'),
			href: '/agpeya',
		},
		{
			label: t('synaxarium'),
			description: t('synaxariumDescription'),
			href: '/synaxarium',
		},
	]

	const moreMenuItems = [
		{
			label: t('settings'),
			description: t('settingsDescription'),
			href: '/settings',
		},
		{
			label: t('developers'),
			description: t('developersDescription'),
			href: '/docs',
		},
		{
			label: t('privacy'),
			description: t('privacyDescription'),
			href: '/privacy',
		},
	]

	// Hide navbar on mobile in read mode (ReadModeHeader is used instead)
	const mobileHiddenClass = mode === 'read' ? 'hidden lg:block' : ''

	return (
		<nav
			className={`sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl ${mobileHiddenClass}`}
		>
			<div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
					<CopticCross size={22} />
					<span className="text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight">
						Coptic IO
					</span>
				</Link>

				<div className="flex items-center gap-4">
					<SearchButton />
					<div className="flex items-center gap-2 sm:gap-4">
						{/* Search icon - visible on mobile in browse mode */}
						<button
							type="button"
							className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
							aria-label={t('search') || 'Search'}
						>
							<SearchIcon className="w-5 h-5" />
						</button>

						{/* Desktop navigation */}
						<div className="hidden lg:flex items-center gap-4">
							<NavDropdown label={t('read')} items={readMenuItems} />
							<NavDropdown label={t('more')} items={moreMenuItems} />
						</div>
						<Link
							href="/calendar"
							className="hidden lg:block text-[13px] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							{t('calendar')}
						</Link>
					</div>
					<Link
						href="/subscribe"
						className="hidden lg:block text-[13px] bg-amber-700 hover:bg-amber-600 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
					>
						{t('subscribe')}
					</Link>
					<LocaleSwitcher />
					<ThemeToggle />
				</div>
			</div>
		</nav>
	)
}
