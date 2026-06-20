import { readFileSync } from 'node:fs'

// The commit-msg hook pipes the message file into stdin (`node validate… < $1`),
// so we read fd 0 rather than opening a path supplied on the command line.
const subject = readFileSync(0, 'utf8')
	.split('\n')
	.find((line) => line.trim() && !line.startsWith('#'))
	?.trim()

if (!subject) {
	console.error('Commit message must include a subject.')
	process.exit(1)
}

const conventional =
	/^(?:build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(?:\([a-z0-9][a-z0-9._/-]*\))?!?: .+$/u
const gitGenerated = /^(?:Merge |Revert "|fixup! |squash! )/u

if (!conventional.test(subject) && !gitGenerated.test(subject)) {
	console.error(`Invalid Conventional Commit subject:\n\n  ${subject}\n`)
	console.error('Expected: type(optional-scope): concise description')
	console.error('Example: fix(api): preserve repeated response headers')
	process.exit(1)
}
