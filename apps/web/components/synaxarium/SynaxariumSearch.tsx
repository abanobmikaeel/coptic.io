'use client'

import { SearchIcon } from '@/components/ui/Icons'
import { useTranslations } from 'next-intl'

interface SynaxariumSearchProps {
	value: string
	onChange: (value: string) => void
	isSearching: boolean
}

export function SynaxariumSearch({ value, onChange, isSearching }: SynaxariumSearchProps) {
	const t = useTranslations('synaxarium')

	return (
		<section className="relative px-6 pb-3 sm:pb-6">
			<div className="max-w-4xl mx-auto">
				<div className="relative group">
					<SearchIcon className="absolute start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-amber-500" />
					<input
						type="text"
						placeholder={t('searchPlaceholder')}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className="w-full ps-14 pe-5 py-3.5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all duration-200"
					/>
					{isSearching && (
						<div className="absolute end-5 top-1/2 -translate-y-1/2">
							<div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
						</div>
					)}
				</div>
			</div>
		</section>
	)
}
