import React from 'react'

const Reference: React.FC = () => {
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">Reference</h1>

			<section className="mb-8">
				<h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
				<ul className="list-disc pl-6">
					<li className="mb-2">
						<a href="#" className="text-blue-600 hover:text-blue-800">
							Grammar Rules
						</a>
					</li>
					<li className="mb-2">
						<a href="#" className="text-blue-600 hover:text-blue-800">
							Vocabulary Lists
						</a>
					</li>
					<li className="mb-2">
						<a href="#" className="text-blue-600 hover:text-blue-800">
							Common Phrases
						</a>
					</li>
				</ul>
			</section>

			<section className="mb-8">
				<h2 className="text-2xl font-semibold mb-4">Recent Updates</h2>
				<div className="bg-gray-100 p-4 rounded-lg">
					<p>Last updated: {new Date().toLocaleDateString()}</p>
				</div>
			</section>
		</div>
	)
}

export default Reference
