import React from 'react'
import useFetch from './hooks/useFetch'
import Readings from './Readings'
import Navbar from './Navbar'
import 'bootstrap/dist/css/bootstrap.min.css'

export default () => {
	const { error, data } = useFetch('/v1/readings?detailed=true')
	return (
		<>
			<Navbar />
			<div className="container mt-3">
				<h1>Welcome to Coptic.io!</h1>
				<p>
					A tool that allows you to integrate the coptic calendar into
					apps/calendar.
				</p>
				{!error && data && data.references ? <Readings data={data} /> : <></>}
			</div>
		</>
	)
}
