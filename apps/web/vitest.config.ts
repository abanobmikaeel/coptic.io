import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	// Mirror the tsconfig `@/` path alias so tests can import app modules as the app does.
	resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
	test: {
		globals: true,
		environment: 'node',
		watch: false,
		include: ['lib/**/__tests__/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', ['lcov', { projectRoot: '../..' }]],
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
