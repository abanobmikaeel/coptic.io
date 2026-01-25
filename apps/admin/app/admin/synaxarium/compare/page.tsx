'use client'

import { useState } from 'react'
import { COPTIC_MONTHS } from '@coptic/core'

export default function CompareSourcesPage() {
	const [selectedMonth, setSelectedMonth] = useState<string>(COPTIC_MONTHS[0])
	const [selectedDay, setSelectedDay] = useState<number>(1)
	const [leftSource, setLeftSource] = useState<string>('st-takla')
	const [rightSource, setRightSource] = useState<string>('suscopts')

	return (
		<div>
			<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
				Compare Sources
			</h1>

			{/* Controls */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
				<div className="flex flex-wrap gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Coptic Month
						</label>
						<select
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
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Day
						</label>
						<select
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
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Left Source
						</label>
						<select
							value={leftSource}
							onChange={(e) => setLeftSource(e.target.value)}
							className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
						>
							<option value="st-takla">St. Takla</option>
							<option value="suscopts">SusCopts</option>
							<option value="canonical">Canonical</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Right Source
						</label>
						<select
							value={rightSource}
							onChange={(e) => setRightSource(e.target.value)}
							className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
						>
							<option value="st-takla">St. Takla</option>
							<option value="suscopts">SusCopts</option>
							<option value="canonical">Canonical</option>
						</select>
					</div>
				</div>
			</div>

			{/* Side-by-side comparison */}
			<div className="grid grid-cols-2 gap-6">
				<SourcePanel source={leftSource} date={`${selectedDay} ${selectedMonth}`} />
				<SourcePanel source={rightSource} date={`${selectedDay} ${selectedMonth}`} />
			</div>
		</div>
	)
}

function SourcePanel({ source, date }: { source: string; date: string }) {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow">
			<div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
					{source.replace('-', ' ')}
				</h2>
				<span className="text-sm text-gray-500 dark:text-gray-400">{date}</span>
			</div>
			<div className="p-4 space-y-4">
				{/* Placeholder content */}
				<div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
					<h3 className="font-medium text-gray-900 dark:text-white mb-2">
						Feast of El-Nayrouz
					</h3>
					<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
						Today is the beginning of the blessed Coptic year. It is necessary to keep
						it a holy day with full purity and chastity...
					</p>
					<div className="mt-3 flex gap-2">
						<button
							type="button"
							className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
						>
							View Full
						</button>
						<button
							type="button"
							className="px-3 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800"
						>
							Use This Version
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
