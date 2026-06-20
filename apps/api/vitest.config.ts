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
			reporter: ['text', 'json', 'html', ['lcov', { projectRoot: '../..' }]],
			include: ['src/**/*.ts'],
			exclude: [
				'**/__tests__/**',
				'**/*.d.ts',
				'**/*.config.*',
				'**/coverage/**',
				'**/dist/**',
				'**/dist-workers/**',
				'**/node_modules/**',
			],
		},
	},
})
