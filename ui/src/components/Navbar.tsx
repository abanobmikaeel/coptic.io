import { useState } from 'react'

const Navbar = () => {
	const [search, setSearch] = useState('')

	return (
		<nav className="mb-8">
			<div className="relative max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold text-center pt-2 text-white mb-8">
					Coptic.io
				</h1>
				{/* <input
					type="text"
					placeholder="Search API endpoints..."
					className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/> */}
			</div>
		</nav>
	)
}

export default Navbar
