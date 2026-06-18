import { PillarLanding } from '@/components/PillarLanding'
import { isLentSeasonNow } from '@/lib/season'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
	title: 'Read — Readings, Synaxarium & more',
	description:
		'Read the daily Katameros lectionary, the Synaxarium, and other Coptic Orthodox texts.',
}

export default async function ReadPage() {
	const t = await getTranslations('nav')
	const lent = await isLentSeasonNow()
	return <PillarLanding pillar="read" title={t('read')} tagline={t('readTagline')} lent={lent} />
}
