import type { BibleTranslation } from '@/components/ScriptureReading/types'
import { orderLanguages } from '@/components/ScriptureReading/utils'
import { API_BASE_URL } from '@/config'
import {
	CONTENT_LANGUAGES_COOKIE,
	type ContentLanguage,
	defaultContentLanguages,
	parseContentLanguages,
} from '@/i18n/content-languages'
import {
	type TasbehaDayId,
	getCurrentTasbehaDay,
	getTasbehaDay,
	isTasbehaDayId,
	tasbehaPraiseLabel,
} from '@/lib/tasbehaDays'
import type { IncenseService } from '@/lib/types'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { TasbehaContent, TasbehaFallback } from './TasbehaContent'

const TASBEHA_LANGS = ['en', 'cop', 'ar'] as const satisfies ContentLanguage[]
type TasbehaLang = (typeof TASBEHA_LANGS)[number]

interface TasbehaPageProps {
	searchParams: Promise<{ day?: string }>
}

export async function generateMetadata({ searchParams }: TasbehaPageProps): Promise<Metadata> {
	const { day } = await searchParams
	const info = getTasbehaDay(isTasbehaDayId(day) ? day : getCurrentTasbehaDay())
	const praise = tasbehaPraiseLabel(info, false)
	return {
		title: `Tasbeha — ${info.name} ${praise}`,
		description: `Pray the annual ${info.name} Coptic Orthodox ${praise} in English, Coptic, and Arabic.`,
	}
}

async function fetchTasbeha(
	day: TasbehaDayId,
	lang: TasbehaLang,
	date: string,
): Promise<IncenseService | null> {
	try {
		const response = await fetch(`${API_BASE_URL}/tasbeha/${day}?lang=${lang}&date=${date}`, {
			next: { revalidate: 43200 },
		})
		if (!response.ok) return null
		return response.json()
	} catch {
		return null
	}
}

export default async function TasbehaPage({ searchParams }: TasbehaPageProps) {
	const { day: dayParam } = await searchParams
	// An unrecognised or absent ?day= falls back to the service prayed today, so
	// /tasbeha is always the day you are actually in.
	const hasDayParam = isTasbehaDayId(dayParam)
	const dayId = hasDayParam ? dayParam : getCurrentTasbehaDay()

	const cookieStore = await cookies()
	const contentLanguages = parseContentLanguages(cookieStore.get(CONTENT_LANGUAGES_COOKIE)?.value)
	const selected = (
		contentLanguages.length > 0 ? contentLanguages : defaultContentLanguages.en
	).filter((language): language is TasbehaLang => TASBEHA_LANGS.includes(language as TasbehaLang))
	const unsupportedOnly = selected.length === 0
	const langs = orderLanguages(unsupportedOnly ? ['en'] : selected) as BibleTranslation[]

	// The date still governs the date-limited final parts of the Sunday Theotokia,
	// independently of which day's service is being read.
	const now = new Date()
	const date = [
		now.getFullYear(),
		String(now.getMonth() + 1).padStart(2, '0'),
		String(now.getDate()).padStart(2, '0'),
	].join('-')

	const results = await Promise.all(
		langs.map(async (lang) => ({
			lang,
			service: await fetchTasbeha(dayId, lang as TasbehaLang, date),
		})),
	)
	const servicesByLang = Object.fromEntries(
		results.filter(({ service }) => service).map(({ lang, service }) => [lang, service]),
	) as Partial<Record<string, IncenseService>>

	return (
		<Suspense fallback={<TasbehaFallback />}>
			<TasbehaContent
				servicesByLang={servicesByLang}
				langs={langs}
				dayId={dayId}
				unsupportedLanguage={unsupportedOnly}
			/>
		</Suspense>
	)
}
