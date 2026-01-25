export default function TranslationsPage() {
	return (
		<div>
			<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
				Missing Translations
			</h1>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow">
				<div className="p-4 border-b border-gray-200 dark:border-gray-700">
					<p className="text-gray-600 dark:text-gray-400">
						Entries that exist in English but are missing in other languages.
					</p>
				</div>
				<table className="w-full">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
								Date
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
								Entry
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
								Missing In
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
						<tr>
							<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">1 Tout</td>
							<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
								Feast of El-Nayrouz
							</td>
							<td className="px-4 py-3">
								<span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
									Arabic
								</span>
							</td>
							<td className="px-4 py-3">
								<button type="button" className="text-sm text-blue-600 hover:underline">Add Translation</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	)
}
