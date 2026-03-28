'use client'

import { CheckIcon, ChevronLeftIcon } from '@/components/ui/Icons'
import type { Locale } from '@/i18n/config'
import { loadPreferences as load, savePreferences as save } from '@/lib/reading-preferences'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ConfirmLeaveDialog } from './ConfirmLeaveDialog'
import { SettingsCards } from './SettingsCards'
import { SettingsSkeleton } from './SettingsSkeleton'
import { DEFAULTS, type SettingsFormValues } from './types'

function SettingsContent() {
	const router = useRouter()
	const locale = useLocale() as Locale
	const [mounted, setMounted] = useState(false)
	const [saveSuccess, setSaveSuccess] = useState(false)
	const [confirmLeave, setConfirmLeave] = useState(false)
	const pendingNav = useRef<string | null>(null)

	const { control, handleSubmit, reset, watch, formState: { isDirty } } =
		useForm<SettingsFormValues>({ defaultValues: DEFAULTS })

	useEffect(() => {
		const stored = load()
		reset({ ...DEFAULTS, ...stored, verses: stored.verses === 'hide' ? 'hide' : 'show', locale })
		setMounted(true)
	}, [reset, locale])

	useEffect(() => {
		if (!isDirty) return
		const handler = (e: BeforeUnloadEvent) => e.preventDefault()
		window.addEventListener('beforeunload', handler)
		return () => window.removeEventListener('beforeunload', handler)
	}, [isDirty])

	const onSubmit = useCallback((data: SettingsFormValues) => {
		const { verses, locale: newLocale, ...rest } = data
		save({ ...rest, verses: verses === 'hide' ? 'hide' : undefined })
		if (newLocale !== locale) {
			document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
			router.refresh()
		}
		reset(data)
		setSaveSuccess(true)
		setTimeout(() => setSaveSuccess(false), 2500)
	}, [locale, reset, router])

	const guardedNav = useCallback((href: string) => {
		if (isDirty) { pendingNav.current = href; setConfirmLeave(true) }
		else router.push(href)
	}, [isDirty, router])

	const handleLeave = useCallback(() => {
		setConfirmLeave(false)
		if (pendingNav.current) { router.push(pendingNav.current); pendingNav.current = null }
	}, [router])

	if (!mounted) return <SettingsSkeleton />

	return (
		<>
			<ConfirmLeaveDialog open={confirmLeave} onLeave={handleLeave} onStay={() => setConfirmLeave(false)} />
			<main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-28">
				<div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
					<div className="max-w-2xl mx-auto px-6 py-5">
						<button type="button" onClick={() => guardedNav('/')} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors mb-3">
							<ChevronLeftIcon className="w-3.5 h-3.5" /> Back
						</button>
						<div className="flex items-start justify-between gap-4">
							<div>
								<h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
								<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Saved to this device</p>
							</div>
							{saveSuccess && (
								<span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium mt-1 shrink-0">
									<CheckIcon className="w-4 h-4" /> Saved
								</span>
							)}
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<SettingsCards control={control} prefs={watch()} />

					<div className="max-w-2xl mx-auto px-6 pb-4">
						<button type="button" onClick={() => reset(DEFAULTS)} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
							Reset to defaults
						</button>
					</div>

					<div className={`fixed bottom-0 inset-x-0 z-50 transition-transform duration-200 ${isDirty ? 'translate-y-0' : 'translate-y-full'}`}>
						<div className="border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
							<div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
								<p className="text-sm text-gray-600 dark:text-gray-400">You have unsaved changes</p>
								<div className="flex items-center gap-3">
									<button type="button" onClick={() => reset(DEFAULTS)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
										Discard
									</button>
									<button type="submit" className="px-5 py-2 text-sm font-semibold bg-amber-700 hover:bg-amber-600 text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900">
										Save changes
									</button>
								</div>
							</div>
						</div>
					</div>
				</form>
			</main>
		</>
	)
}

export default function SettingsPage() {
	return <Suspense fallback={<SettingsSkeleton />}><SettingsContent /></Suspense>
}
