'use client'

import type {
	FontFamily,
	FontWeight,
	LineSpacing,
	ReadingTheme,
	TextSize,
	WordSpacing,
} from '@/components/DisplaySettings'
import { BilingualSynaxariumSection } from '@/components/synaxarium/BilingualSynaxariumSection'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { NoEntriesState } from '@/components/ui/EmptyState'
import { ChevronRightIcon } from '@/components/ui/Icons'
import type { BilingualEntry } from '@/hooks/useSynaxarium'
import { themeClasses } from '@/lib/reading-styles'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
	CATEGORIES,
	type CategoryId,
	getCategoryColor,
	getCategoryForEntry,
} from './SynaxariumCategoryFilters'

interface SynaxariumDayViewProps {
	currentDate: string
	isToday: boolean
	bilingualEntries: BilingualEntry[]
	filteredBilingualEntries: BilingualEntry[]
	loading: boolean
	selectedCategory: CategoryId
	expandedEntry: string | null
	onExpandedChange: (id: string | null) => void
	textSize?: TextSize
	theme?: ReadingTheme
	fontFamily?: FontFamily
	weight?: FontWeight
	lineSpacing?: LineSpacing
	wordSpacing?: WordSpacing
}

export function SynaxariumDayView({
	currentDate,
	isToday,
	bilingualEntries,
	filteredBilingualEntries,
	loading,
	selectedCategory,
	expandedEntry,
	onExpandedChange,
	textSize = 'md',
	theme = 'light',
	fontFamily = 'serif',
	weight = 'normal',
	lineSpacing = 'normal',
	wordSpacing = 'normal',
}: SynaxariumDayViewProps) {
	const t = useTranslations('synaxarium')
	const tCategories = useTranslations('categories')

	return (
		<>
			{/* Featured Today */}
			{isToday && bilingualEntries.length > 0 && (
				<FeaturedTodayCard entries={bilingualEntries} theme={theme} />
			)}

			{/* View Readings Link */}
			<section className="relative px-4 sm:px-6 pb-4">
				<div className="max-w-5xl mx-auto text-center">
					<Link
						href={`/readings?date=${currentDate}`}
						prefetch={false}
						className={`inline-flex items-center gap-2 font-medium transition-colors ${themeClasses.accent[theme]} hover:opacity-80`}
					>
						{t('viewReadings')}
						<ChevronRightIcon className="w-4 h-4" />
					</Link>
				</div>
			</section>

			{/* Entries List */}
			<section className="relative px-4 sm:px-6 pb-16">
				<div className="max-w-5xl mx-auto">
					<Card className={themeClasses.bg[theme]}>
						<CardHeader className={themeClasses.textHeading[theme]}>
							{selectedCategory === 'all'
								? t('allCommemorations')
								: tCategories(CATEGORIES.find((c) => c.id === selectedCategory)?.labelKey || 'all')}
							<span className={`ms-2 text-sm font-normal ${themeClasses.muted[theme]}`}>
								({filteredBilingualEntries.length})
							</span>
						</CardHeader>
						<CardContent>
							{loading ? (
								<EntriesLoadingSkeleton />
							) : filteredBilingualEntries.length > 0 ? (
								<BilingualSynaxariumSection
									entries={filteredBilingualEntries}
									expandedEntry={expandedEntry}
									onExpandedChange={onExpandedChange}
									textSize={textSize}
									theme={theme}
									fontFamily={fontFamily}
									weight={weight}
									lineSpacing={lineSpacing}
									wordSpacing={wordSpacing}
								/>
							) : (
								<NoEntriesState
									type={
										selectedCategory === 'all'
											? t('commemorationsPlural')
											: tCategories(
													CATEGORIES.find((c) => c.id === selectedCategory)?.labelKey || 'all',
												).toLowerCase()
									}
								/>
							)}
						</CardContent>
					</Card>
				</div>
			</section>
		</>
	)
}

function FeaturedTodayCard({ entries, theme }: { entries: BilingualEntry[]; theme: ReadingTheme }) {
	const t = useTranslations('synaxarium')
	const tCategories = useTranslations('categories')

	return (
		<section className="relative px-4 sm:px-6 pb-8">
			<div className="max-w-5xl mx-auto">
				<Card
					className={`relative overflow-hidden border-amber-300/50 dark:border-amber-700/50 ${themeClasses.featuredCardBg[theme]} shadow-sm`}
				>
					{/* Decorative corner accents */}
					<div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-amber-400/30 dark:border-amber-600/30 rounded-tl-lg" />
					<div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-amber-400/30 dark:border-amber-600/30 rounded-tr-lg" />
					<div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-amber-400/30 dark:border-amber-600/30 rounded-bl-lg" />
					<div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-amber-400/30 dark:border-amber-600/30 rounded-br-lg" />

					<CardHeader className="flex items-center gap-3 relative z-10">
						<span className="text-amber-600 dark:text-amber-500 font-serif text-lg tracking-wide">
							{t('todaysSaints')}
						</span>
						<span className="text-sm font-normal text-gray-500 dark:text-gray-400">
							{entries.length}{' '}
							{entries.length !== 1 ? t('commemorationsPlural') : t('commemorations')}
						</span>
					</CardHeader>
					<CardContent className="relative z-10">
						<div className="grid gap-4 sm:grid-cols-2">
							{entries.slice(0, 4).map((entry) => {
								const name = entry.en?.name || entry.ar?.name || ''
								const category = getCategoryForEntry(name)
								return (
									<div
										key={entry.id}
										className={`p-4 rounded-xl border ${themeClasses.featuredCardItem[theme]} transition-all duration-200 hover:shadow-sm hover:border-amber-200/80 dark:hover:border-amber-800/80`}
									>
										<span
											className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${getCategoryColor(category)}`}
										>
											{tCategories(CATEGORIES.find((c) => c.id === category)?.labelKey || 'other')}
										</span>
										{/* English name */}
										{entry.en && (
											<p
												className={`font-serif text-base font-medium line-clamp-2 ${themeClasses.featuredCardText[theme]}`}
											>
												{entry.en.name}
											</p>
										)}
										{/* Arabic name */}
										{entry.ar && (
											<p
												className={`text-sm line-clamp-2 mt-2 ${themeClasses.featuredCardMuted[theme]}`}
												dir="rtl"
											>
												{entry.ar.name}
											</p>
										)}
									</div>
								)
							})}
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}

function EntriesLoadingSkeleton() {
	return (
		<div className="space-y-4 py-4">
			{[1, 2, 3, 4].map((i) => (
				<div
					key={i}
					className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-4 last:pb-0"
				>
					<div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
					<div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
					<div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
				</div>
			))}
		</div>
	)
}
