import { execSync } from 'node:child_process'
import { unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
// @ts-nocheck — utility script run directly by Bun, not compiled by the project tsconfig
/**
 * Uploads all four bible translation JSONs to the coptic-io-readings R2 bucket.
 * Run once (or after a @coptic/data package update):
 *
 *   bun scripts/upload-bible-r2.ts
 *
 * Requires wrangler to be authenticated:  wrangler login
 */
import { bibleData as bibleAr } from '@coptic/data/ar'
import { bibleData as bibleCop } from '@coptic/data/cop'
import { bibleData as bibleEn } from '@coptic/data/en'
import { bibleData as bibleEs } from '@coptic/data/es'

const BUCKET = 'coptic-io-readings'

const translations = [
	{ lang: 'en', data: bibleEn },
	{ lang: 'ar', data: bibleAr },
	{ lang: 'es', data: bibleEs },
	{ lang: 'cop', data: bibleCop },
] as const

for (const { lang, data } of translations) {
	const file = join(tmpdir(), `bible-${lang}.json`)
	writeFileSync(file, JSON.stringify(data))

	const key = `bible-${lang}.json`
	process.stdout.write(`Uploading ${key} …\n`)
	execSync(
		`pnpm exec wrangler r2 object put ${BUCKET}/${key} --file ${file} --content-type application/json`,
		{ stdio: 'inherit' },
	)
	unlinkSync(file)
	process.stdout.write(`✓ ${key}\n`)
}

process.stdout.write('\nAll translations uploaded.\n')
