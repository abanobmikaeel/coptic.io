import { useState } from 'react'
import CodeExample from '../components/CodeExample'

export default function Landing() {
	const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

	const [calendarTab, setCalendarTab] = useState<'today' | 'custom'>('today')
	const [todayData, setTodayData] = useState(null)
	const [customData, setCustomData] = useState(null)
	const [readingsData, setReadingsData] = useState(null)

	const fetchData = async (endpoint: string, setter: React.Dispatch<any>) => {
		try {
			const response = await fetch(`${baseUrl}/${endpoint}`)
			const data = await response.json()
			setter(data)
		} catch (error) {
			console.error(error)
		}
	}

	const handleFetchToday = () => fetchData('calendar', setTodayData)
	const handleFetchCustomDate = () =>
		fetchData('calendar/2023-05-04', setCustomData)
	const handleFetchReadings = () => fetchData('readings', setReadingsData)

	return (
		<div className="container mx-auto px-4">
			<section>
				<div className="space-y-6">
					<h2 className="text-2xl font-bold text-gray-200 mt-8 font-playfair">
						Modern Library for Coptic Metadata
					</h2>
					<h4 className="text-lg text-gray-400 font-inter">
						coptic.io provides a simple and consistent toolset for fetching
						Coptic readings and calendar details in &amp; Node.js.
					</h4>
				</div>
			</section>
			<section>
				<div className="flex flex-col items-center space-y-8"></div>
				<div className="pt-8">
					<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors outline outline-blue-400 outline-offset-2">
						View Documentation
					</button>
				</div>
				<div className="flex py-4 justify-center space-x-6">
					<a
						href="https://github.com/abanobmikaeel/coptic.io"
						className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 transition-colors"
					>
						<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
							<path
								fillRule="evenodd"
								d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
								clipRule="evenodd"
							/>
						</svg>
						<span>Star it on GitHub</span>
					</a>
					<a
						href="https://discord.gg/yourinvite"
						className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 transition-colors"
					>
						<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
							<path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 00-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 00-5.487 0 12.36 12.36 0 00-.617-1.23A.077.077 0 008.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 00-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 00.031.055 20.03 20.03 0 005.993 2.98.078.078 0 00.084-.026 13.83 13.83 0 001.226-1.963.074.074 0 00-.041-.104 13.201 13.201 0 01-1.872-.878.075.075 0 01-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 01.078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 01.079.009c.12.098.245.195.372.288a.075.075 0 01-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 00-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 00.084.028 19.963 19.963 0 006.002-2.981.076.076 0 00.032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 00-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
						</svg>
						<span>Join the Community</span>
					</a>
				</div>
			</section>

			<div className="pt-12 max-w-7xl mx-auto">
				<div className="w-full h-px bg-gray-700 mb-12"></div>
			</div>

			<section className="space-y-6">
				<h2 className="text-2xl font-bold text-gray-200 mb-4">
					Calendar Examples
				</h2>
				{/* Tabs */}
				<div className="flex space-x-4">
					<button
						className={`${
							calendarTab === 'today'
								? 'bg-blue-600 text-white'
								: 'bg-gray-700 text-gray-200'
						} px-4 py-2 rounded`}
						onClick={() => setCalendarTab('today')}
					>
						Today
					</button>
					<button
						className={`${
							calendarTab === 'custom'
								? 'bg-blue-600 text-white'
								: 'bg-gray-700 text-gray-200'
						} px-4 py-2 rounded`}
						onClick={() => setCalendarTab('custom')}
					>
						Custom Date
					</button>
				</div>

				{/* Calendar Actions */}
				{calendarTab === 'today' && (
					<div>
						<button
							className="bg-blue-600 text-white px-4 py-2 rounded mr-4"
							onClick={handleFetchToday}
						>
							Fetch Today's Date
						</button>
						{todayData && <CodeExample data={todayData} />}
					</div>
				)}
				{calendarTab === 'custom' && (
					<div>
						<button
							className="bg-blue-600 text-white px-4 py-2 rounded mr-4"
							onClick={handleFetchCustomDate}
						>
							Fetch Custom Date
						</button>
						{customData && <CodeExample data={customData} />}
					</div>
				)}
			</section>

			{/* Readings Section */}
			<section className="space-y-6">
				<h2 className="text-2xl font-bold text-gray-200 mb-4">
					Readings Example
				</h2>
				<button
					className="bg-blue-600 text-white px-4 py-2 rounded mr-4"
					onClick={handleFetchReadings}
				>
					Fetch Readings
				</button>
				{readingsData && <CodeExample data={readingsData} />}
			</section>
		</div>
	)
}
