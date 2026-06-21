'use client'

import type { ContentLanguage } from '@/i18n/content-languages'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface LanguagePillsProps {
	selected: ContentLanguage[]
	onChange: (languages: ContentLanguage[]) => void
	// Languages the current content can actually render. When provided, languages
	// outside this set are hidden (e.g. Spanish has no Agpeya prose). A currently
	// selected language is always kept visible so it can still be deselected.
	availableLanguages?: ContentLanguage[]
}

// All languages with API support for readings, in display order.
const allLanguages: ContentLanguage[] = ['en', 'cop', 'ar', 'es']

const languageKeys: Record<ContentLanguage, string> = {
	cop: 'coptic',
	en: 'english',
	ar: 'arabic',
	es: 'spanish',
}

export function LanguagePills({ selected, onChange, availableLanguages }: LanguagePillsProps) {
	const t = useTranslations('contentLanguages')
	const router = useRouter()

	// Hide languages the current content can't render. An unavailable language never
	// renders a column (the page drops it), so it's hidden here even if still selected;
	// it stays in the cookie and reappears on content that does support it.
	const displayLanguages = availableLanguages
		? allLanguages.filter((l) => availableLanguages.includes(l))
		: allLanguages

	const handleToggle = (lang: ContentLanguage) => {
		if (selected.includes(lang)) {
			// Prevent deselecting the last language
			if (selected.length === 1) return
			onChange(selected.filter((l) => l !== lang))
		} else {
			onChange([...selected, lang])
		}
		// Refresh to pick up the new cookie value in Server Components
		router.refresh()
	}

	return (
		<div className="grid grid-cols-2 gap-2">
			{displayLanguages.map((lang) => {
				const isSelected = selected.includes(lang)
				const isLastSelected = isSelected && selected.length === 1

				return (
					<button
						key={lang}
						type="button"
						onClick={() => handleToggle(lang)}
						disabled={isLastSelected}
						className={`
							px-3 py-2 h-[72px] rounded-lg text-sm font-medium transition-colors
							${lang === 'ar' ? 'font-arabic' : lang === 'cop' ? 'font-coptic !text-base !leading-normal' : ''}
							${
								isSelected
									? 'bg-amber-700 text-white'
									: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
							}
							${isLastSelected ? 'cursor-not-allowed opacity-75' : ''}
						`}
						aria-pressed={isSelected}
						aria-label={`${t(languageKeys[lang])}${isLastSelected ? ` - ${t('selectAtLeastOne')}` : ''}`}
					>
						<span className="flex flex-col items-center gap-0.5">
							<span>{t(languageKeys[lang])}</span>
							{isSelected && (
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							)}
						</span>
					</button>
				)
			})}
		</div>
	)
}
