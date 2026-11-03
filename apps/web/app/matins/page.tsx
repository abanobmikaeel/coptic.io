import {
	LiturgicalServiceReader,
	ServiceReaderFallback,
} from '@/components/LiturgicalServiceReader'
import type { BibleTranslation } from '@/components/ScriptureReading/types'
import { orderLanguages } from '@/components/ScriptureReading/utils'
import {
	CONTENT_LANGUAGES_COOKIE,
	type ContentLanguage,
	resolveContentLanguages,
} from '@/i18n/content-languages'
import { api, cacheFor, dataOrNull } from '@/lib/client'
import { INCENSE_COMMEMORATIONS_COOKIE, parseCommemorations } from '@/lib/commemorations'
import type { IncenseService } from '@/lib/types'
import { getTodayDateString } from '@/lib/utils'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { cookies } from 'next/headers'
import { Suspense } from 'react'

const INCENSE_LANGS = ['en', 'ar', 'cop'] as const satisfies ContentLanguage[]
type IncenseLang = (typeof INCENSE_LANGS)[number]

export const metadata: Metadata = {
	title: 'Matins — Morning Raising of Incense',
	description:
		"Pray the Coptic Orthodox Morning Raising of Incense in English, Coptic, and Arabic, with the day's Matins psalm and gospel.",
}

interface MatinsPageProps {
	searchParams: Promise<{ date?: string }>
}

const fetchMatins = (
	date: string,
	lang: IncenseLang,
	commemorations: string,
): Promise<IncenseService | null> =>
	dataOrNull(
		api.GET('/api/incense/morning', {
			params: { query: { date, lang, commemorations: commemorations || undefined } },
			...cacheFor(43200),
		}),
	)

export default async function MatinsPage({ searchParams }: Readonly<MatinsPageProps>) {
	const { date: dateParam } = await searchParams
	// Unlike Vespers there is no evening rollover here: Matins belongs to the calendar
	// day it is prayed on.
	const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : getTodayDateString()

	const cookieStore = await cookies()
	const contentLanguages = resolveContentLanguages(
		cookieStore.get(CONTENT_LANGUAGES_COOKIE)?.value,
		await getLocale(),
	)
	const commemorations = parseCommemorations(
		cookieStore.get(INCENSE_COMMEMORATIONS_COOKIE)?.value,
	).join(',')

	const selected = contentLanguages.filter((language): language is IncenseLang =>
		INCENSE_LANGS.includes(language as IncenseLang),
	)
	const unsupportedOnly = selected.length === 0
	const langs = orderLanguages(unsupportedOnly ? ['en'] : selected) as BibleTranslation[]

	const results = await Promise.all(
		langs.map(async (lang) => ({
			lang,
			service: await fetchMatins(date, lang as IncenseLang, commemorations),
		})),
	)
	const servicesByLang = Object.fromEntries(
		results.filter(({ service }) => service).map(({ lang, service }) => [lang, service]),
	) as Partial<Record<string, IncenseService>>

	return (
		<Suspense fallback={<ServiceReaderFallback />}>
			<LiturgicalServiceReader
				title="Matins"
				basePath="/matins"
				servicesByLang={servicesByLang}
				langs={langs}
				availableLanguages={INCENSE_LANGS as unknown as BibleTranslation[]}
				{...(unsupportedOnly
					? { notice: 'Matins is not yet available in your reading language.' }
					: {})}
			/>
		</Suspense>
	)
}
