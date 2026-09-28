'use client'

import type { ReadingTheme, ReadingWidth } from '@/components/DisplaySettings'
import { orderLanguages } from '@/components/ScriptureReading/utils'
import { CopticCrossIcon } from '@/components/ui/Icons'
import { useFitsOneLine } from '@/hooks/useFitsOneLine'
import { type ContentLang, getServiceName } from '@/i18n/content-translations'
import { getWidthClass, multiLangWidthClass, themeClasses } from '@/lib/reading-styles'
import { useRef } from 'react'

interface ServiceDividerProps {
	service: string
	languages: ContentLang[]
	theme: ReadingTheme
	// The reader's text width, which sets the cards' width when one language is shown
	width: ReadingWidth
}

// Opens the run of readings that belong to one service, naming it in each selected language
// between rules as wide as the cards below. Coptic has no service names of its own and shares
// English, so repeated names collapse. The names sit in one line with a cross between each; when
// they don't fit (three long names on a phone) they stack, one per line, without crosses.
export function ServiceDivider({
	service,
	languages,
	theme,
	width,
}: Readonly<ServiceDividerProps>) {
	const names = orderLanguages(languages)
		.map((lang) => ({ lang, name: getServiceName(service, lang) }))
		.filter((entry, i, all) => all.findIndex((e) => e.name === entry.name) === i)
	const row = useRef<HTMLDivElement>(null)
	// Each cross adds its width and a gap either side; the rules keep 2rem each plus their gaps
	const fits = useFitsOneLine(row, { extra: (names.length - 1) * 33, reserve: 96 })
	const widthClass =
		languages.length > 1 ? multiLangWidthClass(languages.length) : getWidthClass(width)

	return (
		<div
			ref={row}
			className={`${widthClass} mx-auto mt-12 mb-6 first:mt-2 flex items-center gap-4 ${themeClasses.muted[theme]}`}
		>
			<div className={`flex-1 min-w-8 border-t ${themeClasses.border[theme]}`} />
			<h2
				className={`min-w-0 flex items-center justify-center gap-x-2 text-base font-semibold ${fits ? '' : 'flex-col gap-y-0.5'}`}
			>
				{names.map(({ lang, name }, i) => (
					<span key={lang} className="flex items-center gap-2 whitespace-nowrap">
						{i > 0 && fits && <CopticCrossIcon className="w-[17px] h-[17px]" />}
						{/* Arabic a step larger and at medium weight so it matches the semibold English
						    optically; ! because .font-arabic pins its weight to regular */}
						<span
							data-fit-item
							lang={lang}
							dir={lang === 'ar' ? 'rtl' : undefined}
							className={lang === 'ar' ? 'font-arabic text-lg font-medium!' : undefined}
						>
							{name}
						</span>
					</span>
				))}
			</h2>
			<div className={`flex-1 min-w-8 border-t ${themeClasses.border[theme]}`} />
		</div>
	)
}
