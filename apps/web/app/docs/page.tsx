import { API_BASE_URL } from '@/config'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'API Documentation',
	description:
		'Complete REST and GraphQL API documentation for the Coptic Calendar. Access calendar conversions, daily readings, fasting status, celebrations, and synaxarium data.',
	openGraph: {
		title: 'API Documentation | Coptic Calendar',
		description: 'Complete REST and GraphQL API documentation for the Coptic Calendar.',
	},
}

interface Endpoint {
	method: string
	path: string
	description: string
	params?: string
}

interface EndpointGroup {
	title: string
	description: string
	endpoints: Endpoint[]
}

const endpointGroups: EndpointGroup[] = [
	{
		title: 'Calendar',
		description: 'Convert dates between Gregorian and Coptic calendars',
		endpoints: [
			{ method: 'GET', path: '/calendar', description: "Get today's Coptic date" },
			{
				method: 'GET',
				path: '/calendar/:date',
				description: 'Convert a specific date to Coptic',
				params: 'date: YYYY-MM-DD',
			},
			{ method: 'GET', path: '/calendar/ical/:year', description: 'Get iCalendar feed for a year' },
			{
				method: 'GET',
				path: '/calendar/ical/subscribe',
				description: 'Subscribe to live iCal feed',
			},
		],
	},
	{
		title: 'Readings',
		description: 'Daily scripture readings from the Katameros',
		endpoints: [
			{ method: 'GET', path: '/readings', description: "Get today's readings" },
			{
				method: 'GET',
				path: '/readings/:date',
				description: 'Get readings for a specific date',
				params: 'date: YYYY-MM-DD',
			},
			{
				method: 'GET',
				path: '/readings/:date?detailed=true',
				description: 'Get readings with full verse text',
			},
		],
	},
	{
		title: 'Celebrations',
		description: 'Feast days and celebrations',
		endpoints: [
			{ method: 'GET', path: '/celebrations', description: 'List all celebrations' },
			{
				method: 'GET',
				path: '/celebrations/:date',
				description: 'Get celebrations for a specific date',
			},
			{
				method: 'GET',
				path: '/celebrations/upcoming/list',
				description: 'Get upcoming celebrations',
				params: 'days: number (default: 30)',
			},
		],
	},
	{
		title: 'Fasting',
		description: 'Fasting periods and status',
		endpoints: [
			{ method: 'GET', path: '/fasting/:date', description: 'Check if a date is a fasting day' },
			{
				method: 'GET',
				path: '/fasting/calendar/:year',
				description: 'Get full year fasting calendar',
			},
		],
	},
	{
		title: 'Seasons',
		description: 'Liturgical seasons',
		endpoints: [
			{ method: 'GET', path: '/season', description: "Get today's liturgical season" },
			{ method: 'GET', path: '/season/:date', description: 'Get season for a specific date' },
			{ method: 'GET', path: '/season/year/:year', description: 'Get all seasons for a year' },
		],
	},
	{
		title: 'Synaxarium',
		description: 'Saint commemorations',
		endpoints: [
			{ method: 'GET', path: '/synaxarium/:date', description: 'Get saints for a specific date' },
			{
				method: 'GET',
				path: '/synaxarium/search/query',
				description: 'Search saints by name',
				params: 'q: search term',
			},
		],
	},
]

export default function DocsPage() {
	return (
		<main className="min-h-screen relative">
			{/* Background */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none">
				<div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/[0.05] rounded-full blur-[100px]" />
			</div>

			<section className="relative pt-20 pb-8 px-6">
				<div className="max-w-5xl mx-auto">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						API Documentation
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						The Coptic Calendar API provides access to liturgical data via REST and GraphQL.
					</p>

					<div className="flex gap-3 mb-8">
						<div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2">
							<p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Base URL</p>
							<code className="text-amber-600 dark:text-amber-500 text-[13px]">{API_BASE_URL}</code>
						</div>
						<a
							href={`${API_BASE_URL.replace('/api', '')}/graphql`}
							target="_blank"
							rel="noopener noreferrer"
							className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
						>
							<p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">GraphQL</p>
							<code className="text-purple-600 dark:text-purple-400 text-[13px]">/graphql</code>
						</a>
					</div>
				</div>
			</section>

			<section className="relative px-6 pb-16">
				<div className="max-w-5xl mx-auto space-y-8">
					{endpointGroups.map((group, idx) => (
						<div
							key={idx}
							className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm dark:shadow-none"
						>
							<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
								<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
									{group.title}
								</h2>
								<p className="text-[13px] text-gray-500">{group.description}</p>
							</div>
							<div className="divide-y divide-gray-100 dark:divide-gray-800">
								{group.endpoints.map((endpoint, eidx) => (
									<div
										key={eidx}
										className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
									>
										<div className="flex items-start gap-3">
											<span className="text-[11px] font-mono bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
												{endpoint.method}
											</span>
											<div className="flex-1 min-w-0">
												<code className="text-[13px] text-gray-900 dark:text-white font-mono">
													{endpoint.path}
												</code>
												<p className="text-[13px] text-gray-500 mt-1">{endpoint.description}</p>
												{endpoint.params && (
													<p className="text-[12px] text-gray-500 mt-1">
														Params:{' '}
														<code className="text-gray-600 dark:text-gray-400">
															{endpoint.params}
														</code>
													</p>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}

					{/* Quick links */}
					<div className="flex gap-4 pt-4">
						<Link
							href="/examples"
							className="text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400 text-[14px] transition-colors"
						>
							Try interactive examples →
						</Link>
						<a
							href={`${API_BASE_URL.replace('/api', '')}/openapi.json`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-600 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-400 text-[14px] transition-colors"
						>
							OpenAPI Spec
						</a>
					</div>
				</div>
			</section>
		</main>
	)
}
