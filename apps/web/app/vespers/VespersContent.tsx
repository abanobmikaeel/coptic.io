'use client'

import { CommemorationPicker } from '@/components/CommemorationPicker'
import {
	LiturgicalServiceReader,
	ServiceReaderFallback,
} from '@/components/LiturgicalServiceReader'
import { RolloverHourSetting } from '@/components/RolloverHourSetting'
import type { BibleTranslation } from '@/components/ScriptureReading/types'
import { getRolloverHour } from '@/lib/rollover'
import type { IncenseService } from '@/lib/types'
import { getAdjacentDate, getTodayDateString } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export type { IncenseService }
export const VespersFallback = ServiceReaderFallback

interface VespersContentProps {
	servicesByLang: Partial<Record<string, IncenseService>>
	langs: BibleTranslation[]
	availableLanguages: BibleTranslation[]
	date?: string
	commemorations?: string[]
	notice?: string
}

export function VespersContent({
	servicesByLang,
	langs,
	availableLanguages,
	date,
	commemorations,
	notice,
}: VespersContentProps) {
	const router = useRouter()

	// No explicit ?date= — the server guessed from its own clock. Correct it to the user's
	// local liturgical day: their calendar date, advanced by one after the rollover hour
	// (a per-device setting, default 16:00). Date navigation always writes an explicit
	// ?date=, so this fires only on fresh entry.
	useEffect(() => {
		if (date) return
		const liturgicalDay =
			new Date().getHours() >= getRolloverHour()
				? getAdjacentDate(undefined, 1)
				: getTodayDateString()
		const served = Object.values(servicesByLang)[0]?.date
		if (served && served !== liturgicalDay) router.replace(`/vespers?date=${liturgicalDay}`)
	}, [date, servicesByLang, router])

	return (
		<LiturgicalServiceReader
			title="Vespers"
			basePath="/vespers"
			servicesByLang={servicesByLang}
			langs={langs}
			availableLanguages={availableLanguages}
			notice={notice}
			settingsExtra={
				<>
					<CommemorationPicker selected={commemorations ?? []} />
					<RolloverHourSetting />
				</>
			}
		/>
	)
}
