'use client'

import { useTranslations } from 'next-intl'

export const CATEGORIES = [
	{ id: 'all', labelKey: 'all', pattern: null },
	{ id: 'martyrs', labelKey: 'martyrs', pattern: /martyr/i },
	{ id: 'popes', labelKey: 'popes', pattern: /pope|patriarch/i },
	{ id: 'apostles', labelKey: 'apostles', pattern: /apostle/i },
	{ id: 'departures', labelKey: 'departures', pattern: /departure/i },
	{ id: 'feasts', labelKey: 'feasts', pattern: /feast|commemoration/i },
	{
		id: 'monastics',
		labelKey: 'monastics',
		pattern: /monk|nun|hermit|abbot|monastery|desert father|ascetic/i,
	},
	{ id: 'bishops', labelKey: 'bishops', pattern: /bishop|metropolitan|archbishop/i },
] as const

export type CategoryId = (typeof CATEGORIES)[number]['id']

export function getCategoryForEntry(name: string): CategoryId {
	for (const cat of CATEGORIES) {
		if (cat.pattern?.test(name)) {
			return cat.id
		}
	}
	return 'all'
}

export function getCategoryColor(categoryId: CategoryId): string {
	const colors: Record<CategoryId, string> = {
		all: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
		martyrs: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
		popes: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
		apostles: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
		departures: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
		feasts: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
		monastics: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
		bishops: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
	}
	return colors[categoryId] || colors.all
}

export function getCategoryLabelKey(name: string): string {
	const categoryId = getCategoryForEntry(name)
	return CATEGORIES.find((c) => c.id === categoryId)?.labelKey || 'other'
}

export function getCategoryColorForName(name: string): string {
	return getCategoryColor(getCategoryForEntry(name))
}

export function matchesCategory(name: string, category: string): boolean {
	if (category === 'all') return true
	const cat = CATEGORIES.find((c) => c.id === category)
	return cat?.pattern?.test(name) ?? false
}

interface SynaxariumCategoryFiltersProps {
	selectedCategory: CategoryId
	onCategoryChange: (category: CategoryId) => void
	counts: Record<CategoryId, number>
	showCounts: boolean
}

export function SynaxariumCategoryFilters({
	selectedCategory,
	onCategoryChange,
	counts,
	showCounts,
}: SynaxariumCategoryFiltersProps) {
	const t = useTranslations('categories')

	return (
		<section className="relative px-6 pb-3 sm:pb-6">
			<div className="max-w-4xl mx-auto">
				<div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
					{CATEGORIES.map((cat) => {
						const count = counts[cat.id]
						if (cat.id !== 'all' && count === 0 && showCounts) return null
						const isSelected = selectedCategory === cat.id
						return (
							<button
								key={cat.id}
								type="button"
								onClick={() => onCategoryChange(cat.id)}
								className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
									isSelected
										? 'bg-amber-600 text-white border-amber-600 shadow-sm'
										: 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200/80 dark:border-gray-700/80 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-900/20'
								}`}
							>
								{t(cat.labelKey)}
								{showCounts && (
									<span
										className={`ms-1.5 ${isSelected ? 'text-amber-200' : 'text-gray-400 dark:text-gray-500'}`}
									>
										({count})
									</span>
								)}
							</button>
						)
					})}
				</div>
			</div>
		</section>
	)
}
