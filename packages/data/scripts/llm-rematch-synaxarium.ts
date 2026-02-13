/**
 * Script to re-match unmatched Arabic synaxarium entries using DeepSeek LLM.
 * Only processes dates that have Arabic entries with fallback IDs (containing "-ar-").
 *
 * Run with: pnpm rematch:synaxarium
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Load .env file if exists
const envPath = join(import.meta.dirname, '.env')
if (existsSync(envPath)) {
	const envContent = readFileSync(envPath, 'utf-8')
	for (const line of envContent.split('\n')) {
		const trimmed = line.trim()
		if (trimmed && !trimmed.startsWith('#')) {
			const [key, ...valueParts] = trimmed.split('=')
			const value = valueParts.join('=')
			if (key && value) {
				process.env[key] = value
			}
		}
	}
}

interface SynaxariumEntry {
	url?: string
	name: string
	text?: string
	id?: string
}

type SynaxariumData = Record<string, SynaxariumEntry[]>

const DATA_DIR = join(import.meta.dirname, '../src')
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

async function callDeepSeek(prompt: string): Promise<string> {
	const apiKey = process.env.DEEPSEEK_API_KEY
	if (!apiKey) {
		throw new Error('DEEPSEEK_API_KEY environment variable is required')
	}

	const response = await fetch(DEEPSEEK_API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: 'deepseek-chat',
			messages: [
				{
					role: 'system',
					content: `You are an expert in Coptic Orthodox Church history, saints, and Arabic-English transliteration.

Your task is to match English Coptic synaxarium entries with their Arabic equivalents. The synaxarium contains commemorations of saints, martyrs, popes, and church events.

MATCHING GUIDELINES:
- Names may be transliterated differently (e.g., "Agrippinus" = "اغربيينوس", "Abakir" = "اباكير")
- "Departure" (نياحة) = peaceful death of a saint
- "Martyrdom" (استشهاد/شهادة) = death by martyrdom
- "Pope of Alexandria" = "بابا الإسكندرية"
- "Pope of Rome" = "بابا روما"
- Some entries may have no match - that's OK, omit them

RESPOND ONLY with a valid JSON array. No explanation, no markdown.
Format: [{"en_idx": 0, "ar_idx": 2}, {"en_idx": 1, "ar_idx": 0}]`,
				},
				{
					role: 'user',
					content: prompt,
				},
			],
			temperature: 0,
		}),
	})

	if (!response.ok) {
		const error = await response.text()
		throw new Error(`DeepSeek API error: ${response.status} - ${error}`)
	}

	const data = await response.json()
	return data.choices[0].message.content
}

function buildPrompt(
	dateKey: string,
	enEntries: SynaxariumEntry[],
	arEntries: SynaxariumEntry[],
): string {
	const enList = enEntries.map((e, i) => `  ${i}: "${e.name}"`).join('\n')
	const arList = arEntries.map((e, i) => `  ${i}: "${e.name}"`).join('\n')

	return `Match these Coptic synaxarium entries for ${dateKey}.

ENGLISH (${enEntries.length} entries):
${enList}

ARABIC (${arEntries.length} entries):
${arList}

Return JSON array of matches where the English and Arabic entries refer to the SAME saint/event.
Example: [{"en_idx": 0, "ar_idx": 1}] means English entry 0 matches Arabic entry 1.
Only include confident matches. Omit entries with no clear match.`
}

interface Match {
	en_idx: number
	ar_idx: number
}

function parseMatches(response: string): Match[] {
	try {
		// Clean the response - remove markdown code blocks if present
		let cleaned = response.trim()
		if (cleaned.startsWith('```')) {
			cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
		}

		// Extract JSON array
		const jsonMatch = cleaned.match(/\[[\s\S]*\]/)
		if (!jsonMatch) return []
		return JSON.parse(jsonMatch[0])
	} catch {
		console.error('Failed to parse response:', response)
		return []
	}
}

async function matchEntriesForDate(
	dateKey: string,
	enEntries: SynaxariumEntry[],
	arEntries: SynaxariumEntry[],
): Promise<Map<number, number>> {
	const prompt = buildPrompt(dateKey, enEntries, arEntries)

	try {
		const response = await callDeepSeek(prompt)
		const matches = parseMatches(response)

		const matchMap = new Map<number, number>()
		for (const match of matches) {
			if (
				match.en_idx >= 0 &&
				match.en_idx < enEntries.length &&
				match.ar_idx >= 0 &&
				match.ar_idx < arEntries.length
			) {
				matchMap.set(match.en_idx, match.ar_idx)
			}
		}
		return matchMap
	} catch (error) {
		console.error(`Error matching ${dateKey}:`, error)
		return new Map()
	}
}

function generateSemanticId(dateKey: string, name: string): string {
	const slug = name
		.toLowerCase()
		.replace(/['']/g, '')
		.replace(/st\.\s*/g, 'st-')
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 50)

	return `${dateKey.toLowerCase().replace(/\s+/g, '-')}-${slug}`
}

