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
