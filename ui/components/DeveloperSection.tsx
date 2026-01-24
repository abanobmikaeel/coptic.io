import Link from "next/link";

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
						<span className="text-gray-500">// Get today&apos;s readings</span>
						{"\n"}
						<span className="text-purple-400">const</span>
						<span className="text-gray-300"> response </span>
						<span className="text-purple-400">=</span>
						<span className="text-purple-400"> await </span>
						<span className="text-blue-400">fetch</span>
						<span className="text-gray-300">(</span>
						{"\n"}
						<span className="text-green-400">  &apos;https://copticio-production.up.railway.app/api/readings&apos;</span>
						{"\n"}
						<span className="text-gray-300">);</span>
						{"\n\n"}
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
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<h3 className="text-gray-900 dark:text-white font-medium mb-1">Calendar</h3>
					<p className="text-gray-500 dark:text-gray-400 text-sm">Feast days & seasons</p>
				</div>

				<div>
					<div className="text-amber-600 dark:text-amber-500 mb-2">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
						</svg>
					</div>
					<h3 className="text-gray-900 dark:text-white font-medium mb-1">Readings</h3>
					<p className="text-gray-500 dark:text-gray-400 text-sm">Daily scripture</p>
				</div>

				<div>
					<div className="text-amber-600 dark:text-amber-500 mb-2">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
						</svg>
					</div>
					<h3 className="text-gray-900 dark:text-white font-medium mb-1">REST + GraphQL</h3>
					<p className="text-gray-500 dark:text-gray-400 text-sm">Both supported</p>
				</div>
			</div>

			{/* Actions */}
			<div className="flex gap-3">
				<Link
					href="/docs"
					className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 px-5 rounded-xl transition-colors text-center text-sm"
				>
					View Documentation
				</Link>
				<a
					href="https://github.com/abanobmikaeel/coptic.io"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-3 px-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-sm"
				>
					<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
						<path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
					</svg>
					GitHub
				</a>
			</div>
		</div>
	);
}
