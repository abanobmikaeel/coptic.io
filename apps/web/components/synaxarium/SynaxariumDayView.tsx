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
import { CATEGORIES, type CategoryId } from './SynaxariumCategoryFilters'

interface SynaxariumDayViewProps {
	currentDate: string
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
}: Readonly<SynaxariumDayViewProps>) {
	const t = useTranslations('synaxarium')
	const tCategories = useTranslations('categories')

	return (
		<>
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
