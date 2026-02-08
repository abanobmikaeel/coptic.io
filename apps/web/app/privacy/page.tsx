import { Breadcrumb } from '@/components/Breadcrumb'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
	title: 'Privacy Policy',
	description: 'Privacy policy for Coptic.io',
}

export default async function PrivacyPage() {
	const t = await getTranslations('privacy')

	return (
		<main className="min-h-screen bg-gray-50 dark:bg-gray-950">
			<section className="pt-6 lg:pt-12 pb-12 px-6">
				<div className="max-w-2xl mx-auto">
					<Breadcrumb items={[{ label: t('title') }]} />
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-8">
						{t('title')}
					</h1>

					<div className="prose prose-gray dark:prose-invert max-w-none">
						<p className="text-gray-600 dark:text-gray-400 mb-6">{t('lastUpdated')}</p>

						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4">
							{t('infoWeCollect')}
						</h2>
						<p className="text-gray-600 dark:text-gray-400 mb-4">{t('infoWeCollectDesc')}</p>
						<ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
							<li>
								<strong>{t('emailSubs')}</strong> {t('emailSubsDesc')}
							</li>
							<li>
								<strong>{t('localPrefs')}</strong> {t('localPrefsDesc')}
							</li>
							<li>
								<strong>{t('analytics')}</strong> {t('analyticsDesc')}
							</li>
						</ul>

						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4">
							{t('howWeUse')}
						</h2>
						<ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
							<li>{t('howWeUseItem1')}</li>
							<li>{t('howWeUseItem2')}</li>
						</ul>

						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4">
							{t('dataSharing')}
						</h2>
						<p className="text-gray-600 dark:text-gray-400 mb-6">{t('dataSharingDesc')}</p>

						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4">
							{t('yourRights')}
						</h2>
						<p className="text-gray-600 dark:text-gray-400 mb-6">{t('yourRightsDesc')}</p>

						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4">
							{t('contact')}
						</h2>
						<p className="text-gray-600 dark:text-gray-400">
							{t('contactDesc')}{' '}
							<a
								href="https://github.com/coptic-io/coptic-io"
								className="text-amber-600 dark:text-amber-500 hover:underline"
								target="_blank"
								rel="noopener noreferrer"
							>
								{t('githubRepo')}
							</a>
							.
						</p>
					</div>
				</div>
			</section>
		</main>
	)
}
