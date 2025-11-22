'use client'

import Link from 'next/link'

const Navbar = () => {
	return (
		<nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2 group">
					<h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors font-playfair">
						coptic.io
					</h3>
				</Link>

				<div className="flex items-center gap-8">
					<Link
						href="/examples"
						className="text-gray-300 hover:text-white transition-colors font-medium"
					>
						Examples
					</Link>
					<Link
						href="/docs"
						className="text-gray-300 hover:text-white transition-colors font-medium"
					>
						Documentation
					</Link>
				</div>
			</div>
		</nav>
	)
}

export default Navbar
