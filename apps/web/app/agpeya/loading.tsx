export default function AgpeyaLoading() {
	const shimmer = 'bg-gray-200 dark:bg-gray-800 animate-pulse'

	return (
		<main className="min-h-screen bg-white dark:bg-gray-900">
			{/* Header */}
			<section className="relative pt-20 pb-4 px-6">
				<div className="max-w-4xl mx-auto">
					<div className={`h-4 w-16 rounded ${shimmer}`} />
				</div>
			</section>

			{/* Sticky header skeleton */}
			<div className="sticky top-14 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800">
				<div className="max-w-4xl mx-auto px-6 py-3">
					<div className="flex items-center justify-between gap-4">
						<div className={`h-10 w-40 rounded-full ${shimmer}`} />
						<div className={`h-10 w-10 rounded-lg ${shimmer}`} />
					</div>
				</div>
			</div>

			{/* Content skeleton */}
			<div className="max-w-2xl mx-auto px-6 pt-8 pb-32">
				<div className="space-y-8">
					{/* Hour title skeleton */}
					<div className="mb-8">
						<div className={`h-8 w-32 rounded ${shimmer}`} />
						<div className={`h-4 w-24 rounded mt-2 ${shimmer}`} />
						<div className={`h-4 w-full max-w-md rounded mt-3 ${shimmer}`} />
					</div>

					{/* Opening prayer skeleton */}
					<div className="space-y-4">
						<div className={`h-6 w-full rounded ${shimmer}`} />
						<div className={`h-6 w-11/12 rounded ${shimmer}`} />
						<div className={`h-6 w-4/5 rounded ${shimmer}`} />
					</div>

					{/* Psalms section skeleton */}
					<div>
						<div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
							<div className={`h-5 w-24 rounded ${shimmer}`} />
							<div className={`h-4 w-4 rounded ${shimmer}`} />
						</div>
						<div className="mt-6 space-y-6">
							{/* Psalm header */}
							<div className="flex items-center gap-2 py-2">
								<div className={`h-5 w-20 rounded ${shimmer}`} />
								<div className={`h-4 w-28 rounded ${shimmer}`} />
							</div>
							{/* Verses */}
							<div className="space-y-4">
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="flex gap-3">
										<div className={`h-5 w-5 rounded flex-shrink-0 ${shimmer}`} />
										<div className={`h-5 flex-1 rounded ${shimmer}`} />
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Gospel section skeleton */}
					<div>
						<div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
							<div className="flex items-center gap-2">
								<div className={`h-5 w-16 rounded ${shimmer}`} />
								<div className={`h-4 w-24 rounded ${shimmer}`} />
							</div>
							<div className={`h-4 w-4 rounded ${shimmer}`} />
						</div>
						<div className="mt-6 space-y-4">
							{[1, 2, 3].map((i) => (
								<div key={i} className="flex gap-3">
									<div className={`h-5 w-6 rounded flex-shrink-0 ${shimmer}`} />
									<div className={`h-5 flex-1 rounded ${shimmer}`} />
								</div>
							))}
						</div>
					</div>

					{/* Litanies section skeleton */}
					<div>
						<div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
							<div className={`h-5 w-20 rounded ${shimmer}`} />
							<div className={`h-4 w-4 rounded ${shimmer}`} />
						</div>
						<div className="mt-6 space-y-4">
							<div className={`h-6 w-full rounded ${shimmer}`} />
							<div className={`h-6 w-3/4 rounded ${shimmer}`} />
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
