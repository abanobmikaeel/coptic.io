import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Library',
	description: 'Browse Coptic Orthodox prayers, readings, and spiritual texts.',
}

export default async function LibraryPage() {
	const t = await getTranslations('library')
	const navT = await getTranslations('nav')

	const contentTypes = [
		{
			id: 'readings',
			title: navT('katamaros'),
			subtitle: navT('katamarosDescription'),
			description: t('katamarosDescription'),
			href: '/readings',
			icon: (
				<svg
					className="w-8 h-8"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
					/>
				</svg>
			),
			color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
		},
		{
			id: 'agpeya',
			title: navT('agpeya'),
			subtitle: navT('agpeyaDescription'),
			description: t('agpeyaDescription'),
			href: '/agpeya',
			icon: (
				<svg
					className="w-8 h-8"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
			color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
		},
		{
			id: 'synaxarium',
			title: navT('synaxarium'),
			subtitle: navT('synaxariumDescription'),
			description: t('synaxariumDescription'),
			href: '/synaxarium',
			icon: (
				<svg
					className="w-8 h-8"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
			),
			color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
		},
	]

	return (
		<main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
			{/* Header */}
			<section className="pt-8 pb-6 px-6">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1">{t('subtitle')}</p>
				</div>
			</section>

			{/* Content Grid */}
			<section className="px-6">
				<div className="max-w-4xl mx-auto">
					<div className="grid gap-4">
						{contentTypes.map((content) => (
							<Link
								key={content.id}
								href={content.href}
								className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 transition-all hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm active:scale-[0.98]"
							>
								<div className="flex items-start gap-4">
									{/* Icon */}
									<div className={`p-3 rounded-xl ${content.color}`}>{content.icon}</div>

									{/* Text */}
									<div className="flex-1 min-w-0">
										<div className="flex items-baseline gap-2">
											<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
												{content.title}
											</h2>
											<span className="text-sm text-gray-500 dark:text-gray-400">
												{content.subtitle}
											</span>
										</div>
										<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
											{content.description}
										</p>
									</div>

									{/* Arrow */}
									<svg
										className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>
		</main>
	)
}
