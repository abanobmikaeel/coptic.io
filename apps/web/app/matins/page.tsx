import {
	LiturgicalServiceReader,
	ServiceReaderFallback,
} from '@/components/LiturgicalServiceReader'
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
import type { Metadata } from 'next'
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

async function fetchMatins(
	date: string,
	lang: IncenseLang,
	commemorations: string,
): Promise<IncenseService | null> {
	try {
		const query = new URLSearchParams({ date, lang })
		if (commemorations) query.set('commemorations', commemorations)
		const res = await fetch(`${API_BASE_URL}/incense/morning?${query}`, {
			next: { revalidate: 43200 },
		})
		if (!res.ok) return null
		return res.json()
	} catch {
		return null
	}
}

export default async function MatinsPage({ searchParams }: MatinsPageProps) {
	const { date: dateParam } = await searchParams
	// Unlike Vespers there is no evening rollover here: Matins belongs to the calendar
	// day it is prayed on.
	const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : getTodayDateString()

	const cookieStore = await cookies()
	const contentLanguages = parseContentLanguages(cookieStore.get(CONTENT_LANGUAGES_COOKIE)?.value)
	const commemorations = parseCommemorations(
		cookieStore.get(INCENSE_COMMEMORATIONS_COOKIE)?.value,
	).join(',')

	const selected = (
		contentLanguages.length > 0 ? contentLanguages : defaultContentLanguages.en
	).filter((language): language is IncenseLang => INCENSE_LANGS.includes(language as IncenseLang))
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
