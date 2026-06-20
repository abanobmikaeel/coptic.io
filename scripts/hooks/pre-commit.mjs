import { spawnSync } from 'node:child_process'

const staged = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], {
	encoding: 'utf8',
})

if (staged.status !== 0) {
	process.exit(staged.status ?? 1)
}

const supportedExtensions = /\.(?:cjs|css|graphql|gql|js|json|jsonc|jsx|mjs|scss|ts|tsx)$/u
const files = staged.stdout.split('\0').filter((file) => file && supportedExtensions.test(file))

if (files.length > 0) {
	const biome = spawnSync(
		'pnpm',
		['exec', 'biome', 'check', '--no-errors-on-unmatched', ...files],
		{
			stdio: 'inherit',
		},
	)
	if (biome.status !== 0) {
		process.exit(biome.status ?? 1)
	}
}

const whitespace = spawnSync('git', ['diff', '--cached', '--check'], { stdio: 'inherit' })
process.exit(whitespace.status ?? 1)
