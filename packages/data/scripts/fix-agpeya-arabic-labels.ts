/**
 * Replaces English that leaked into the Arabic Agpeya with the source's Arabic
 * (psalm titles, the psalms intro), and removes English that has no Arabic source.
 *
 *   npx tsx scripts/fix-agpeya-arabic-labels.ts [--check]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const AR_DIR = join(import.meta.dirname, '../src/ar/agpeya')
const PAGES = {
	prime: '01_Prime',
	terce: '03_Terce',
	sext: '06_Sext',
	none: '09_None',
	vespers: '11_Vespers',
	compline: '12_Compline',
	midnight: 'Midnight',
} as const
type HourId = keyof typeof PAGES
const DAY_HOURS = new Set<HourId>(['terce', 'sext', 'none', 'vespers', 'compline'])

interface Section {
	id: string
	kind: string
	title?: string
	rubric?: string
	note?: string
	psalmNumber?: number
}
type OrderEntry = string | { group: string; order: string[] }
interface HourFile {
	introduction?: string
	psalmsIntro?: string
	order: OrderEntry[]
	sections: Section[]
}

const ASCII = /^[ -~]+$/
const HEADING = /^(?:\(\d+\) )?(المزمور [^0-9(:]+)$/

async function psalmHeadings(page: string): Promise<string[]> {
	const url = `https://st-takla.org/Agpeya/Agbeya_${page}_.html`
	const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
	if (!res.ok) throw new Error(`${res.status} fetching ${url}`)
	const html = new TextDecoder('windows-1256').decode(new Uint8Array(await res.arrayBuffer()))
	return html
		.replace(/\s+/g, ' ')
		.split(/<\/p>|<p\b[^>]*>|<br\s*\/?>/i)
		.map((chunk) =>
			chunk
				.replace(/<[^<>]*>/g, '')
				.replaceAll('&nbsp;', ' ')
				.replace(/\s+/g, ' ')
				.trim(),
		)
		.flatMap((line) => HEADING.exec(line)?.[1].trim() ?? [])
}

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8'))
const writeJson = (path: string, value: unknown) =>
	writeFileSync(path, `${JSON.stringify(value, null, '\t')}\n`)

const common = readJson<{ sections: Record<string, Section> }>(join(AR_DIR, 'common.json'))
const hours = Object.fromEntries(
	Object.keys(PAGES).map((id) => [id, readJson<HourFile>(join(AR_DIR, `${id}.json`))]),
) as Record<HourId, HourFile>

const sectionOf = (hour: HourFile, id: string) =>
	hour.sections.find((s) => s.id === id) ?? common.sections[id]
const psalmsInOrder = (hour: HourFile): Section[] =>
	hour.order
		.flatMap((entry) => (typeof entry === 'string' ? [entry] : entry.order))
		.map((id) => sectionOf(hour, id))
		.filter((s): s is Section => s?.kind === 'psalm' || s?.kind === 'intro-psalm')

const titles = new Map<number, string>()
for (const [hourId, page] of Object.entries(PAGES) as [HourId, string][]) {
	const psalms = psalmsInOrder(hours[hourId])
	const headings = await psalmHeadings(page)
	// Pages list psalms twice (contents, then body). Midnight's page omits the first
	// watch, whose psalms the daytime hours already cover.
	const numbers =
		hourId === 'midnight'
			? [50, ...psalms.map((p) => p.psalmNumber as number).filter((n) => n >= 119)]
			: psalms.map((p) => p.psalmNumber as number)
	const body = headings.slice(-numbers.length)
	if (body.length !== numbers.length)
		throw new Error(`${hourId}: ${body.length} headings for ${numbers.length} psalms`)
	numbers.forEach((n, i) => {
		const known = titles.get(n)
		if (known && known !== body[i])
			throw new Error(`${hourId}: Psalm ${n} is "${known}" elsewhere, "${body[i]}" here`)
		titles.set(n, body[i])
	})
}
if (titles.get(50) !== 'المزمور الخمسون') throw new Error('Psalm 50 heading misaligned')

const changes: string[] = []
const retitle = (where: string, section: Section) => {
	if (!section.title || !ASCII.test(section.title) || section.psalmNumber == null) return
	const title = titles.get(section.psalmNumber)
	if (!title)
		return changes.push(`${where}: no Arabic heading for Psalm ${section.psalmNumber}, left as is`)
	changes.push(`${where}: "${section.title}" → "${title}"`)
	section.title = title
}
const drop = (
	where: string,
	section: Section | HourFile,
	field: 'rubric' | 'note' | 'introduction',
) => {
	const value = (section as Record<string, unknown>)[field]
	if (typeof value !== 'string' || !ASCII.test(value)) return
	changes.push(`${where}: removed English ${field}`)
	delete (section as Record<string, unknown>)[field]
}

for (const section of Object.values(common.sections)) retitle(`common ${section.id}`, section)

const arabicPsalmsIntro = hours.prime.psalmsIntro
if (!arabicPsalmsIntro || ASCII.test(arabicPsalmsIntro))
	throw new Error('Prime has no Arabic psalmsIntro to share')

for (const [hourId, hour] of Object.entries(hours) as [HourId, HourFile][]) {
	for (const section of hour.sections) {
		retitle(`${hourId} ${section.id}`, section)
		drop(`${hourId} ${section.id}`, section, 'rubric')
		drop(`${hourId} ${section.id}`, section, 'note')
	}
	drop(hourId, hour, 'introduction')
	if (DAY_HOURS.has(hourId) && hour.psalmsIntro && ASCII.test(hour.psalmsIntro)) {
		changes.push(`${hourId}: psalmsIntro → "${arabicPsalmsIntro}"`)
		hour.psalmsIntro = arabicPsalmsIntro
	}
}

console.log(changes.join('\n'))
console.log(`\n${changes.length} changes`)
if (!process.argv.includes('--check')) {
	writeJson(join(AR_DIR, 'common.json'), common)
	for (const [id, hour] of Object.entries(hours)) writeJson(join(AR_DIR, `${id}.json`), hour)
}
