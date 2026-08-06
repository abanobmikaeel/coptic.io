import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

if (!existsSync('.git')) {
	process.exit(0)
}

const result = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], {
	stdio: 'inherit',
})

if (result.status !== 0) {
	console.error('Failed to configure repository Git hooks.')
	process.exit(result.status ?? 1)
}
