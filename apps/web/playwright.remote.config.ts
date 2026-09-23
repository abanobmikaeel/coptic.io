import base from './playwright.config'

// Runs the suite against an already-running site (BASE_URL) without booting a dev server
export default { ...base, webServer: undefined, reporter: 'list' }
