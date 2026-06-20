import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		watch: false,
		testTimeout: 10000,
		hookTimeout: 10000,
		teardownTimeout: 5000,
		coverage: {
			provider: 'v8',
			reporter: ['text', ['lcov', { projectRoot: '../..' }]],
			include: ['src/**/*.ts'],
			exclude: [
				'**/__benchmarks__/**',
				'**/__tests__/**',
				'**/*.d.ts',
				'**/*.config.*',
				'**/coverage/**',
				'**/dist/**',
				'**/node_modules/**',
			],
		},
	},
})
