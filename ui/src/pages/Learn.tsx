import React from 'react'

const Learn: React.FC = () => {
	return (
		<>
			<div className="container mx-auto px-4 py-16 max-w-7xl"></div>
			<h1 className="text-4xl font-bold mb-8">Learn Coptic</h1>

			<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4">Alphabet</h2>
					<p className="text-gray-600">
						Learn the Coptic alphabet and its pronunciation.
					</p>
				</div>

				<div className="bg-white rounded-lg shadow-md p-6"></div>
				<h2 className="text-xl font-semibold mb-4">Basic Grammar</h2>
				<p className="text-gray-600">
					Understand fundamental Coptic grammar rules and sentence structure.
				</p>
			</div>

			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-xl font-semibold mb-4">Common Phrases</h2>
				<p className="text-gray-600">
					Practice everyday Coptic phrases and expressions.
				</p>
			</div>
		</>
	)
}

export default Learn
