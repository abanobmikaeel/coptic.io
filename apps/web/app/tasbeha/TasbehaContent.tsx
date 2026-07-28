'use client'

import {
	LiturgicalServiceReader,
	ServiceReaderFallback,
} from '@/components/LiturgicalServiceReader'
import type { BibleTranslation } from '@/components/ScriptureReading/types'
import type { IncenseService } from '@/lib/types'
import { useLocale } from 'next-intl'

export const TasbehaFallback = ServiceReaderFallback

interface TasbehaContentProps {
	servicesByLang: Partial<Record<string, IncenseService>>
	langs: BibleTranslation[]
	unsupportedLanguage?: boolean
}

export function TasbehaContent({
	servicesByLang,
	langs,
	unsupportedLanguage,
}: TasbehaContentProps) {
	const locale = useLocale()
	const isArabic = locale === 'ar'
	const languageNotice = unsupportedLanguage
		? isArabic
			? 'التسبحة متاحة حاليًا بالقبطية والعربية والإنجليزية؛ يتم عرض الإنجليزية.'
			: 'Tasbeha is currently available in Coptic, English, and Arabic — showing English.'
		: null
	const riteLabel = (
		<div className="flex items-center gap-1.5">
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				className="text-amber-500"
				aria-hidden="true"
			>
				<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
			</svg>
			<span className="text-xs sm:text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
				{isArabic ? 'سنوي · الأحد (آدام)' : 'Annual · Sunday (Adam)'}
			</span>
		</div>
	)

	return (
		<LiturgicalServiceReader
			title={isArabic ? 'تسبحة نصف الليل' : 'Tasbeha'}
			basePath="/tasbeha"
			servicesByLang={servicesByLang}
			langs={langs}
			availableLanguages={['en', 'cop', 'ar']}
			contentLayout="stanzas"
			rowsPerPageByKind={{ opening: 2, canticle: 2 }}
			notice={languageNotice ?? undefined}
			headerCenter={riteLabel}
		/>
	)
}
