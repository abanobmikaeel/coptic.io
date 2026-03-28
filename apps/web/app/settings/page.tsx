'use client'

import { Breadcrumb } from '@/components/Breadcrumb'
import { SettingRow } from '@/components/settings/SettingRow'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import type { Locale } from '@/i18n/config'
import {
	type FontFamily,
	type FontWeight,
	type LineSpacing,
	type ReadingWidth,
	type TextSize,
	type ThemePreference,
	type ViewMode,
	type WordSpacing,
	loadPreferences as loadStoredPreferences,
	savePreferences as saveStoredPreferences,
} from '@/lib/reading-preferences'
import {
	getFontClass,
	getLineHeightClass,
	getWeightClass,
	getWordSpacingClass,
} from '@/lib/reading-styles'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useState, useTransition } from 'react'
import { SettingsSkeleton } from './SettingsSkeleton'

interface SettingsPreferences {
	size: TextSize
	view: ViewMode
	font: FontFamily
	spacing: LineSpacing
	wordSpacing: WordSpacing
	theme: ThemePreference
	width: ReadingWidth
	weight: FontWeight
	verses: 'show' | 'hide'
}

const DEFAULTS: SettingsPreferences = {
	size: 'md',
	view: 'verse',
	font: 'sans',
	spacing: 'normal',
	wordSpacing: 'normal',
	theme: 'auto',
	width: 'normal',
	weight: 'normal',
	verses: 'show',
}

function loadPreferences(): SettingsPreferences {
	if (typeof window === 'undefined') return DEFAULTS
	const stored = loadStoredPreferences()
	const verses = stored.verses === 'hide' ? 'hide' : 'show'
	return { ...DEFAULTS, ...stored, verses }
}

function savePreferences(prefs: SettingsPreferences) {
	if (typeof window === 'undefined') return
	const { verses, ...rest } = prefs
	saveStoredPreferences({ ...rest, verses: verses === 'hide' ? 'hide' : undefined })
}

const previewTextSize: Record<TextSize, string> = {
	sm: 'text-sm',
	md: 'text-base',
	lg: 'text-lg',
}

