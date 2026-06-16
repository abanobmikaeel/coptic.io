'use client'

import { SettingSection } from '@/components/settings'
import {
	DEFAULT_ROLLOVER_HOUR,
	ROLLOVER_OFF,
	getRolloverHour,
	setRolloverHour,
} from '@/lib/rollover'
import { useLocale } from 'next-intl'
import { useMemo, useState } from 'react'

// Noon through late evening covers every realistic Vespers schedule.
const HOUR_CHOICES = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

// When, in the user's local time, the default Vespers date switches to the next
// liturgical day. Stored per device; takes effect the next time the page opens
// without an explicit date.
export function RolloverHourSetting() {
	const locale = useLocale()
	const [hour, setHour] = useState(getRolloverHour)

	const hourFormat = useMemo(() => new Intl.DateTimeFormat(locale, { hour: 'numeric' }), [locale])
	const formatHour = (h: number) => hourFormat.format(new Date(2000, 0, 1, h))

	const onChange = (value: string) => {
		const next = Number(value)
		setHour(next)
		setRolloverHour(next)
	}

	return (
		<SettingSection label="Next-day switch">
			<select
				value={hour}
				onChange={(e) => onChange(e.target.value)}
				className="w-full px-3 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 focus:outline-none focus:ring-2 focus:ring-amber-500"
			>
				{HOUR_CHOICES.map((h) => (
					<option key={h} value={h}>
						{formatHour(h)}
						{h === DEFAULT_ROLLOVER_HOUR ? ' (default)' : ''}
					</option>
				))}
				<option value={ROLLOVER_OFF}>Never</option>
			</select>
			<p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
				After this time, Vespers opens to the next day's service.
			</p>
		</SettingSection>
	)
}
