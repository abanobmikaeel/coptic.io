interface SkeletonProps {
	className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
	return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
}

export function CardSkeleton() {
	return (
		<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm dark:shadow-none">
			<Skeleton className="h-6 w-1/3 mb-4" />
			<Skeleton className="h-4 w-2/3 mb-2" />
			<Skeleton className="h-4 w-1/2" />
		</div>
	)
}

export function FormSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-1/3" />
		</div>
	)
}

import { themeClasses } from '@/lib/reading-styles'

type ReadingTheme = 'light' | 'sepia' | 'dark'

function getShimmerClass(theme: ReadingTheme) {
	return themeClasses.shimmer[theme]
}

export function ReadingsSkeleton({ theme = 'light' }: { theme?: ReadingTheme }) {
	const shimmer = getShimmerClass(theme)

	return (
		<div className="space-y-12 max-w-full sm:max-w-2xl mx-auto px-3 sm:px-6 pt-4 pb-32">
			{/* Scripture section skeleton */}
			{[1, 2, 3].map((section) => (
				<div key={section} className="space-y-6">
					{/* Section header */}
					<div className="flex items-center gap-3 mb-4">
						<div className={`h-6 w-32 rounded ${shimmer}`} />
						<div className={`h-4 w-24 rounded ${shimmer}`} />
					</div>

					{/* Verses */}
					<div className="space-y-4">
						{[1, 2, 3, 4, 5].map((verse) => (
							<div key={verse} className="flex gap-3">
								<div className={`h-5 w-6 rounded flex-shrink-0 ${shimmer}`} />
								<div
									className={`h-5 flex-1 rounded ${shimmer}`}
									style={{ width: `${70 + Math.random() * 30}%` }}
								/>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	)
}

export function SynaxariumSkeleton({ theme = 'light' }: { theme?: ReadingTheme }) {
	const shimmer = getShimmerClass(theme)

	return (
		<div className="space-y-6 max-w-full sm:max-w-2xl mx-auto px-3 sm:px-6 pt-4 pb-32">
			{/* Header skeleton */}
			<div className="text-center mb-8">
				<div className={`h-8 w-48 mx-auto rounded ${shimmer} mb-3`} />
				<div className={`h-4 w-64 mx-auto rounded ${shimmer}`} />
			</div>

			{/* Entry cards skeleton */}
			{[1, 2, 3].map((entry) => (
				<div key={entry} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
					<div className={`h-5 w-16 rounded ${shimmer} mb-3`} />
					<div className={`h-6 w-3/4 rounded ${shimmer} mb-2`} />
					<div className={`h-4 w-full rounded ${shimmer} mb-1`} />
					<div className={`h-4 w-2/3 rounded ${shimmer}`} />
				</div>
			))}
		</div>
	)
}
