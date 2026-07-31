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
import type { IncenseService } from '@/lib/types'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Suspense } from 'react'

const LITURGY_LANGS = ['en', 'cop', 'ar'] as const satisfies ContentLanguage[]
type LiturgyLang = (typeof LITURGY_LANGS)[number]

export const metadata: Metadata = {
	title: 'The Divine Liturgy of St. Basil',
	description:
		"Pray the Coptic Orthodox Divine Liturgy of St. Basil in English, Coptic, and Arabic, with the day's Pauline, Catholic and Praxis readings and gospel.",
}

interface LiturgyPageProps {
	searchParams: Promise<{ date?: string }>
}

async function fetchLiturgy(lang: LiturgyLang, date: string): Promise<IncenseService | null> {
	try {
		const response = await fetch(
			`${API_BASE_URL}/liturgy/basil?${new URLSearchParams({ lang, date })}`,
			{ next: { revalidate: 43200 } },
		)
		if (!response.ok) return null
		return response.json()
	} catch {
		return null
	}
}

export default async function LiturgyPage({ searchParams }: LiturgyPageProps) {
	const { date: dateParam } = await searchParams

	const now = new Date()
	const today = [
		now.getFullYear(),
		String(now.getMonth() + 1).padStart(2, '0'),
		String(now.getDate()).padStart(2, '0'),
	].join('-')
	// The readings are date-bound, so an unparseable ?date= falls back to today
	// rather than surfacing an error page.
	const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : today

	const cookieStore = await cookies()
	const contentLanguages = parseContentLanguages(cookieStore.get(CONTENT_LANGUAGES_COOKIE)?.value)
	const selected = (
		contentLanguages.length > 0 ? contentLanguages : defaultContentLanguages.en
	).filter((language): language is LiturgyLang => LITURGY_LANGS.includes(language as LiturgyLang))
	// Someone reading only in a language the Liturgy has no text for still gets the
	// service, in English, with a note rather than an empty page.
	const unsupportedOnly = selected.length === 0
	const langs = orderLanguages(unsupportedOnly ? ['en'] : selected) as BibleTranslation[]

	const results = await Promise.all(
		langs.map(async (lang) => ({
			lang,
			service: await fetchLiturgy(lang as LiturgyLang, date),
		})),
	)
	const servicesByLang = Object.fromEntries(
		results.filter(({ service }) => service).map(({ lang, service }) => [lang, service]),
	) as Partial<Record<string, IncenseService>>

	return (
		<Suspense fallback={<ServiceReaderFallback />}>
			<LiturgicalServiceReader
				title="Divine Liturgy"
				basePath="/liturgy"
				servicesByLang={servicesByLang}
				langs={langs}
				availableLanguages={LITURGY_LANGS as unknown as BibleTranslation[]}
				{...(unsupportedOnly
					? { notice: 'The Divine Liturgy is not yet available in your reading language.' }
					: {})}
			/>
		</Suspense>
	)
}
