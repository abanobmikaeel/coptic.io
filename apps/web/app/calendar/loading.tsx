export default function CalendarLoading() {
	return (
		<main className="min-h-screen relative">
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none">
				<div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/[0.03] dark:bg-amber-500/[0.05] rounded-full blur-[100px]" />
			</div>

			<section className="relative pt-20 pb-8 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<div className="h-9 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-2 animate-pulse" />
					<div className="h-5 w-64 bg-gray-200 dark:bg-gray-800 rounded mx-auto animate-pulse" />
				</div>
			</section>

			<section className="relative px-6 pb-16">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center justify-between mb-6">
						<div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
						<div className="flex items-center gap-3">
							<div className="w-20 h-10 bg-amber-200 dark:bg-amber-900/30 rounded-lg animate-pulse" />
							<div className="w-32 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
						</div>
						<div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
					</div>

					<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm dark:shadow-none">
						<div className="grid grid-cols-7 gap-3 mb-4">
							{Array.from({ length: 7 }).map((_, i) => (
								<div key={i} className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
							))}
						</div>
						<div className="grid grid-cols-7 gap-3">
							{Array.from({ length: 35 }).map((_, i) => (
								<div
									key={i}
									className="aspect-square bg-gray-100 dark:bg-gray-800/50 rounded-xl animate-pulse"
								/>
							))}
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
