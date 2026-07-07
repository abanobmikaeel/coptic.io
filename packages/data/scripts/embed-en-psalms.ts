/**
 * Embeds English liturgical psalms into en/agpeya/agpeya.json for one hour
 * or one midnight watch.
 *
 * The English text is the standard church translation from St-Takla.org's
 * English Agpeya (the same source family as agpeya.org / copticmedia.org),
 * re-split to the Arabic Agpeya psalter's traditional verse divisions, so the
 * two languages pair verse-for-verse in the side-by-side reader. Before
 * writing, every psalm is validated against the Arabic embedding: same psalm
 * set and same verse count.
 *
 * Usage: npx tsx scripts/embed-en-psalms.ts <hourId|watchId> <staging.json>
 *   hourId: prime|terce|sext|none|vespers|compline, or a midnight watch id
 *   (midnight-1|midnight-2|midnight-3).
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

interface Watched {
	watches?: { id: string }[]
}
const findUnit = (data: { hours: Record<string, unknown>; midnight: Watched }) =>
	data.hours[hourId] ?? data.midnight.watches?.find((w) => w.id === hourId)

const enHour = findUnit(en)
const arHour = findUnit(ar)
if (!enHour || !arHour) {
	console.error(`hour or watch '${hourId}' not found`)
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
console.log(`\nembedded ${embedded.length} psalms into en ${hourId}`)
