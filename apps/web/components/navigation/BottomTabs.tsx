'use client'

import { BookIcon, CalendarIcon, SunIcon } from '@/components/ui/Icons'
import { useNavigation } from '@/contexts/NavigationContext'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabsConfig = [
	{ id: 'today', labelKey: 'today', icon: SunIcon, href: '/' },
	{ id: 'library', labelKey: 'library', icon: BookIcon, href: '/library' },
	{ id: 'calendar', labelKey: 'calendar', icon: CalendarIcon, href: '/calendar' },
] as const

export function BottomTabs() {
	const { mode } = useNavigation()
	const pathname = usePathname()
	const t = useTranslations('tabs')

	// Hide tabs in read mode
	if (mode === 'read') {
		return null
	}

	const getActiveTab = () => {
		if (pathname === '/') return 'today'
		if (pathname.startsWith('/library')) return 'library'
		if (pathname.startsWith('/calendar')) return 'calendar'
		return null
	}

	const activeTab = getActiveTab()

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden" aria-label="Main navigation">
			<div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
				<div className="flex items-center justify-around h-16 px-4 safe-area-pb">
					{tabsConfig.map((tab) => {
						const isActive = activeTab === tab.id
						const Icon = tab.icon

						return (
							<Link
								key={tab.id}
								href={tab.href}
								className={`
									flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[72px]
									focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900
									${
										isActive
											? 'text-amber-600 dark:text-amber-400'
											: 'text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800'
									}
								`}
								aria-current={isActive ? 'page' : undefined}
							>
								<Icon className="w-6 h-6" strokeWidth={isActive ? 2 : 1.5} />
								<span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
									{t(tab.labelKey)}
								</span>
							</Link>
						)
					})}
				</div>
			</div>
		</nav>
	)
}