function SettingsContent() {
	const router = useRouter()
	const locale = useLocale() as Locale
	const t = useTranslations('settings')
	const [isPending, startTransition] = useTransition()
	const [prefs, setPrefs] = useState<SettingsPreferences>(DEFAULTS)
	const [mounted, setMounted] = useState(false)
	const [saved, setSaved] = useState(false)

	useEffect(() => {
		setPrefs(loadPreferences())
		setMounted(true)
	}, [])

	const handleLocaleChange = (newLocale: string) => {
		document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
		startTransition(() => {
			router.refresh()
		})
	}

	const updatePref = <K extends keyof SettingsPreferences>(
		key: K,
		value: SettingsPreferences[K],
	) => {
		setPrefs((prev) => {
			const next = { ...prev, [key]: value }
			savePreferences(next)
			setSaved(true)
			setTimeout(() => setSaved(false), 2000)
			return next
		})
	}

	if (!mounted) return <SettingsSkeleton />

	return (
		<main className="min-h-screen bg-gray-50 dark:bg-gray-950">
			<section className="pt-6 lg:pt-12 pb-6 px-6">
				<div className="max-w-2xl mx-auto">
					<Breadcrumb items={[{ label: t('title') }]} />
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
						{t('title')}
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mb-8">{t('subtitle')}</p>

					{saved && (
						<div className="mb-6 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-lg">
							{t('saved')}
						</div>
					)}

					<div className="space-y-6">
						<Card>
							<CardHeader>{t('language')}</CardHeader>
							<CardContent>
								<SettingRow label={t('siteLanguage')} description={t('siteLanguageDescription')}>
									<Select
										value={locale}
										onChange={handleLocaleChange}
										disabled={isPending}
										options={[
											{ value: 'en', label: 'English' },
											{ value: 'ar', label: 'العربية' },
											{ value: 'es', label: 'Español' },
										]}
									/>
								</SettingRow>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>{t('appearance')}</CardHeader>
							<CardContent className="space-y-4">
								<SettingRow label={t('theme')} description={t('themeDescription')}>
									<Select
										value={prefs.theme}
										onChange={(v) => updatePref('theme', v as ThemePreference)}
										options={[
											{ value: 'auto', label: t('themeAuto') },
											{ value: 'light', label: t('themeLight') },
											{ value: 'dark', label: t('themeDark') },
											{ value: 'sepia', label: t('themeSepia') },
										]}
									/>
								</SettingRow>
								<SettingRow label={t('contentWidth')} description={t('contentWidthDescription')}>
									<Select
										value={prefs.width}
										onChange={(v) => updatePref('width', v as ReadingWidth)}
										options={[
											{ value: 'narrow', label: t('widthNarrow') },
											{ value: 'normal', label: t('widthNormal') },
											{ value: 'wide', label: t('widthWide') },
										]}
									/>
								</SettingRow>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>{t('typography')}</CardHeader>
							<CardContent className="space-y-4">
								<div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
									<p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
										{t('preview')}
									</p>
									<p
										className={[
											previewTextSize[prefs.size],
											getFontClass(prefs.font, false),
											getWeightClass(prefs.weight, false),
											getLineHeightClass(prefs.spacing, false),
											getWordSpacingClass(prefs.wordSpacing, false),
											'text-gray-800 dark:text-gray-200',
										].join(' ')}
									>
										Blessed are the pure in heart, for they shall see God. The Lord is my shepherd;
										I shall not want.
									</p>
								</div>
								<SettingRow label={t('font')} description={t('fontDescription')}>
									<Select
										value={prefs.font}
										onChange={(v) => updatePref('font', v as FontFamily)}
										options={[
											{ value: 'sans', label: t('fontSans') },
											{ value: 'serif', label: t('fontSerif') },
										]}
									/>
								</SettingRow>
								<SettingRow label={t('textSize')} description={t('textSizeDescription')}>
									<Select
										value={prefs.size}
										onChange={(v) => updatePref('size', v as TextSize)}
										options={[
											{ value: 'sm', label: t('sizeSmall') },
											{ value: 'md', label: t('sizeMedium') },
											{ value: 'lg', label: t('sizeLarge') },
										]}
									/>
								</SettingRow>
								<SettingRow label={t('fontWeight')} description={t('fontWeightDescription')}>
									<Select
										value={prefs.weight}
										onChange={(v) => updatePref('weight', v as FontWeight)}
										options={[
											{ value: 'light', label: t('weightLight') },
											{ value: 'normal', label: t('weightNormal') },
											{ value: 'bold', label: t('weightBold') },
										]}
									/>
								</SettingRow>
								<SettingRow label={t('lineSpacing')} description={t('lineSpacingDescription')}>
									<Select
										value={prefs.spacing}
										onChange={(v) => updatePref('spacing', v as LineSpacing)}
										options={[
											{ value: 'compact', label: t('spacingCompact') },
											{ value: 'normal', label: t('spacingNormal') },
											{ value: 'relaxed', label: t('spacingRelaxed') },
										]}
									/>
								</SettingRow>
								<SettingRow label={t('wordSpacing')} description={t('wordSpacingDescription')}>
									<Select
										value={prefs.wordSpacing}
										onChange={(v) => updatePref('wordSpacing', v as WordSpacing)}
										options={[
											{ value: 'compact', label: t('wordSpacingCompact') },
											{ value: 'normal', label: t('wordSpacingNormal') },
											{ value: 'relaxed', label: t('wordSpacingRelaxed') },
										]}
									/>
								</SettingRow>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>{t('reading')}</CardHeader>
							<CardContent className="space-y-4">
								<SettingRow label={t('viewMode')} description={t('viewModeDescription')}>
									<Select
										value={prefs.view}
										onChange={(v) => updatePref('view', v as ViewMode)}
										options={[
											{ value: 'verse', label: t('viewModeVerse') },
											{ value: 'continuous', label: t('viewModeContinuous') },
										]}
									/>
								</SettingRow>
								<SettingRow label={t('verseNumbers')} description={t('verseNumbersDescription')}>
									<Select
										value={prefs.verses}
										onChange={(v) => updatePref('verses', v as 'show' | 'hide')}
										options={[
											{ value: 'show', label: t('show') },
											{ value: 'hide', label: t('hide') },
										]}
									/>
								</SettingRow>
							</CardContent>
						</Card>

						<button
							type="button"
							onClick={() => {
								setPrefs(DEFAULTS)
								savePreferences(DEFAULTS)
								setSaved(true)
								setTimeout(() => setSaved(false), 2000)
							}}
							className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						>
							{t('resetToDefaults')}
						</button>
					</div>
				</div>
			</section>
		</main>
	)
}

export default function SettingsPage() {
	return (
		<Suspense fallback={<SettingsSkeleton />}>
			<SettingsContent />
		</Suspense>
	)
}
