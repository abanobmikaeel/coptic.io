'use client'

import type { ContentLanguage } from '@/i18n/content-languages'
import type { ReadingTheme } from '@/lib/reading-preferences'
import { themeClasses } from '@/lib/reading-styles'
import { LanguagePills } from './LanguagePills'

interface SettingsPanelProps {
	theme: ReadingTheme
	contentLanguages: ContentLanguage[]
	onContentLanguagesChange: (languages: ContentLanguage[]) => void
	onClose: () => void
}

export function SettingsPanel({
	theme,
	contentLanguages,
	onContentLanguagesChange,
	onClose,
}: SettingsPanelProps) {
	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-40"
				onClick={onClose}
				onKeyDown={(e) => e.key === 'Escape' && onClose()}
				role="button"
				tabIndex={-1}
				aria-label="Close language picker"
			/>

			{/* Panel */}
			<div
				className={`absolute top-full mt-3 right-0 z-50 w-72 p-4 rounded-2xl border shadow-2xl ${themeClasses.settingsPanel[theme]} ${themeClasses.settingsText[theme]}`}
			>
				<p
					className={`text-xs font-semibold uppercase tracking-wider mb-3 ${themeClasses.settingsLabel[theme]}`}
				>
					Display Languages
				</p>
				<LanguagePills
					selected={contentLanguages}
					onChange={onContentLanguagesChange}
					theme={theme}
				/>
			</div>
		</>
	)
}
