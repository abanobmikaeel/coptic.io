'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import {
	getFontClass,
	getLineHeightClass,
	getWeightClass,
	getWordSpacingClass,
} from '@/lib/reading-styles'
import { useTranslations } from 'next-intl'
import type { Control } from 'react-hook-form'
import { AppThemeToggle } from './AppThemeToggle'
import { FormSelect } from './FormSelect'
import type { SettingsFormValues } from './types'

const previewSize: Record<string, string> = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' }

export function SettingsCards({
	control,
	prefs,
}: { control: Control<SettingsFormValues>; prefs: SettingsFormValues }) {
	const t = useTranslations('settings')

	return (
		<div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
			<Card>
				<CardHeader>Appearance</CardHeader>
				<CardContent>
					<AppThemeToggle />
					<FormSelect control={control} name="theme" label={t('theme')} description={t('themeDescription')} options={[
						{ value: 'auto', label: t('themeAuto') },
						{ value: 'light', label: t('themeLight') },
						{ value: 'dark', label: t('themeDark') },
						{ value: 'sepia', label: t('themeSepia') },
					]} />
					<FormSelect control={control} name="width" label={t('contentWidth')} description={t('contentWidthDescription')} options={[
						{ value: 'narrow', label: t('widthNarrow') },
						{ value: 'normal', label: t('widthNormal') },
						{ value: 'wide', label: t('widthWide') },
					]} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>{t('language')}</CardHeader>
				<CardContent>
					<FormSelect control={control} name="locale" label={t('siteLanguage')} description={t('siteLanguageDescription')} options={[
						{ value: 'en', label: 'English' },
						{ value: 'ar', label: 'العربية' },
						{ value: 'es', label: 'Español' },
					]} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>{t('typography')}</CardHeader>
				<CardContent>
					<div className="mb-1 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
						<p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2.5 font-medium">{t('preview')}</p>
						<p className={[previewSize[prefs.size], getFontClass(prefs.font, false), getWeightClass(prefs.weight, false), getLineHeightClass(prefs.spacing, false), getWordSpacingClass(prefs.wordSpacing, false), 'text-gray-800 dark:text-gray-200'].join(' ')}>
							Blessed are the pure in heart, for they shall see God. The Lord is my shepherd; I shall not want.
						</p>
					</div>
					<FormSelect control={control} name="font" label={t('font')} description={t('fontDescription')} options={[
						{ value: 'sans', label: t('fontSans') },
						{ value: 'serif', label: t('fontSerif') },
					]} />
					<FormSelect control={control} name="size" label={t('textSize')} description={t('textSizeDescription')} options={[
						{ value: 'sm', label: t('sizeSmall') },
						{ value: 'md', label: t('sizeMedium') },
						{ value: 'lg', label: t('sizeLarge') },
					]} />
					<FormSelect control={control} name="weight" label={t('fontWeight')} description={t('fontWeightDescription')} options={[
						{ value: 'light', label: t('weightLight') },
						{ value: 'normal', label: t('weightNormal') },
						{ value: 'bold', label: t('weightBold') },
					]} />
					<FormSelect control={control} name="spacing" label={t('lineSpacing')} description={t('lineSpacingDescription')} options={[
						{ value: 'compact', label: t('spacingCompact') },
						{ value: 'normal', label: t('spacingNormal') },
						{ value: 'relaxed', label: t('spacingRelaxed') },
					]} />
					<FormSelect control={control} name="wordSpacing" label={t('wordSpacing')} description={t('wordSpacingDescription')} options={[
						{ value: 'compact', label: t('wordSpacingCompact') },
						{ value: 'normal', label: t('wordSpacingNormal') },
						{ value: 'relaxed', label: t('wordSpacingRelaxed') },
					]} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>{t('reading')}</CardHeader>
				<CardContent>
					<FormSelect control={control} name="view" label={t('viewMode')} description={t('viewModeDescription')} options={[
						{ value: 'verse', label: t('viewModeVerse') },
						{ value: 'continuous', label: t('viewModeContinuous') },
					]} />
					<FormSelect control={control} name="verses" label={t('verseNumbers')} description={t('verseNumbersDescription')} options={[
						{ value: 'show', label: t('show') },
						{ value: 'hide', label: t('hide') },
					]} />
				</CardContent>
			</Card>
		</div>
	)
}
