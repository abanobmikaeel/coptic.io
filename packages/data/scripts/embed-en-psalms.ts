/**
 * Embeds English liturgical psalms into en/agpeya/agpeya.json for one hour.
 *
 * The English text is Brenton's Septuagint (1851, public domain, ebible.org)
 * re-split to the Arabic Agpeya psalter's traditional verse divisions, so the
 * two languages pair verse-for-verse in the side-by-side reader. Before
 * writing, every psalm is validated against the Arabic embedding: same psalm
 * set and same verse count.
 *
 * Usage: npx tsx scripts/embed-en-psalms.ts <hourId> <staging.json>
 *   staging.json: { "Psalm 1": ["verse text", ...], ... } keyed by psalmRef title.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const [hourId, stagingPath] = process.argv.slice(2)
if (!hourId || !stagingPath) {
	console.error('usage: npx tsx scripts/embed-en-psalms.ts <hourId> <staging.json>')
	process.exit(1)
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')
const enPath = join(root, 'en/agpeya/agpeya.json')
const en = JSON.parse(readFileSync(enPath, 'utf8'))
const ar = JSON.parse(readFileSync(join(root, 'ar/agpeya/agpeya.json'), 'utf8'))
const staged: Record<string, string[]> = JSON.parse(readFileSync(stagingPath, 'utf8'))

const enHour = en.hours[hourId]
const arHour = ar.hours[hourId]
if (!enHour || !arHour) {
	console.error(`hour '${hourId}' not found`)
	process.exit(1)
}

interface Ref {
	psalmNumber: number
	title: string
}
interface ArPsalm {
	title: string
	verses: { num: number; text: string }[]
}

const refs: Ref[] = enHour.psalmRefs
const arPsalms: ArPsalm[] = arHour.psalms ?? []

let failed = false
const embedded = refs.map((ref, i) => {
	const verses = staged[ref.title]
	const arCount = arPsalms[i]?.verses.length
	if (!verses) {
		console.error(`✗ ${ref.title}: missing from staging file`)
		failed = true
		return null
	}
	if (arCount != null && verses.length !== arCount) {
		console.error(`✗ ${ref.title}: en=${verses.length} verses but ar=${arCount}`)
		failed = true
		return null
	}
	console.log(`✓ ${ref.title}: ${verses.length} verses`)
	return {
		title: ref.title,
		reference: ref.title,
		verses: verses.map((text, v) => ({ num: v + 1, text })),
	}
})

if (failed) process.exit(1)

enHour.psalms = embedded
writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`)
console.log(`\nembedded ${embedded.length} psalms into en hours.${hourId}`)
