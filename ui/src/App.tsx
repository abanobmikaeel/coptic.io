import Navbar from './components/Navbar'
import './App.css'

import AppRoutes from './components/Routes'

import { BrowserRouter } from 'react-router-dom'
function App() {
	return (
		<BrowserRouter>
			<div className="min-h-screen">
				<Navbar />
				<AppRoutes />
			</div>
		</BrowserRouter>
	)
}

export default App
