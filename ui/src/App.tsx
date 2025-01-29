import Navbar from './components/Navbar'
import './App.css'
import Landing from './pages/Landing'

function App() {
	return (
		<div className="min-h-screen">
			<Navbar />
			<div className="py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto">
					<div className="bg-gray-800 shadow rounded-lg p-6">
						<Landing />
					</div>
				</div>
			</div>
		</div>
	)
}

export default App
