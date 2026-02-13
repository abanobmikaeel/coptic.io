'use client'

import { useContentLanguages } from '@/hooks/useContentLanguages'
import { useReadingSettings } from '@/hooks/useReadingSettings'
import { useState } from 'react'
import { ChevronIcon, SettingsPanel } from './settings'

// Re-export types for backwards compatibility
export type {
	BibleTranslation,
	FontFamily,
	FontWeight,
	LineSpacing,
	PaginatedMode,
	ReadingTheme,
	ReadingWidth,
	SynaxariumViewMode,
	TextSize,
	ThemePreference,
	ViewMode,
	WordSpacing,
} from '@/lib/reading-preferences'

export function DisplaySettings() {
	const { settings, actions, mounted } = useReadingSettings()
	const { languages, setLanguages, isLoaded } = useContentLanguages()
	const [isOpen, setIsOpen] = useState(false)

	if (!mounted || !isLoaded) return null

	return (
		<div className="relative">
			{/* Trigger Button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={`group relative px-4 py-2 rounded-xl transition-all duration-200 ${
					isOpen
						? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
						: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600'
				}`}
				aria-label="Reading settings"
			>
				<div className="flex items-center gap-2">
					<span
						className={`text-lg font-serif ${isOpen ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`}
					>
						Aa
					</span>
					<ChevronIcon isOpen={isOpen} />
				</div>
			</button>

			{isOpen && (
				<SettingsPanel
					settings={settings}
					actions={actions}
					contentLanguages={languages}
					onContentLanguagesChange={setLanguages}
					onClose={() => setIsOpen(false)}
				/>
			)}
		</div>
	)
}
