import { readFileSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'

const messageFileArg = process.argv[2]
if (!messageFileArg) {
	console.error('Commit message file was not provided.')
	process.exit(1)
}

// Git invokes this hook from the repository root and passes a path inside the
// repo. Resolve it and confine it to the working directory so a stray/malicious
// CLI argument cannot read files elsewhere on the filesystem.
const repoRoot = process.cwd()
const messageFile = resolve(repoRoot, messageFileArg)
const relativeToRepo = relative(repoRoot, messageFile)
if (!relativeToRepo || relativeToRepo.startsWith('..') || isAbsolute(relativeToRepo)) {
	console.error('Refusing to read commit message file outside the repository.')
	process.exit(1)
}

const subject = readFileSync(messageFile, 'utf8')
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
