import { Route, Routes } from 'react-router-dom'
import { lazy } from 'react'

// Lazy load components for better performance
const Home = lazy(() => import('../pages/Landing'))
const Learn = lazy(() => import('../pages/Learn'))
const Reference = lazy(() => import('../pages/Reference'))
const Examples = lazy(() => import('../pages/Examples'))
const NotFound = lazy(() => import('../pages/NotFound'))

const AppRoutes = () => {
	return (
		// <Suspense fallback={<div>Loading...</div>}>
		<Routes>
			<Route path="/" element={<Home />} />
			{/* <Route path="/about" element={<Reference />} />
			<Route path="/learn" element={<Learn />} /> */}
			<Route path="/examples" element={<Examples />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
		// </Suspense>/
	)
}

export default AppRoutes
