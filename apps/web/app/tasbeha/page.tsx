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
import { TasbehaContent, TasbehaFallback } from './TasbehaContent'

export const metadata: Metadata = {
	title: 'Tasbeha — Midnight Praises',
	description:
		'Pray the annual Sunday Coptic Orthodox Midnight Praises in English, Coptic, and Arabic.',
}

const TASBEHA_LANGS = ['en', 'cop', 'ar'] as const satisfies ContentLanguage[]
type TasbehaLang = (typeof TASBEHA_LANGS)[number]

async function fetchTasbeha(lang: TasbehaLang, date: string): Promise<IncenseService | null> {
	try {
		const response = await fetch(`${API_BASE_URL}/tasbeha/sunday?lang=${lang}&date=${date}`, {
			next: { revalidate: 43200 },
		})
		if (!response.ok) return null
		return response.json()
	} catch {
		return null
	}
}

export default async function TasbehaPage() {
	const cookieStore = await cookies()
	const contentLanguages = parseContentLanguages(cookieStore.get(CONTENT_LANGUAGES_COOKIE)?.value)
	const selected = (
		contentLanguages.length > 0 ? contentLanguages : defaultContentLanguages.en
	).filter((language): language is TasbehaLang => TASBEHA_LANGS.includes(language as TasbehaLang))
	const unsupportedOnly = selected.length === 0
	const langs = orderLanguages(unsupportedOnly ? ['en'] : selected) as BibleTranslation[]
	const now = new Date()
	const date = [
		now.getFullYear(),
		String(now.getMonth() + 1).padStart(2, '0'),
		String(now.getDate()).padStart(2, '0'),
	].join('-')
	const results = await Promise.all(
		langs.map(async (lang) => ({ lang, service: await fetchTasbeha(lang as TasbehaLang, date) })),
	)
	const servicesByLang = Object.fromEntries(
		results.filter(({ service }) => service).map(({ lang, service }) => [lang, service]),
	) as Partial<Record<string, IncenseService>>

	return (
		<Suspense fallback={<TasbehaFallback />}>
			<TasbehaContent
				servicesByLang={servicesByLang}
				langs={langs}
				unsupportedLanguage={unsupportedOnly}
			/>
		</Suspense>
	)
}
