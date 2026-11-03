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
import { getLocale } from 'next-intl/server'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { VespersContent, VespersFallback } from './VespersContent'

// Languages with incense data in the data package
const INCENSE_LANGS = ['en', 'ar', 'cop'] as const satisfies ContentLanguage[]
type IncenseLang = (typeof INCENSE_LANGS)[number]

const fetchIncenseService = (
	date: string,
	lang: IncenseLang,
	commemorations: string,
): Promise<IncenseService | null> =>
	dataOrNull(
		api.GET('/api/incense/evening', {
			params: { query: { date, lang, commemorations: commemorations || undefined } },
			...cacheFor(43200),
		}),
	)

interface VespersPageProps {
	searchParams: Promise<{ date?: string }>
}

export default async function VespersPage({ searchParams }: Readonly<VespersPageProps>) {
	const params = await searchParams
	const date = params.date ?? getTodayDateString()

	const cookieStore = await cookies()
	const contentLangCookie = cookieStore.get(CONTENT_LANGUAGES_COOKIE)?.value
	const contentLanguages = resolveContentLanguages(contentLangCookie, await getLocale())
	const commemorations = parseCommemorations(cookieStore.get(INCENSE_COMMEMORATIONS_COOKIE)?.value)
	const commemorationsParam = commemorations.join(',')
	const selected = contentLanguages.filter((l): l is IncenseLang =>
		INCENSE_LANGS.includes(l as IncenseLang),
	)

	// All chosen display languages lack Vespers data (e.g. Spanish only) — fall back to
	// English with a notice rather than a dead end.
	const unsupportedOnly = selected.length === 0
	const fetchLangs: IncenseLang[] = unsupportedOnly ? ['en'] : selected

	const results = await Promise.all(
		fetchLangs.map(async (lang) => ({
			lang,
			service: await fetchIncenseService(date, lang, commemorationsParam),
		})),
	)

	const servicesByLang = Object.fromEntries(
		results.filter((r) => r.service).map((r) => [r.lang, r.service!]),
	) as Partial<Record<IncenseLang, IncenseService>>

	const orderedLangs = orderLanguages(Object.keys(servicesByLang) as BibleTranslation[])

	return (
		<Suspense fallback={<VespersFallback />}>
			<VespersContent
				servicesByLang={servicesByLang}
				langs={orderedLangs}
				availableLanguages={[...INCENSE_LANGS] as BibleTranslation[]}
				date={params.date}
				commemorations={commemorations}
				notice={
					unsupportedOnly
						? 'Vespers is not yet available in your selected language — showing English.'
						: undefined
				}
			/>
		</Suspense>
	)
}
