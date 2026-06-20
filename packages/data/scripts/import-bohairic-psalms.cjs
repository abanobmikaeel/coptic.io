#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const corpusDir = process.argv[2]
if (!corpusDir) {
	throw new Error('Usage: node import-bohairic-psalms.cjs /path/to/bohairic.ot_CONLLU')
}

const copticDir = path.join(__dirname, '../src/cop')
const canonicalPath = path.join(copticDir, 'canonical.json')
const files = fs
	.readdirSync(corpusDir)
	.filter((name) => /^19_Psalmi_\d{3}\.conllu$/.test(name))
	.sort()

const chapters = files.map((name) => {
	const chapterNum = Number.parseInt(name.match(/(\d{3})\.conllu$/)[1], 10)
	const source = fs.readFileSync(path.join(corpusDir, name), 'utf8')
	const texts = source
		.split(/\n\s*\n/)
		.map((sentence) => ({
			english: sentence.match(/^# text_en = (.+)$/m)?.[1].trim(),
			coptic: sentence.match(/^# text = (.+)$/m)?.[1].trim(),
		}))
		.filter(({ english, coptic }) => english && english !== '...' && coptic && coptic !== '...')
		.map(({ coptic }) => coptic)

	if (texts.length === 0) throw new Error(`No Psalm text found in ${name}`)

	return {
		num: chapterNum,
		verses: texts.map((text, index) => ({ num: index + 1, text })),
	}
})

if (chapters.length !== 151 || chapters[0].num !== 1 || chapters[150].num !== 151) {
	throw new Error(`Expected Psalms 1-151, found ${chapters.length}`)
}

const canonical = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'))
const psalms = { name: 'Psalms', chapters }
const books = canonical.books.filter((book) => book.name !== 'Psalms')
const insertAt = books.findIndex((book) => book.name === 'Ecclesiastes')
books.splice(insertAt >= 0 ? insertAt : books.length, 0, psalms)

canonical.books = books
canonical.sources.Psalms = 'bohairic'
canonical.missingBooks = canonical.missingBooks.filter((name) => name !== 'Psalms')
fs.writeFileSync(canonicalPath, `${JSON.stringify(canonical, null, '\t')}\n`)

console.log(`Imported ${chapters.length} Bohairic Psalms into ${canonicalPath}`)
