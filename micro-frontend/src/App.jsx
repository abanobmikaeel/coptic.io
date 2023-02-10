import React from 'react'
import useFetch from './hooks/useFetch'
import 'bootstrap/dist/css/bootstrap.min.css'

export default () => {
	const { error, data } = useFetch('/v1/readings/')
	const TodaysDate = () => {
		if (!error && data && data.copticDate) {
			const {
				copticDate,
				Acts,
				Catholic,
				LGospel,
				LPsalm,
				MGospel,
				MPsalm,
				Pauline,
				VGospel,
				VPsalm,
			} = data.copticDate

			return (
				<>
					<p>Today's coptic date {copticDate.fullDate}</p>
					<p>Today's Readings</p>

					<div class="container">
						<a
							className="btn btn-secondary"
							href="https://github.com/abanobmikaeel/coptic.io"
							role="button"
						>
							Github
						</a>
						<a className="btn btn-secondary" href="/docs" role="button">
							Docs
						</a>
					</div>
				</>
			)
		}
	}
	return (
		<div className="container mt-5">
			<h1>Welcome to Coptic.io!</h1>
			<p>
				A tool that allows you to integrate the coptic calendar into your life.
			</p>

			<TodaysDate />
		</div>
	)
}
