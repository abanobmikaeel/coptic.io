import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		watch: false,
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
				'**/scripts/**',
			],
		},
	},
})
