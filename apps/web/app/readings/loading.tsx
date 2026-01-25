import { CardSkeleton } from '@/components/ui/Skeleton'

export default function ReadingsLoading() {
	return (
		<main className="min-h-screen relative">
			<section className="relative pt-20 pb-8 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<div className="h-9 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-2 animate-pulse" />
					<div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-1 animate-pulse" />
					<div className="h-5 w-40 bg-amber-200 dark:bg-amber-900/30 rounded mx-auto animate-pulse" />
				</div>
			</section>
			<section className="relative px-6 pb-16">
				<div className="max-w-4xl mx-auto space-y-6">
					<CardSkeleton />
					<CardSkeleton />
				</div>
			</section>
		</main>
	)
}
