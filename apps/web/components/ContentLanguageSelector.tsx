'use client'

import { useContentLanguages } from '@/hooks/useContentLanguages'
import { type ContentLanguage, contentLanguages } from '@/i18n/content-languages'
import { useTranslations } from 'next-intl'

interface ContentLanguageSelectorProps {
	className?: string
}

export function ContentLanguageSelector({ className = '' }: ContentLanguageSelectorProps) {
	const t = useTranslations('contentLanguages')
	const { languages, toggleLanguage, isLoaded } = useContentLanguages()

	if (!isLoaded) {
		return (
			<div className={`animate-pulse ${className}`}>
				<div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
				<div className="flex gap-2">
					{[1, 2, 3].map((i) => (
						<div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
					))}
				</div>
			</div>
		)
	}

	const languageKeys: Record<ContentLanguage, string> = {
		cop: 'coptic',
		ar: 'arabic',
		en: 'english',
		es: 'spanish',
	}

	return (
		<div className={className}>
			<h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
				{t('title')}
			</h3>
			<p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
				{t('description')}
			</p>
			<div className="flex flex-wrap gap-2">
				{contentLanguages.map((lang) => {
					const isSelected = languages.includes(lang)
					const isOnlySelected = isSelected && languages.length === 1

					return (
						<button
							key={lang}
							type="button"
							onClick={() => !isOnlySelected && toggleLanguage(lang)}
							disabled={isOnlySelected}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
								isSelected
									? 'bg-amber-700 text-white'
									: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
							} ${isOnlySelected ? 'opacity-50 cursor-not-allowed' : ''}`}
							title={isOnlySelected ? t('selectAtLeastOne') : undefined}
						>
							{t(languageKeys[lang])}
						</button>
					)
				})}
			</div>
		</div>
	)
}
