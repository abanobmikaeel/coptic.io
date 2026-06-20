import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		watch: false,
		include: ['lib/**/__tests__/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov'],
			include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'hooks/**/*.ts', 'lib/**/*.ts'],
			exclude: [
				'**/__tests__/**',
				'**/*.d.ts',
				'**/*.config.*',
				'**/.next/**',
				'**/coverage/**',
				'**/node_modules/**',
			],
		},
	},
})