async function main() {
	const enPath = join(DATA_DIR, 'en/synaxarium/canonical.json')
	const arPath = join(DATA_DIR, 'ar/synaxarium/canonical.json')

	const enData: SynaxariumData = JSON.parse(readFileSync(enPath, 'utf-8'))
	const arData: SynaxariumData = JSON.parse(readFileSync(arPath, 'utf-8'))

	// Find dates that have Arabic entries with fallback IDs
	const datesToRematch: string[] = []
	for (const [dateKey, arEntries] of Object.entries(arData)) {
		const hasFallbackIds = arEntries.some((e) => e.id?.includes('-ar-'))
		const hasEnglish = enData[dateKey]?.length > 0
		if (hasFallbackIds && hasEnglish) {
			datesToRematch.push(dateKey)
		}
	}

	const log = (msg: string) => {
		process.stdout.write(`${msg}\n`)
	}

	log(`Found ${datesToRematch.length} dates with unmatched Arabic entries\n`)

	if (datesToRematch.length === 0) {
		log('Nothing to re-match!')
		return
	}

	let totalRematched = 0
	let totalProcessed = 0

	// Process one at a time for better reliability
	for (const dateKey of datesToRematch) {
		const enEntries = enData[dateKey] || []
		const arEntries = arData[dateKey] || []

		// Only process Arabic entries that have fallback IDs
		const unmatchedArIndices = arEntries
			.map((e, i) => (e.id?.includes('-ar-') ? i : -1))
			.filter((i) => i >= 0)

		if (unmatchedArIndices.length === 0) continue

		log(`Re-matching: ${dateKey} (${enEntries.length} EN, ${arEntries.length} AR, ${unmatchedArIndices.length} unmatched)`)
		totalProcessed++

		const matches = await matchEntriesForDate(dateKey, enEntries, arEntries)

		// Update IDs for newly matched entries
		for (const [enIdx, arIdx] of matches) {
			// Only update if this Arabic entry was previously unmatched
			if (arEntries[arIdx].id?.includes('-ar-')) {
				const semanticId = enEntries[enIdx].id || generateSemanticId(dateKey, enEntries[enIdx].name)
				arEntries[arIdx].id = semanticId
				totalRematched++
				log(`  ✓ ${enEntries[enIdx].name.slice(0, 40)} <-> ${arEntries[arIdx].name.slice(0, 30)}`)
			}
		}

		// Save after each date to preserve progress
		writeFileSync(arPath, JSON.stringify(arData, null, '\t'))

		// Rate limit delay
		await new Promise((resolve) => setTimeout(resolve, 500))
	}

	log(`\n${'='.repeat(50)}`)
	log('COMPLETE!')
	log(`Dates processed: ${totalProcessed}`)
	log(`Entries re-matched: ${totalRematched}`)

	// Final count
	let finalUnmatched = 0
	for (const arEntries of Object.values(arData)) {
		finalUnmatched += arEntries.filter((e) => e.id?.includes('-ar-')).length
	}
	log(`Remaining unmatched: ${finalUnmatched}`)
}

main().catch(console.error)
