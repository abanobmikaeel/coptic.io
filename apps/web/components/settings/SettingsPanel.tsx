'use client'

import type { ReadingSettings, ReadingSettingsActions } from '@/hooks/useReadingSettings'
import { LineSpacingCompactIcon, LineSpacingNormalIcon, LineSpacingRelaxedIcon, WidthIcon, WordSpacingIcon } from './icons'
import { SegmentedButtons } from './SegmentedButtons'
import { SettingSection } from './SettingSection'
import { ThemePicker } from './ThemePicker'
import { ToggleSwitch } from './ToggleSwitch'

interface SettingsPanelProps {
	settings: ReadingSettings
	actions: ReadingSettingsActions
	onClose: () => void
}

export function SettingsPanel({ settings, actions, onClose }: SettingsPanelProps) {
	const { translation, fontFamily, textSize, weight, lineSpacing, wordSpacing, width, viewMode, showVerses, theme, isAutoTheme } = settings

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-40"
				onClick={onClose}
				onKeyDown={(e) => e.key === 'Escape' && onClose()}
				role="button"
				tabIndex={-1}
				aria-label="Close settings"
			/>

			{/* Panel */}
			<div className="absolute top-full mt-3 right-0 z-50 w-80 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl max-h-[85vh] overflow-y-auto">
				{/* Theme */}
				<SettingSection label="Theme">
					<ThemePicker value={theme} isAuto={isAutoTheme} onChange={actions.setTheme} />
				</SettingSection>

				{/* Reading Language */}
				<SettingSection label="Reading Language">
					<SegmentedButtons
						value={translation}
						onChange={actions.setTranslation}
						options={[
							{ value: 'en', label: 'English' },
							{ value: 'ar', label: 'العربية', className: 'font-arabic' },
						]}
					/>
				</SettingSection>

				{/* Font Family - only for English */}
				{translation === 'en' && (
					<SettingSection label="Font">
						<SegmentedButtons
							value={fontFamily}
							onChange={actions.setFontFamily}
							className="gap-1"
							options={[
								{
									value: 'sans',
									icon: (
										<div className="flex flex-col items-center gap-1 py-0.5">
											<span className="text-2xl font-sans">Ag</span>
											<span className="text-[10px] uppercase tracking-wide">Sans</span>
										</div>
									),
								},
								{
									value: 'serif',
									icon: (
										<div className="flex flex-col items-center gap-1 py-0.5">
											<span className="text-2xl" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
												Ag
											</span>
											<span className="text-[10px] uppercase tracking-wide">Serif</span>
										</div>
									),
								},
							]}
						/>
					</SettingSection>
				)}

				{/* Text Size */}
				<SettingSection label="Text Size">
					<SegmentedButtons
						value={textSize}
						onChange={actions.setTextSize}
						options={[
							{ value: 'sm', icon: <span className="text-sm font-medium">A</span> },
							{ value: 'md', icon: <span className="text-lg font-medium">A</span> },
							{ value: 'lg', icon: <span className="text-2xl font-medium">A</span> },
						]}
					/>
				</SettingSection>

				{/* Font Weight */}
				<SettingSection label="Font Weight">
					<SegmentedButtons
						value={weight}
						onChange={actions.setWeight}
						options={[
							{ value: 'light', icon: <span className="font-light text-sm">Light</span> },
							{ value: 'normal', icon: <span className="font-normal text-sm">Normal</span> },
							{ value: 'bold', icon: <span className="font-semibold text-sm">Bold</span> },
						]}
					/>
				</SettingSection>

				{/* Line Spacing */}
				<SettingSection label="Line Spacing">
					<SegmentedButtons
						value={lineSpacing}
						onChange={actions.setLineSpacing}
						options={[
							{ value: 'compact', icon: <LineSpacingCompactIcon /> },
							{ value: 'normal', icon: <LineSpacingNormalIcon /> },
							{ value: 'relaxed', icon: <LineSpacingRelaxedIcon /> },
						]}
					/>
				</SettingSection>

				{/* Word Spacing - only for English */}
				{translation === 'en' && (
					<SettingSection label="Word Spacing">
						<SegmentedButtons
							value={wordSpacing}
							onChange={actions.setWordSpacing}
							options={[
								{ value: 'compact', icon: <WordSpacingIcon gap="compact" /> },
								{ value: 'normal', icon: <WordSpacingIcon gap="normal" /> },
								{ value: 'relaxed', icon: <WordSpacingIcon gap="relaxed" /> },
							]}
						/>
					</SettingSection>
				)}

				{/* Reading Width */}
				<SettingSection label="Reading Width">
					<SegmentedButtons
						value={width}
						onChange={actions.setWidth}
						options={[
							{ value: 'narrow', icon: <WidthIcon width={16} /> },
							{ value: 'normal', icon: <WidthIcon width={24} /> },
							{ value: 'wide', icon: <WidthIcon width={32} /> },
						]}
					/>
				</SettingSection>

				{/* View Mode */}
				<SettingSection label="View Mode">
					<SegmentedButtons
						value={viewMode}
						onChange={actions.setViewMode}
						options={[
							{ value: 'verse', label: 'Study' },
							{ value: 'continuous', label: 'Reading' },
						]}
					/>
				</SettingSection>

				{/* Divider */}
				<div className="border-t border-gray-100 dark:border-gray-800 my-4" />

				{/* Verse Numbers Toggle */}
				<ToggleSwitch label="Verse Numbers" checked={showVerses} onChange={() => actions.setShowVerses(!showVerses)} />
			</div>
		</>
	)
}
