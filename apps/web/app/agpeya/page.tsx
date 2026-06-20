import type { AgpeyaHour } from '@/components/AgpeyaHourSelector'
import type { BibleTranslation } from '@/components/ScriptureReading/types'
import { orderLanguages } from '@/components/ScriptureReading/utils'
import { API_BASE_URL } from '@/config'
import {
	CONTENT_LANGUAGES_COOKIE,
	type ContentLanguage,
	defaultContentLanguages,
	parseContentLanguages,
} from '@/i18n/content-languages'
import { type ResolvedAgpeyaHour, agpeyaToService } from '@/lib/agpeyaToService'
import type { CopticDate, IncenseService } from '@/lib/types'
import { getTodayDateString } from '@/lib/utils'
import type { Metadata } from 'next'
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
// Languages whose Agpeya scripture can be resolved (prose currently English-only).
const AGPEYA_LANGS = ['en', 'ar', 'es', 'cop'] as const satisfies ContentLanguage[]
type AgpeyaLang = (typeof AGPEYA_LANGS)[number]

async function fetchHour(hour: string, lang: AgpeyaLang): Promise<ResolvedAgpeyaHour | null> {
	try {
		const res = await fetch(`${API_BASE_URL}/agpeya/${hour}?lang=${lang}`, {
			next: { revalidate: 43200 },
		})
		if (!res.ok) return null
		return res.json()
	} catch {
		return null
	}
}

// Content languages the Agpeya can actually render. Falls back to all candidates
// if the endpoint is unreachable, so an outage never hides every language.
async function fetchAvailableTranslations(): Promise<AgpeyaLang[]> {
	try {
		const res = await fetch(`${API_BASE_URL}/agpeya/translations`, {
			next: { revalidate: 43200 },
		})
		if (!res.ok) return [...AGPEYA_LANGS]
		const data = (await res.json()) as { available?: string[] }
		const available = (data.available ?? []).filter((l): l is AgpeyaLang =>
			AGPEYA_LANGS.includes(l as AgpeyaLang),
		)
		return available.length > 0 ? available : [...AGPEYA_LANGS]
	} catch {
		return [...AGPEYA_LANGS]
	}
}

async function fetchCopticDate(date: string, lang: string): Promise<CopticDate | null> {
	try {
		const res = await fetch(`${API_BASE_URL}/calendar/${date}?lang=${lang}`, {
			next: { revalidate: 43200 },
		})
		if (!res.ok) return null
		return res.json()
	} catch {
		return null
	}
}

interface AgpeyaPageProps {
	searchParams: Promise<{ hour?: string }>
}

export default async function AgpeyaPage({ searchParams }: AgpeyaPageProps) {
	const params = await searchParams
	const hasHourParam = !!params.hour
	const hour = (
		AGPEYA_HOUR_IDS.includes(params.hour as (typeof AGPEYA_HOUR_IDS)[number])
			? params.hour
			: 'prime'
	) as AgpeyaHour

	const cookieStore = await cookies()
	const contentLanguages = parseContentLanguages(cookieStore.get(CONTENT_LANGUAGES_COOKIE)?.value)
	const available = await fetchAvailableTranslations()
	const selected = (
		contentLanguages.length > 0 ? contentLanguages : defaultContentLanguages.en
	).filter((l): l is AgpeyaLang => available.includes(l as AgpeyaLang))
	const ordered = orderLanguages(selected.length > 0 ? selected : ['en']) as BibleTranslation[]

	const today = getTodayDateString()
	const copticDate = (await fetchCopticDate(today, ordered[0] ?? 'en')) ?? {
		dateString: '',
		day: 0,
		month: 0,
		year: 0,
		monthString: '',
	}

	const results = await Promise.all(ordered.map((l) => fetchHour(hour, l as AgpeyaLang)))
	const servicesByLang: Partial<Record<string, IncenseService>> = {}
	ordered.forEach((l, i) => {
		const h = results[i]
		// Coptic has no prayer prose — show its column for scripture (psalms/gospel) only.
		if (h) servicesByLang[l] = agpeyaToService(h, today, copticDate, { scriptureOnly: l === 'cop' })
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
