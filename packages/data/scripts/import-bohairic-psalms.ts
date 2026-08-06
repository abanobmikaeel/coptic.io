import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const corpusDir = process.argv[2]
if (!corpusDir) {
	throw new Error(
		'Usage: tsx packages/data/scripts/import-bohairic-psalms.ts /path/to/bohairic.ot_CONLLU',
	)
}

const copticDir = join(import.meta.dirname, '..', 'src', 'cop')
const canonicalPath = join(copticDir, 'canonical.json')
const files = readdirSync(corpusDir)
	.filter((name) => /^19_Psalmi_\d{3}\.conllu$/.test(name))
	.sort()

const chapters = files.map((name) => {
	const chapterNum = Number.parseInt(name.match(/(\d{3})\.conllu$/)?.[1] ?? '', 10)
	const source = readFileSync(join(corpusDir, name), 'utf8')
	const texts = source
		.split(/\n\s*\n/)
		.map((sentence) => ({
			english: sentence.match(/^# text_en = (.+)$/m)?.[1]?.trim(),
			coptic: sentence.match(/^# text = (.+)$/m)?.[1]?.trim(),
		}))
		.filter(({ english, coptic }) => english && english !== '...' && coptic && coptic !== '...')
		.map(({ coptic }) => coptic as string)

	if (texts.length === 0) throw new Error(`No Psalm text found in ${name}`)

	return {
		num: chapterNum,
		verses: texts.map((text, index) => ({ num: index + 1, text })),
	}
})

if (chapters.length !== 151 || chapters[0]?.num !== 1 || chapters[150]?.num !== 151) {
	throw new Error(`Expected Psalms 1-151, found ${chapters.length}`)
}

// biome-ignore lint/suspicious/noExplicitAny: canonical.json's book shape varies per language/source
const canonical: Record<string, any> = JSON.parse(readFileSync(canonicalPath, 'utf8'))
const psalms = { name: 'Psalms', chapters }
// biome-ignore lint/suspicious/noExplicitAny: see canonical above
const books: any[] = canonical.books.filter((book: any) => book.name !== 'Psalms')
const insertAt = books.findIndex((book) => book.name === 'Ecclesiastes')
books.splice(insertAt >= 0 ? insertAt : books.length, 0, psalms)

canonical.books = books
canonical.sources.Psalms = 'bohairic'
canonical.missingBooks = canonical.missingBooks.filter((name: string) => name !== 'Psalms')
writeFileSync(canonicalPath, `${JSON.stringify(canonical, null, '\t')}\n`)

console.log(`Imported ${chapters.length} Bohairic Psalms into ${canonicalPath}`)
