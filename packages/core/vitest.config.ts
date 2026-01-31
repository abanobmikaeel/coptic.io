import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		watch: false,
		testTimeout: 10000,
		hookTimeout: 10000,
		teardownTimeout: 5000,
	},
})
