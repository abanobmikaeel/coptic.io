'use client'

import { useNavigation } from '@/contexts/NavigationContext'
import Link from 'next/link'
import CopticCross from './CopticCross'
import { NavDropdown } from './NavDropdown'
import { SearchButton } from './SearchButton'
import ThemeToggle from './ThemeToggle'
import { SearchIcon } from './ui/Icons'

const readMenuItems = [
	{
		label: 'Katamaros',
		description: 'Daily Lectionary',
		href: '/readings',
	},
	{
		label: 'Agpeya',
		description: 'Prayer Hours',
		href: '/agpeya',
	},
	{
		label: 'Synaxarium',
		description: 'Lives of Saints',
		href: '/synaxarium',
	},
]

export default function Navbar() {
	const { mode } = useNavigation()

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
							aria-label="Search"
						>
							<SearchIcon className="w-5 h-5" />
						</button>

						{/* Desktop navigation */}
						<div className="hidden lg:block">
							<NavDropdown label="Read" items={readMenuItems} />
						</div>
						<Link
							href="/calendar"
							className="hidden lg:block text-[13px] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							Calendar
						</Link>
					</div>
					<Link
						href="/subscribe"
						className="hidden lg:block text-[13px] bg-amber-700 hover:bg-amber-600 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
					>
						Subscribe
					</Link>
					<ThemeToggle />
				</div>
			</div>
		</nav>
	)
}
