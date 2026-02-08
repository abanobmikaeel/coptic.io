'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { addDaysToDateString } from '@/lib/utils/dateFormatters'
import { useTranslations } from 'next-intl'
import {
	CATEGORIES,
	type CategoryId,
	getCategoryColorForName,
	getCategoryLabelKey,
	matchesCategory,
} from './SynaxariumCategoryFilters'
import { UpcomingSynaxarium } from './UpcomingSynaxarium'

interface SynaxariumUpcomingViewProps {
	startDate: string
	selectedCategory: CategoryId
}

export function SynaxariumUpcomingView({
	startDate,
	selectedCategory,
}: SynaxariumUpcomingViewProps) {
	const t = useTranslations('synaxarium')
	const tCommon = useTranslations('common')
	const tCategories = useTranslations('categories')

	// Start from tomorrow, not today
	const tomorrowDate = addDaysToDateString(startDate, 1)

	return (
		<section className="relative px-6 pb-16">
			<div className="max-w-4xl mx-auto">
				<Card>
					<CardHeader>
						{tCommon('upcoming')}
						{selectedCategory !== 'all' && (
							<span className="ms-2 text-sm font-normal text-gray-500">
								{t('filteredBy')}{' '}
								{tCategories(CATEGORIES.find((c) => c.id === selectedCategory)?.labelKey || 'all')}
							</span>
						)}
					</CardHeader>
					<CardContent>
						<UpcomingSynaxarium
							startDate={tomorrowDate}
							daysToShow={14}
							selectedCategory={selectedCategory}
							getCategoryLabelKey={getCategoryLabelKey}
							getCategoryColor={getCategoryColorForName}
							matchesCategory={matchesCategory}
						/>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}
