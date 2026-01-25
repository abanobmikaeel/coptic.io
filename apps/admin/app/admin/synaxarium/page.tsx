'use client'

import { COPTIC_MONTHS } from '@coptic/core'
import { useState } from 'react'

export default function SynaxariumBrowser() {
	const [selectedMonth, setSelectedMonth] = useState<string>(COPTIC_MONTHS[0])
	const [selectedDay, setSelectedDay] = useState<number>(1)
	const [language, setLanguage] = useState<string>('en')

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Synaxarium Browser</h1>
				<select
					value={language}
					onChange={(e) => setLanguage(e.target.value)}
					className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
				>
					<option value="en">English</option>
					<option value="ar">Arabic</option>
				</select>
			</div>

			{/* Date Selector */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
				<div className="flex flex-wrap gap-4">
					<div>
						<label htmlFor="coptic-month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Coptic Month
						</label>
						<select
							id="coptic-month"
							value={selectedMonth}
							onChange={(e) => setSelectedMonth(e.target.value)}
							className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
						>
							{COPTIC_MONTHS.map((month) => (
								<option key={month} value={month}>
									{month}
								</option>
							))}
						</select>
					</div>
					<div>
						<label htmlFor="coptic-day" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Day
						</label>
						<select
							id="coptic-day"
							value={selectedDay}
							onChange={(e) => setSelectedDay(Number(e.target.value))}
							className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
						>
							{Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
								<option key={day} value={day}>
									{day}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Entries List */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow">
				<div className="p-4 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
						{selectedDay} {selectedMonth}
					</h2>
				</div>
				<div className="divide-y divide-gray-200 dark:divide-gray-700">
					{/* Placeholder entries - will be populated from API */}
					<SynaxariumEntry
						name="Feast of El-Nayrouz (Beginning of the Blessed Coptic Year)"
						status="canonical"
						source="copticchurch-net"
					/>
					<SynaxariumEntry
						name="The Martyrdom of St. Bartholomew, the Apostle"
						status="reviewed"
						source="st-takla"
					/>
					<SynaxariumEntry
						name="The Departure of St. Melyos (Milius), the Third Pope of Alexandria"
						status="raw"
						source="suscopts"
					/>
				</div>
			</div>
		</div>
	)
}

function SynaxariumEntry({
	name,
	status,
	source,
}: {
	name: string
	status: 'raw' | 'reviewed' | 'canonical'
	source: string
}) {
	const statusColors = {
		raw: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
		reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		canonical: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
	}

	return (
		<div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Source: {source}</p>
				</div>
				<span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
					{status}
				</span>
			</div>
		</div>
	)
}
