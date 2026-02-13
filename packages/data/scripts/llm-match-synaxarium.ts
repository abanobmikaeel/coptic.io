/**
 * Script to match English and Arabic synaxarium entries using DeepSeek LLM.
 *
 * Setup:
 * 1. Copy scripts/.env.example to scripts/.env
 * 2. Add your DEEPSEEK_API_KEY
 *
 * Run with: pnpm match:synaxarium
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
					content: `You are an expert in Coptic Orthodox saints and Arabic-English transliteration.
Your task is to match English saint names with their Arabic equivalents.
Respond ONLY with a JSON array of matches, no explanation.
Format: [{"en_idx": 0, "ar_idx": 2}, {"en_idx": 1, "ar_idx": 0}, ...]
If an entry has no match, omit it from the array.`,
				},
				{
					role: 'user',
					content: prompt,
				},
			],
			temperature: 0.1,
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
	const enList = enEntries.map((e, i) => `${i}: ${e.name}`).join('\n')
	const arList = arEntries.map((e, i) => `${i}: ${e.name}`).join('\n')

	return `Match these English Coptic saint commemorations with their Arabic equivalents for ${dateKey}.

ENGLISH ENTRIES:
${enList}

ARABIC ENTRIES:
${arList}

Return JSON array of index matches: [{"en_idx": 0, "ar_idx": 1}, ...]`
}

interface Match {
	en_idx: number
	ar_idx: number
}

function parseMatches(response: string): Match[] {
	try {
		// Extract JSON from response (in case there's extra text)
		const jsonMatch = response.match(/\[[\s\S]*\]/)
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

	const allDateKeys = [...new Set([...Object.keys(enData), ...Object.keys(arData)])]

	const log = (msg: string) => {
		process.stdout.write(`${msg}\n`)
	}

	log(`Processing ${allDateKeys.length} dates...\n`)

	let totalMatched = 0
	let totalEn = 0
	let totalAr = 0

	// Process in batches to avoid rate limits
	const batchSize = 5
	for (let i = 0; i < allDateKeys.length; i += batchSize) {
		const batch = allDateKeys.slice(i, i + batchSize)

		await Promise.all(
			batch.map(async (dateKey) => {
				const enEntries = enData[dateKey] || []
				const arEntries = arData[dateKey] || []

				totalEn += enEntries.length
				totalAr += arEntries.length

				if (enEntries.length === 0 || arEntries.length === 0) {
					// No matching possible, assign unique IDs
					for (let j = 0; j < enEntries.length; j++) {
						enEntries[j].id = generateSemanticId(dateKey, enEntries[j].name)
					}
					for (let j = 0; j < arEntries.length; j++) {
						arEntries[j].id = `${dateKey.toLowerCase().replace(/\s+/g, '-')}-ar-${j + 1}`
					}
					return
				}

				log(`Matching: ${dateKey} (${enEntries.length} EN, ${arEntries.length} AR)`)

				const matches = await matchEntriesForDate(dateKey, enEntries, arEntries)
				const usedArIndices = new Set<number>()

				// Assign IDs to matched entries
				for (const [enIdx, arIdx] of matches) {
					const semanticId = generateSemanticId(dateKey, enEntries[enIdx].name)
					enEntries[enIdx].id = semanticId
					arEntries[arIdx].id = semanticId
					usedArIndices.add(arIdx)
					totalMatched++
				}

				// Assign unique IDs to unmatched English entries
				for (let j = 0; j < enEntries.length; j++) {
					if (!enEntries[j].id) {
						enEntries[j].id = generateSemanticId(dateKey, enEntries[j].name)
					}
				}

				// Assign unique IDs to unmatched Arabic entries
				for (let j = 0; j < arEntries.length; j++) {
					if (!arEntries[j].id) {
						arEntries[j].id = `${dateKey.toLowerCase().replace(/\s+/g, '-')}-ar-${j + 1}`
					}
				}

				log(`  ✓ Matched ${matches.size}/${Math.min(enEntries.length, arEntries.length)} entries`)
			}),
		)

		// Small delay between batches to respect rate limits
		if (i + batchSize < allDateKeys.length) {
			await new Promise((resolve) => setTimeout(resolve, 1000))
		}
	}

	// Write updated data
	writeFileSync(enPath, JSON.stringify(enData, null, '\t'))
	writeFileSync(arPath, JSON.stringify(arData, null, '\t'))

	log(`\n${'='.repeat(50)}`)
	log('COMPLETE!')
	log(`Total English entries: ${totalEn}`)
	log(`Total Arabic entries: ${totalAr}`)
	log(`Total matched: ${totalMatched}`)
	log(`Match rate: ${((totalMatched / Math.min(totalEn, totalAr)) * 100).toFixed(1)}%`)
}

main().catch(console.error)
