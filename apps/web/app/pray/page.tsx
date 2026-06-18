import { PillarLanding } from '@/components/PillarLanding'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
	title: 'Pray — Agpeya & Vespers',
	description: 'Pray with the Coptic Orthodox Church: the Agpeya hours and the Raising of Incense.',
}

export default async function PrayPage() {
	const t = await getTranslations('nav')
	return <PillarLanding pillar="pray" title={t('pray')} tagline={t('prayTagline')} />
}
