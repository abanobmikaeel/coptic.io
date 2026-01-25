import { BookIcon, CalendarIcon, CodeIcon, GitHubIcon } from '@/components/ui/Icons'
import { API_BASE_URL } from '@/config'
import Link from 'next/link'

export default function DeveloperSection() {
	return (
		<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm dark:shadow-none">
			<div className="mb-8">
				<h2 className="text-sm font-medium text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-2">
					For Developers
				</h2>
				<p className="text-gray-600 dark:text-gray-300 text-lg">
					Build apps with the Coptic calendar API
				</p>
			</div>

			{/* Code example */}
			<div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-8 overflow-x-auto">
				<div className="flex items-center gap-2 mb-4">
					<div className="w-3 h-3 rounded-full bg-red-500/80" />
					<div className="w-3 h-3 rounded-full bg-yellow-500/80" />
					<div className="w-3 h-3 rounded-full bg-green-500/80" />
				</div>
				<pre className="text-sm font-mono">
					<code>
						<span className="text-gray-400">{"// Get today's readings"}</span>
						{'\n'}
						<span className="text-purple-400">const</span>
						<span className="text-gray-300"> response </span>
						<span className="text-purple-400">=</span>
						<span className="text-purple-400"> await </span>
						<span className="text-blue-400">fetch</span>
						<span className="text-gray-300">(</span>
						{'\n'}
						<span className="text-green-400"> &apos;{API_BASE_URL}/readings&apos;</span>
						{'\n'}
						<span className="text-gray-300">);</span>
						{'\n\n'}
						<span className="text-purple-400">const</span>
						<span className="text-gray-300"> readings </span>
						<span className="text-purple-400">=</span>
						<span className="text-purple-400"> await </span>
						<span className="text-gray-300">response.</span>
						<span className="text-blue-400">json</span>
						<span className="text-gray-300">();</span>
					</code>
				</pre>
			</div>

			{/* Features grid */}
			<div className="grid grid-cols-3 gap-6 mb-8">
				<div>
					<div className="text-amber-600 dark:text-amber-500 mb-2">
						<CalendarIcon />
					</div>
					<h3 className="text-gray-900 dark:text-white font-medium mb-1">Calendar</h3>
					<p className="text-gray-500 dark:text-gray-400 text-sm">Feast days & seasons</p>
				</div>

				<div>
					<div className="text-amber-600 dark:text-amber-500 mb-2">
						<BookIcon />
					</div>
					<h3 className="text-gray-900 dark:text-white font-medium mb-1">Readings</h3>
					<p className="text-gray-500 dark:text-gray-400 text-sm">Daily scripture</p>
				</div>

				<div>
					<div className="text-amber-600 dark:text-amber-500 mb-2">
						<CodeIcon />
					</div>
					<h3 className="text-gray-900 dark:text-white font-medium mb-1">REST + GraphQL</h3>
					<p className="text-gray-500 dark:text-gray-400 text-sm">Both supported</p>
				</div>
			</div>

			{/* Actions */}
			<div className="flex gap-3">
				<Link
					href="/docs"
					className="flex-1 bg-amber-700 hover:bg-amber-600 text-white font-medium py-3 px-5 rounded-xl transition-colors text-center text-sm"
				>
					View Documentation
				</Link>
				<a
					href="https://github.com/abanobmikaeel/coptic.io"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-3 px-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-sm"
				>
					<GitHubIcon />
					GitHub
				</a>
			</div>
		</div>
	)
}
