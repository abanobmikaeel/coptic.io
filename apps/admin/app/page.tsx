export default function AdminDashboard() {
	return (
		<div>
			<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<DashboardCard
					title="Synaxarium Entries"
					value="1,200+"
					description="Total entries across all languages"
				/>
				<DashboardCard title="Languages" value="3" description="English, Arabic, Coptic" />
				<DashboardCard title="Sources" value="2" description="St. Takla, SusCopts" />
				<DashboardCard title="Pending Reviews" value="0" description="Entries awaiting review" />
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
				<div className="flex flex-wrap gap-4">
					<a
						href="/admin/synaxarium"
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Browse Synaxarium
					</a>
					<a
						href="/admin/synaxarium/compare"
						className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
					>
						Compare Sources
					</a>
					<a
						href="/admin/translations"
						className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
					>
						View Missing Translations
					</a>
				</div>
			</div>
		</div>
	)
}

function DashboardCard({
	title,
	value,
	description,
}: {
	title: string
	value: string
	description: string
}) {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
			<p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
			<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
		</div>
	)
}
