export default function ReadingsLoading() {
	return (
		<main className="min-h-screen bg-white dark:bg-gray-900">
			{/* Sticky header skeleton */}
			<div className="sticky top-14 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800">
				<div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center relative">
					<div className="text-center">
						<div className="h-7 w-40 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-1 animate-pulse" />
						<div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded mx-auto animate-pulse" />
					</div>
					<div className="absolute right-6">
						<div className="h-10 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
					</div>
				</div>
			</div>

			{/* Content skeleton */}
			<div className="px-6 pt-10 pb-24">
				{/* Scripture reading skeletons */}
				{[1, 2, 3].map((section) => (
					<div key={section} className="max-w-2xl mx-auto px-4 mb-12">
						{/* Section header */}
						<div className="py-4 pl-4 border-l-4 border-amber-500/60 bg-gray-50/70 dark:bg-gray-800/40 mb-6">
							<div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded mb-2 animate-pulse" />
							<div className="h-7 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse" />
							<div className="h-5 w-40 bg-amber-200/50 dark:bg-amber-900/30 rounded animate-pulse" />
						</div>

						{/* Chapter heading */}
						<div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-10 animate-pulse" />

						{/* Verses */}
						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map((verse) => (
								<div key={verse} className="flex gap-2">
									<div className="h-6 w-full bg-gray-100 dark:bg-gray-800/50 rounded animate-pulse" />
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</main>
	)
}
