import { useState } from 'react'
// import { HiSearch } from 'react-icons/hi'
import { Link } from 'react-router-dom'

const Navbar = () => {
	// const [search, setSearch] = useState('')
	const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)

	return (
		<>
			<nav className="px-4 py-3 flex items-center">
				<div className="flex items-center">
					<Link to="/">
						<h3 className="text-2xl font-bold text-white">Coptic I/O</h3>
					</Link>
				</div>

				<div className="flex items-center gap-4 ml-auto">
					{/* <div className="relative w-96"></div>
					<input
						type="text"
						placeholder="Search..."
						className="w-full px-2 pl-10 pr-4 py-2 bg-gray-800 text-gray-200 rounded-full border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 transition-all duration-200"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/> */}
				</div>
				<div className="flex items-center gap-4 ml-4">
					<Link
						to="/examples"
						className="text-white hover:text-gray-300 transition-colors"
					>
						<p className="text-gray-300">Examples</p>
					</Link>
					{/* <button className="text-gray-400 hover:text-gray-300 transition-colors">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
					</button> */}
				</div>
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
