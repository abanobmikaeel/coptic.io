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
		<section className="relative px-6 pb-6">
			<div className="max-w-4xl mx-auto">
				<div className="relative">
					<SearchIcon className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
					<input
						type="text"
						placeholder={t('searchPlaceholder')}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className="w-full ps-12 pe-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
					/>
					{isSearching && (
						<div className="absolute end-4 top-1/2 -translate-y-1/2">
							<div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
						</div>
					)}
				</div>
			</div>
		</section>
	)
}
