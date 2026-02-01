import Link from 'next/link'
import CopticCross from './CopticCross'
import { NavDropdown } from './NavDropdown'
import ThemeToggle from './ThemeToggle'

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
	return (
		<nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
			<div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2.5 group">
					<CopticCross size={22} />
					<span className="text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight">
						Coptic IO
					</span>
				</Link>

				<div className="flex items-center gap-5">
					<NavDropdown label="Read" items={readMenuItems} />
					<Link
						href="/calendar"
						className="text-[13px] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
					>
						Calendar
					</Link>
					<Link
						href="/subscribe"
						className="text-[13px] bg-amber-700 hover:bg-amber-600 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
					>
						Subscribe
					</Link>
					<ThemeToggle />
				</div>
			</div>
		</nav>
	)
}
