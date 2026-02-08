'use client'

import type { ContentLanguage } from '@/i18n/content-languages'
import { useTranslations } from 'next-intl'

interface LanguagePillsProps {
	selected: ContentLanguage[]
	onChange: (languages: ContentLanguage[]) => void
}

// Only show languages that have API support for now
// Coptic will be added when the API supports it
const displayLanguages: ContentLanguage[] = ['en', 'ar', 'es']

const languageKeys: Record<ContentLanguage, string> = {
	cop: 'coptic',
	en: 'english',
	ar: 'arabic',
	es: 'spanish',
}

export function LanguagePills({ selected, onChange }: LanguagePillsProps) {
	const t = useTranslations('contentLanguages')

	const handleToggle = (lang: ContentLanguage) => {
		if (selected.includes(lang)) {
			// Prevent deselecting the last language
			if (selected.length === 1) return
			onChange(selected.filter((l) => l !== lang))
		} else {
			onChange([...selected, lang])
		}
	}

	return (
		<div className="flex gap-2">
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
							flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
							${lang === 'ar' ? 'font-arabic' : ''}
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
