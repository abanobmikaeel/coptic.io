import { CardSkeleton } from '@/components/ui/Skeleton';

export default function PreferencesLoading() {
	return (
		<main className="min-h-screen relative overflow-hidden">
			<section className="relative pt-24 pb-12 px-6">
				<div className="max-w-md mx-auto">
					<CardSkeleton />
				</div>
			</section>
		</main>
	);
}
