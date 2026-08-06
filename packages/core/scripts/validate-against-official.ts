/**
 * Validates our moveable feast calculations against official CopticChurch.net data
 * Fetches multiple years and compares our algorithm output with official dates
 *
 *   pnpm --filter @coptic/core validate:feasts
 *
 * Imports the source directly rather than the built `dist`: reading the source
 * means the check runs against working-tree changes instead of a stale build.
 */

import { getMoveableFeastsForYear } from '../src/index'

interface OfficialDate {
	year: number
	name: string
	date: string // Format: "Month Day" (e.g., "April 20")
}

async function fetchOfficialData(year: number): Promise<OfficialDate[]> {
	const response = await fetch(`https://www.copticchurch.net/calendar/feasts/${year}`)
	const html = await response.text()

	const dates: OfficialDate[] = []

	// Rows look like:
	//   <b>Feast Name</b></div>\n\t\t<div class="col col-md-4">Month Dayth</div>
	// Anchoring on that structure rather than scanning ahead for the next
	// "word number" keeps a feast from picking up a neighbouring row's date.
	// The site spells one feast "Ninevah"/"Nineveah"; ours is "Nineveh".
	const OFFICIAL_TO_OURS: Record<string, string> = {
		Easter: 'Easter',
		'Palm Sunday': 'Palm Sunday',
		Ascension: 'Ascension',
		Pentecost: 'Pentecost',
		'Holy Thursday': 'Holy Thursday',
		'Good Friday': 'Good Friday',
		'Thomas Sunday': 'Thomas Sunday',
		'Fast of Ninevah': 'Fast of Nineveh',
		'Fast of Nineveah': 'Fast of Nineveh',
		'Great Lent': 'Great Lent',
	}

	const rowPattern =
		/<b>([^<]+)<\/b>\s*<\/div>\s*<div class="col col-md-4">\s*([A-Z][a-z]+)\s+(\d+)(?:st|nd|rd|th)?\s*<\/div>/g

	const flattened = html.replace(/[\n\t]/g, ' ')
	for (const match of flattened.matchAll(rowPattern)) {
		const ourName = OFFICIAL_TO_OURS[(match[1] ?? '').trim()]
		if (!ourName) continue
		dates.push({ year, name: ourName, date: `${match[2]} ${match[3]}` })
	}

	return dates
}

function parseOfficialDate(dateStr: string, year: number): Date {
	// Parse "Month Day" format
	const [month = '', day = ''] = dateStr.split(' ')
	const monthMap: Record<string, number> = {
		January: 0,
		February: 1,
		March: 2,
		April: 3,
		May: 4,
		June: 5,
		July: 6,
		August: 7,
		September: 8,
		October: 9,
		November: 10,
		December: 11,
	}

	const monthIndex = monthMap[month]
	if (monthIndex === undefined) {
		throw new Error(`Unparseable official date: "${dateStr}"`)
	}

	return new Date(year, monthIndex, parseInt(day))
}

function formatDate(date: Date): string {
	return date.toDateString()
}

async function validateYear(year: number): Promise<{
	year: number
	matches: number
	mismatches: Array<{
		name: string
		official: string
		calculated: string
		match: boolean
	}>
}> {
	console.log(`\nValidating ${year}...`)

	const officialData = await fetchOfficialData(year)
	const calculatedFeasts = getMoveableFeastsForYear(year)

	const results = {
		year,
		matches: 0,
		mismatches: [] as Array<{
			name: string
			official: string
			calculated: string
			match: boolean
		}>,
	}

	for (const official of officialData) {
		const calculated = calculatedFeasts.find((f) => f.name === official.name)

		if (!calculated) {
			console.log(`  ⚠️  ${official.name}: Not found in calculated feasts`)
			continue
		}

		const officialDate = parseOfficialDate(official.date, year)
		const match = formatDate(officialDate) === formatDate(calculated.date)

		if (match) {
			results.matches++
			console.log(`  ✅ ${official.name}: ${official.date}`)
		} else {
			console.log(
				`  ❌ ${official.name}: Official=${official.date}, Calculated=${formatDate(calculated.date)}`,
			)
			results.mismatches.push({
				name: official.name,
				official: official.date,
				calculated: formatDate(calculated.date),
				match: false,
			})
		}
	}

	return results
}

async function main() {
	const yearsToValidate = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]

	console.log('🔍 Validating moveable feast calculations against CopticChurch.net\n')
	console.log(
		`Testing ${yearsToValidate.length} years: ${yearsToValidate[0]}-${yearsToValidate[yearsToValidate.length - 1]}`,
	)

	const allResults = []

	for (const year of yearsToValidate) {
		const result = await validateYear(year)
		allResults.push(result)

		// Be respectful to the server
		await new Promise((resolve) => setTimeout(resolve, 500))
	}

	// Summary
	console.log(`\n${'='.repeat(60)}`)
	console.log('VALIDATION SUMMARY')
	console.log('='.repeat(60))

	const totalMatches = allResults.reduce((sum, r) => sum + r.matches, 0)
	const totalMismatches = allResults.reduce((sum, r) => sum + r.mismatches.length, 0)
	const totalTests = totalMatches + totalMismatches

	console.log(`\nTotal Tests: ${totalTests}`)
	console.log(`✅ Matches: ${totalMatches}`)
	console.log(`❌ Mismatches: ${totalMismatches}`)
	console.log(`📊 Accuracy: ${((totalMatches / totalTests) * 100).toFixed(2)}%`)

	if (totalMismatches > 0) {
		console.log('\n⚠️  MISMATCHES FOUND:')
		allResults.forEach((result) => {
			if (result.mismatches.length > 0) {
				console.log(`\n${result.year}:`)
				result.mismatches.forEach((m) => {
					console.log(`  ${m.name}: ${m.official} (official) vs ${m.calculated} (calculated)`)
				})
			}
		})
		process.exit(1)
	} else {
		console.log('\n🎉 ALL TESTS PASSED! Our calculations match official dates.')
		process.exit(0)
	}
}

main().catch((error) => {
	console.error('Error:', error)
	process.exit(1)
})
