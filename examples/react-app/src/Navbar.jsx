import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Navbar() {
	const [openMenu, setOpenMenu] = useState(false)
	return (
		<nav className="navbar navbar-expand-lg navbar-light bg-light">
			<div className="container">
				<a className="navbar-brand" href="#">
					Coptic.io
				</a>
				<button
					className="navbar-toggler"
					type="button"
					data-toggle="collapse"
					data-target="#navbarSupportedContent"
					aria-controls="navbarSupportedContent"
					aria-expanded="false"
					aria-label="Toggle navigation"
					onClick={() => setOpenMenu(!openMenu)}
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className={`collapse navbar-collapse ${openMenu ? 'show' : ''}`}>
					<ul className="navbar-nav ml-auto">
						<li className="nav-item">
							<a className="nav-link" href="/docs">
								Docs
							</a>
						</li>
						<li className="nav-item">
							<a
								className="nav-link"
								href="https://github.com/abanobmikaeel/coptic.io"
							>
								Github
							</a>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	)
}
