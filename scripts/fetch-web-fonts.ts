/**
 * Web font vendoring
 *
 * Mirrors the Google Fonts CSS for the web app's fonts so `next build` never touches
 * the network, reproducing what next/font/google generated:
 * - every subset block Google serves (same unicode-range splits)
 * - a metric-adjusted fallback face per family, using next/font's own metrics
 * - preload hints for the subsets the app renders on every page
 *
 * Font files are content-addressed under public/fonts/google (served immutable).
 * All fonts are SIL OFL 1.1; each font's license travels with it in licenses/.
 *
 * Run with: pnpm fonts:fetch
 */

import { createHash } from 'node:crypto'
import * as fs from 'node:fs'
import { createRequire } from 'node:module'
import * as path from 'node:path'

const WEB_DIR = path.join(import.meta.dirname, '../apps/web')
const PUBLIC_PATH = '/fonts/google'
const FILES_DIR = path.join(WEB_DIR, 'public', PUBLIC_PATH)
const LICENSES_DIR = path.join(FILES_DIR, 'licenses')
const CSS_PATH = path.join(WEB_DIR, 'app/fonts/fonts.css')
const PRELOAD_PATH = path.join(WEB_DIR, 'app/fonts/preload.ts')
const LICENSE_BASE_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl'

// Google only serves woff2 to browsers it recognises
const USER_AGENT =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

interface WebFont {
	/** CSS custom property the app reads the family from */
	variable: string
	/** css2 `family=` value */
	query: string
	/** Directory under google/fonts/ofl holding the font's OFL.txt */
	licenseDir: string
	/** Subsets to preload, as next/font/google's `subsets` option did */
	preload: string[]
}

const FONTS: WebFont[] = [
	{
		variable: '--font-inter',
		query: 'Inter:wght@100..900',
		licenseDir: 'inter',
		preload: ['latin'],
	},
	{
		variable: '--font-serif',
		query: 'EB Garamond:wght@400..800',
		licenseDir: 'ebgaramond',
		preload: ['latin'],
	},
	{
		variable: '--font-coptic',
		query: 'Noto Sans Coptic',
		licenseDir: 'notosanscoptic',
		preload: ['coptic'],
	},
	{
		variable: '--font-arabic',
		query: 'Noto Naskh Arabic:wght@400;500;600',
		licenseDir: 'notonaskharabic',
		preload: ['arabic'],
	},
]

const BLOCK = /\/\* ([\w-]+) \*\/\s*@font-face \{([^}]*)\}/g

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-')

const familyOf = (query: string) => query.split(':')[0]

const fallbackOf = (family: string) => `${family} Fallback`

// next/font/google's precalculated metrics, so the swap from fallback to web font
// shifts layout no more than it did before vendoring
const { calculateSizeAdjustValues } = createRequire(path.join(WEB_DIR, 'package.json'))(
	'next/dist/server/font-utils',
) as {
	calculateSizeAdjustValues: (
		family: string,
	) => Record<'ascent' | 'descent' | 'lineGap' | 'sizeAdjust' | 'fallbackFont', string>
}

function fallbackFace(family: string): string {
	const m = calculateSizeAdjustValues(family)
	return [
		'@font-face {',
		`  font-family: "${fallbackOf(family)}";`,
		`  src: local("${m.fallbackFont}");`,
		`  ascent-override: ${m.ascent}%;`,
		`  descent-override: ${m.descent}%;`,
		`  line-gap-override: ${m.lineGap}%;`,
		`  size-adjust: ${m.sizeAdjust}%;`,
		'}',
	].join('\n')
}

interface VendoredFont {
	css: string
	preloads: string[]
}

async function fetchText(url: string): Promise<string> {
	const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
	if (!res.ok) throw new Error(`${res.status} fetching ${url}`)
	return res.text()
}

async function fetchBytes(url: string): Promise<Buffer> {
	const res = await fetch(url)
	if (!res.ok) throw new Error(`${res.status} fetching ${url}`)
	return Buffer.from(await res.arrayBuffer())
}

async function vendorFont(font: WebFont): Promise<VendoredFont> {
	const family = familyOf(font.query)
	const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.query)}&display=swap`
	const css = await fetchText(cssUrl)

	const blocks: string[] = []
	const preloads = new Set<string>()
	for (const [, subset, body] of css.matchAll(BLOCK)) {
		const src = body.match(/url\(([^)]+)\)/)?.[1]
		if (!src) throw new Error(`Unexpected @font-face for ${family} (${subset})`)

		const bytes = await fetchBytes(src)
		const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 8)
		// Content-addressed, so weights Google serves from one variable file share it
		const fileName = `${slugify(family)}-${subset}-${hash}.woff2`
		fs.writeFileSync(path.join(FILES_DIR, fileName), bytes)

		const url = `${PUBLIC_PATH}/${fileName}`
		if (font.preload.includes(subset)) preloads.add(url)
		const localBody = body.replace(src, `"${url}"`)
		blocks.push(`/* ${subset} */\n@font-face {${localBody}}`)
	}

	if (blocks.length === 0) throw new Error(`No @font-face blocks returned for ${family}`)
	if (preloads.size === 0) throw new Error(`No preload subset matched for ${family}`)

	const license = await fetchText(`${LICENSE_BASE_URL}/${font.licenseDir}/OFL.txt`)
	fs.writeFileSync(path.join(LICENSES_DIR, `${slugify(family)}-OFL.txt`), license)
	console.log(`${family}: ${blocks.length} faces, ${preloads.size} preloaded`)
	return { css: [...blocks, fallbackFace(family)].join('\n'), preloads: [...preloads] }
}

async function main() {
	for (const dir of [FILES_DIR, LICENSES_DIR]) {
		fs.rmSync(dir, { recursive: true, force: true })
		fs.mkdirSync(dir, { recursive: true })
	}

	const vendored: VendoredFont[] = []
	for (const font of FONTS) vendored.push(await vendorFont(font))

	const variables = FONTS.map((font) => {
		const family = familyOf(font.query)
		return `\t${font.variable}: "${family}", "${fallbackOf(family)}";`
	}).join('\n')
	const cssHeader = [
		'/* Generated by scripts/fetch-web-fonts.ts — do not edit by hand.',
		`   Source: Google Fonts. Licensed under the SIL Open Font License 1.1; see public${PUBLIC_PATH}/licenses. */`,
	].join('\n')
	const faces = vendored.map((font) => font.css).join('\n')
	fs.writeFileSync(CSS_PATH, `${cssHeader}\n\n${faces}\n\n:root {\n${variables}\n}\n`)

	const preloads = vendored.flatMap((font) => font.preloads)
	fs.writeFileSync(
		PRELOAD_PATH,
		`// Generated by scripts/fetch-web-fonts.ts — do not edit by hand.\nexport const fontPreloads = ${JSON.stringify(preloads)}\n`,
	)
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
