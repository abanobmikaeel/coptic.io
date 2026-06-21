import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: process.env.BASE_URL || 'http://localhost:3001',
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'Mobile Chrome',
			use: { ...devices['Pixel 5'] },
		},
		// ===== Mobile iOS =====
		{
			name: 'Mobile Safari - iPhone 13',
			use: { ...devices['iPhone 13'] },
		},
		{
			name: 'Mobile Safari - iPhone 14 Pro',
			use: { ...devices['iPhone 14 Pro'] },
		},
		{
			name: 'Mobile Safari - iPhone SE',
			use: { ...devices['iPhone SE'] },
		},
	],
	// Auto-boots the web dev server on :3001 (reuses one you already started via
	// `pnpm dev:web`). The API (Bun) is expected on :3000 — see NEXT_PUBLIC_API_URL.
	webServer: {
		command: 'bun run dev',
		url: 'http://localhost:3001',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
})
