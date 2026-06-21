import type { BibleTranslation } from '@/components/ScriptureReading/types'
import { orderLanguages } from '@/components/ScriptureReading/utils'
import { API_BASE_URL } from '@/config'
import {
	CONTENT_LANGUAGES_COOKIE,
	type ContentLanguage,
	defaultContentLanguages,
	parseContentLanguages,
} from '@/i18n/content-languages'
import { INCENSE_COMMEMORATIONS_COOKIE, parseCommemorations } from '@/lib/commemorations'
import type { IncenseService } from '@/lib/types'
import { getTodayDateString } from '@/lib/utils'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { VespersContent, VespersFallback } from './VespersContent'

// Languages with incense data in the data package
const INCENSE_LANGS = ['en', 'ar', 'cop'] as const satisfies ContentLanguage[]
type IncenseLang = (typeof INCENSE_LANGS)[number]

async function fetchIncenseService(
	date: string,
	lang: IncenseLang,
	commemorations: string,
): Promise<IncenseService | null> {
	try {
		const query = new URLSearchParams({ date, lang })
		if (commemorations) query.set('commemorations', commemorations)
		const res = await fetch(`${API_BASE_URL}/incense/evening?${query}`, {
			next: { revalidate: 43200 },
		})
		if (!res.ok) return null
		return res.json()
	} catch {
		return null
	}
}

interface VespersPageProps {
	searchParams: Promise<{ date?: string }>
}

export default async function VespersPage({ searchParams }: VespersPageProps) {
	const params = await searchParams
	const date = params.date ?? getTodayDateString()

	const cookieStore = await cookies()
	const contentLangCookie = cookieStore.get(CONTENT_LANGUAGES_COOKIE)?.value
	const contentLanguages = parseContentLanguages(contentLangCookie)
	const commemorations = parseCommemorations(cookieStore.get(INCENSE_COMMEMORATIONS_COOKIE)?.value)
	const commemorationsParam = commemorations.join(',')
	const selected = (
		contentLanguages.length > 0 ? contentLanguages : defaultContentLanguages.en
	).filter((l): l is IncenseLang => INCENSE_LANGS.includes(l as IncenseLang))

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
