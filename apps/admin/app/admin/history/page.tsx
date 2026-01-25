export default function HistoryPage() {
	return (
		<div>
			<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit History</h1>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow">
				<table className="w-full">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
								Date
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
								Content
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
								Field
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
								Editor
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
						<tr>
							<td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No edits yet</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	)
}
