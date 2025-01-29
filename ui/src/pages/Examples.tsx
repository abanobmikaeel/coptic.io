import { useState, Dispatch, FC } from 'react'
import CodeExample from '../components/CodeExample'

const Examples: FC = () => {
	const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

	const [calendarTab, setCalendarTab] = useState<'today' | 'custom'>('today')
	const [todayData, setTodayData] = useState(null)
	const [customData, setCustomData] = useState(null)
	const [readingsData, setReadingsData] = useState(null)

	const fetchData = async (endpoint: string, setter: Dispatch<any>) => {
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
		// <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
		<div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
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

export default Examples
