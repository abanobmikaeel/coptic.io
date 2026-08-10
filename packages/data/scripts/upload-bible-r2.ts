// @ts-nocheck — utility script run directly by Bun, not compiled by the project tsconfig
/**
 * Uploads all four bible translation JSONs to the coptic-io-readings R2 bucket.
 * Reads from this package's own `dist/`, so it always uploads exactly what the
 * built `@coptic/data` package ships — run `pnpm build` here first.
 *
 * Run once (or after a @coptic/data content update):
 *
 *   bun scripts/upload-bible-r2.ts          # all translations
 *   bun scripts/upload-bible-r2.ts cop      # selected translations
 *
 * Requires wrangler to be authenticated:  wrangler login
 */
import { execSync } from 'node:child_process'
import { unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { bibleData as bibleAr } from '../dist/ar/index.js'
import { bibleData as bibleCop } from '../dist/cop/index.js'
import { bibleData as bibleEn } from '../dist/en/index.js'
import { bibleData as bibleEs } from '../dist/es/index.js'

const BUCKET = 'coptic-io-readings'

const allTranslations = [
	{ lang: 'en', data: bibleEn },
	{ lang: 'ar', data: bibleAr },
	{ lang: 'es', data: bibleEs },
	{ lang: 'cop', data: bibleCop },
] as const

const requested = new Set(process.argv.slice(2))
const knownLanguages = new Set(allTranslations.map(({ lang }) => lang))
for (const lang of requested) {
	if (!knownLanguages.has(lang as (typeof allTranslations)[number]['lang'])) {
		throw new Error(`Unknown Bible translation: ${lang}`)
	}
}
const translations =
	requested.size > 0 ? allTranslations.filter(({ lang }) => requested.has(lang)) : allTranslations

for (const { lang, data } of translations) {
	const file = join(tmpdir(), `bible-${lang}.json`)
	writeFileSync(file, JSON.stringify(data))

	const key = `bible-${lang}.json`
	process.stdout.write(`Uploading ${key} …\n`)
	execSync(
		`pnpm exec wrangler r2 object put ${BUCKET}/${key} --file ${file} --content-type application/json --remote`,
		{ stdio: 'inherit' },
	)
	unlinkSync(file)
	process.stdout.write(`✓ ${key}\n`)
}

process.stdout.write(`\nUploaded ${translations.map(({ lang }) => lang).join(', ')}.\n`)
