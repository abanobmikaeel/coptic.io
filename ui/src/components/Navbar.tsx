import { useState } from 'react'
import { HiSearch } from 'react-icons/hi'

const Navbar = () => {
	const [search, setSearch] = useState('')
	const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)

	return (
		<>
			<nav className="bg-gray-900 w-full px-4 py-3 flex items-center justify-between">
				<div className="flex items-center">
					<h3 className="text-2xl font-bold text-white">Coptic.io</h3>
				</div>

				<HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
				<input
					type="text"
					placeholder="Search..."
					className="w-full pl-10 pr-4 py-2 bg-gray-800 text-gray-200 rounded-full border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 transition-all duration-200"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</nav>

			{isSideMenuOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-10"
					onClick={() => setIsSideMenuOpen(false)}
				/>
			)}
		</>
	)
}

export default Navbar
