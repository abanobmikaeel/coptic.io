'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { addDaysToDateString } from '@/lib/utils/dateFormatters'
import {
	CATEGORIES,
	type CategoryId,
	getCategoryColorForName,
	getCategoryLabel,
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
	// Start from tomorrow, not today
	const tomorrowDate = addDaysToDateString(startDate, 1)

	return (
		<section className="relative px-6 pb-16">
			<div className="max-w-4xl mx-auto">
				<Card>
					<CardHeader>
						Upcoming
						{selectedCategory !== 'all' && (
							<span className="ml-2 text-sm font-normal text-gray-500">
								Filtered by {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
							</span>
						)}
					</CardHeader>
					<CardContent>
						<UpcomingSynaxarium
							startDate={tomorrowDate}
							daysToShow={14}
							selectedCategory={selectedCategory}
							getCategoryLabel={getCategoryLabel}
							getCategoryColor={getCategoryColorForName}
							matchesCategory={matchesCategory}
						/>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}
