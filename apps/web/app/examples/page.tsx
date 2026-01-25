'use client'

import { API_BASE_URL } from '@/config'
import { useState } from 'react'

interface Example {
	title: string
	description: string
	endpoint: string
	code: string
}

const examples: Example[] = [
	{
		title: "Today's Readings",
		description: 'Get the daily scripture readings from the Katameros',
		endpoint: '/readings',
		code: `const response = await fetch(
  '${API_BASE_URL}/readings'
);
const readings = await response.json();`,
	},
	{
		title: 'Coptic Date',
		description: 'Convert any Gregorian date to the Coptic calendar',
		endpoint: '/calendar/2025-04-20',
		code: `const response = await fetch(
  '${API_BASE_URL}/calendar/2025-04-20'
);
const copticDate = await response.json();
// { day: 12, month: 8, year: 1741, ... }`,
	},
	{
		title: 'Fasting Status',
		description: 'Check if a specific date is a fasting day',
		endpoint: '/fasting/2025-03-15',
		code: `const response = await fetch(
  '${API_BASE_URL}/fasting/2025-03-15'
);
const fasting = await response.json();
// { isFasting: true, fastType: "Great Lent" }`,
	},
	{
		title: 'Upcoming Celebrations',
		description: 'Get feast days for the next N days',
		endpoint: '/celebrations/upcoming/list?days=30',
		code: `const response = await fetch(
  '${API_BASE_URL}/celebrations/upcoming/list?days=30'
);
const celebrations = await response.json();`,
	},
	{
		title: 'Synaxarium Search',
		description: 'Search saint commemorations by name',
		endpoint: '/synaxarium/search/query?q=mary',
		code: `const response = await fetch(
  '${API_BASE_URL}/synaxarium/search/query?q=mary'
);
const saints = await response.json();`,
	},
	{
		title: 'Liturgical Season',
		description: 'Get the current liturgical season',
		endpoint: '/season',
		code: `const response = await fetch(
  '${API_BASE_URL}/season'
);
const season = await response.json();
// { name: "Pentecost", ... }`,
	},
]

export default function ExamplesPage() {
	const [activeExample, setActiveExample] = useState(0)
	const [response, setResponse] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const runExample = async () => {
		setLoading(true)
		setResponse(null)
		try {
			const res = await fetch(`${API_BASE_URL}${examples[activeExample].endpoint}`)
			const data = await res.json()
			setResponse(JSON.stringify(data, null, 2))
		} catch (err) {
			setResponse(`Error: ${err}`)
		}
		setLoading(false)
	}

	return (
		<main className="min-h-screen relative">
			{/* Background */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none">
				<div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/[0.05] rounded-full blur-[100px]" />
			</div>

			<section className="relative pt-20 pb-8 px-6">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">API Examples</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Interactive examples to explore the Coptic Calendar API
					</p>
				</div>
			</section>

			<section className="relative px-6 pb-16">
				<div className="max-w-4xl mx-auto">
					<div className="grid md:grid-cols-[280px_1fr] gap-6">
						{/* Sidebar */}
						<div className="space-y-1">
							{examples.map((example, idx) => (
								<button
									type="button"
									key={idx}
									onClick={() => {
										setActiveExample(idx)
										setResponse(null)
									}}
									className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
										activeExample === idx
											? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
											: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
									}`}
								>
									<p className="font-medium text-[14px]">{example.title}</p>
									<p className="text-[12px] text-gray-500 dark:text-gray-500 mt-0.5">
										{example.description}
									</p>
								</button>
							))}
						</div>

						{/* Main content */}
						<div className="space-y-4">
							{/* Endpoint */}
							<div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
								<p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Endpoint</p>
								<code className="text-amber-600 dark:text-amber-500 text-[14px]">
									GET {examples[activeExample].endpoint}
								</code>
							</div>

							{/* Code */}
							<div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
								<div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-red-500/60" />
										<div className="w-3 h-3 rounded-full bg-yellow-500/60" />
										<div className="w-3 h-3 rounded-full bg-green-500/60" />
									</div>
									<span className="text-[11px] text-gray-500">JavaScript</span>
								</div>
								<pre className="p-4 text-[13px] font-mono text-gray-300 overflow-x-auto">
									<code>{examples[activeExample].code}</code>
								</pre>
							</div>

							{/* Try it */}
							<button
								type="button"
								onClick={runExample}
								disabled={loading}
								className="w-full bg-amber-700 hover:bg-amber-600 disabled:bg-amber-600/50 text-white font-medium py-3 px-5 rounded-xl transition-colors text-[14px]"
							>
								{loading ? 'Loading...' : 'Try it'}
							</button>

							{/* Response */}
							{response && (
								<div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
									<div className="px-4 py-3 border-b border-gray-800">
										<span className="text-[11px] text-gray-500 uppercase tracking-wider">
											Response
										</span>
									</div>
									<pre className="p-4 text-[12px] font-mono text-gray-300 overflow-x-auto max-h-[400px] overflow-y-auto">
										<code>{response}</code>
									</pre>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
