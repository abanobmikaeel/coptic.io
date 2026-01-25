import { CardSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
	return (
		<main className="min-h-screen relative overflow-hidden">
			<section className="relative pt-20 pb-8 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-4 animate-pulse" />
					<div className="h-6 w-96 bg-gray-200 dark:bg-gray-800 rounded mx-auto animate-pulse" />
				</div>
			</section>
			<section className="relative px-6 pb-12">
				<div className="max-w-4xl mx-auto">
					<CardSkeleton />
				</div>
			</section>
		</main>
	);
}
