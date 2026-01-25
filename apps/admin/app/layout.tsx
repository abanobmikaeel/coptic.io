import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
	title: 'Coptic.io Admin',
	description: 'Content management for Coptic.io',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-gray-50 dark:bg-gray-900">
				<div className="flex h-screen">
					{/* Sidebar */}
					<aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
						<div className="p-4 border-b border-gray-200 dark:border-gray-700">
							<h1 className="text-xl font-bold text-gray-900 dark:text-white">Coptic.io Admin</h1>
						</div>
						<nav className="p-4">
							<ul className="space-y-2">
								<li>
									<a
										href="/admin"
										className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
									>
										Dashboard
									</a>
								</li>
								<li>
									<a
										href="/admin/synaxarium"
										className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
									>
										Synaxarium
									</a>
								</li>
								<li>
									<a
										href="/admin/synaxarium/compare"
										className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
									>
										Compare Sources
									</a>
								</li>
								<li>
									<a
										href="/admin/translations"
										className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
									>
										Translations
									</a>
								</li>
								<li>
									<a
										href="/admin/history"
										className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
									>
										Edit History
									</a>
								</li>
							</ul>
						</nav>
					</aside>

					{/* Main content */}
					<main className="flex-1 overflow-auto">
						<div className="p-8">{children}</div>
					</main>
				</div>
			</body>
		</html>
	)
}
