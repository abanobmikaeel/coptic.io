import type { AgpeyaHour } from '@/components/AgpeyaHourSelector'
import type { BibleTranslation } from '@/components/ScriptureReading/types'
import { orderLanguages } from '@/components/ScriptureReading/utils'
import {
	CONTENT_LANGUAGES_COOKIE,
	type ContentLanguage,
	resolveContentLanguages,
} from '@/i18n/content-languages'
import { type ResolvedAgpeyaHour, agpeyaToService } from '@/lib/agpeyaToService'
import { api, cacheFor, dataOrNull } from '@/lib/client'
import type { CopticDate, IncenseService } from '@/lib/types'
import { getTodayDateString } from '@/lib/utils'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { AgpeyaContent, AgpeyaFallback } from './AgpeyaContent'

export const metadata: Metadata = {
	title: 'Agpeya — Coptic Book of Hours',
	description: 'Pray the canonical hours of the Coptic Orthodox Agpeya, in English and Arabic.',
}

const AGPEYA_HOUR_IDS = [
	'prime',
	'terce',
	'sext',
	'none',
	'vespers',
	'compline',
	'midnight',
] as const
// Languages the Agpeya may offer; the API's list narrows this further (Spanish has
// no prayer text yet). The Agpeya has no Coptic text, so Coptic is never offered.
const AGPEYA_LANGS = ['en', 'ar', 'es'] as const satisfies ContentLanguage[]
type AgpeyaLang = (typeof AGPEYA_LANGS)[number]

async function fetchHour(
	hour: AgpeyaHour,
	lang: AgpeyaLang,
	psalms: 'septuagint' | 'bible',
): Promise<ResolvedAgpeyaHour | null> {
	const data = await dataOrNull(
		api.GET('/api/agpeya/{hour}', {
			params: { path: { hour }, query: { lang, psalms, include: 'sections' } },
			...cacheFor(43200),
		}),
	)
	// include=sections makes the API send `sections`; its schema marks them optional
	return data?.sections ? { ...data, sections: data.sections } : null
}

// Content languages the Agpeya can actually render. Falls back to all candidates
// if the endpoint is unreachable, so an outage never hides every language.
async function fetchAvailableTranslations(): Promise<AgpeyaLang[]> {
	const data = await dataOrNull(api.GET('/api/agpeya/translations', cacheFor(43200)))
	const available = (data?.available ?? []).filter((l): l is AgpeyaLang =>
		AGPEYA_LANGS.includes(l as AgpeyaLang),
	)
	return available.length > 0 ? available : [...AGPEYA_LANGS]
}

const fetchCopticDate = (date: string, lang: string): Promise<CopticDate | null> =>
	dataOrNull(
		api.GET('/api/calendar/{date}', {
			params: { path: { date }, query: { lang } },
			...cacheFor(43200),
		}),
	)

interface AgpeyaPageProps {
	searchParams: Promise<{ hour?: string; psalms?: string }>
}

export default async function AgpeyaPage({ searchParams }: Readonly<AgpeyaPageProps>) {
	const params = await searchParams
	const hasHourParam = !!params.hour
	const hour = (
		AGPEYA_HOUR_IDS.includes(params.hour as (typeof AGPEYA_HOUR_IDS)[number])
			? params.hour
			: 'prime'
	) as AgpeyaHour
	// Psalm text source. Default is the Septuagint liturgical psalter (traditional
	// Agpeya divisions); ?psalms=bible swaps in the reader's Bible translation.
	const psalms = params.psalms === 'bible' ? 'bible' : 'septuagint'

	const cookieStore = await cookies()
	const contentLanguages = resolveContentLanguages(
		cookieStore.get(CONTENT_LANGUAGES_COOKIE)?.value,
		await getLocale(),
	)
	const available = await fetchAvailableTranslations()
	const selected = contentLanguages.filter((l): l is AgpeyaLang =>
		available.includes(l as AgpeyaLang),
	)
	const ordered = orderLanguages(selected.length > 0 ? selected : ['en']) as BibleTranslation[]

	const today = getTodayDateString()
	const copticDate = (await fetchCopticDate(today, ordered[0] ?? 'en')) ?? {
		dateString: '',
		day: 0,
		month: 0,
		year: 0,
		monthString: '',
	}

	const results = await Promise.all(ordered.map((l) => fetchHour(hour, l as AgpeyaLang, psalms)))
	const servicesByLang: Partial<Record<string, IncenseService>> = {}
	ordered.forEach((l, i) => {
		const h = results[i]
		if (h) servicesByLang[l] = agpeyaToService(h, today, copticDate)
	})

	return (
		<Suspense fallback={<AgpeyaFallback />}>
			<AgpeyaContent
				servicesByLang={servicesByLang}
				langs={ordered}
				availableLanguages={available as BibleTranslation[]}
				hourId={hour}
				hasHourParam={hasHourParam}
			/>
		</Suspense>
	)
}
