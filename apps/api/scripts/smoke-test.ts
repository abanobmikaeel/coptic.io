export {}

const API_URL = process.env.API_URL ?? process.argv[2]

if (!API_URL) {
	console.error('Usage: API_URL=https://... bun scripts/smoke-test.ts')
	process.exit(1)
}

type Check = {
	desc: string
	path: string
	// Most routes answer with JSON; the iCal feed answers with text/calendar
	parse?: 'json' | 'text'
	validate: (body: unknown, res: Response) => boolean
}

const checks: Check[] = [
	{
		desc: 'health',
		path: '/health',
		validate: (b) => (b as Record<string, unknown>).success === true,
	},
	{
		desc: 'readings today',
		path: '/api/readings',
		validate: (b) => (b as Record<string, unknown>).reference != null,
	},
	{
		desc: 'agpeya current hour',
		path: '/api/agpeya',
		validate: (b) => typeof (b as Record<string, unknown>).id === 'string',
	},
	{
		desc: 'agpeya prime — verse content populated',
		path: '/api/agpeya/prime',
		validate: (b) => {
			const hour = b as { gospel?: { verses?: unknown[] } }
			return Array.isArray(hour.gospel?.verses) && hour.gospel.verses.length > 0
		},
	},
	{
		desc: 'agpeya hours list',
		path: '/api/agpeya/hours',
		validate: (b) => Array.isArray(b) && (b as unknown[]).length === 7,
	},
	{
		desc: 'agpeya midnight watch 1',
		path: '/api/agpeya/midnight/watch/1',
		validate: (b) => {
			const watch = b as { psalms?: unknown[] }
			return Array.isArray(watch.psalms) && watch.psalms.length > 0
		},
	},
	{
		desc: 'incense evening — sections populated with gospel',
		path: '/api/incense/evening?date=2026-01-15',
		validate: (b) => {
			const svc = b as { sections?: { type: string; verses?: unknown[] }[] }
			if (!Array.isArray(svc.sections) || svc.sections.length === 0) return false
			const gospel = svc.sections.find((s) => s.type === 'gospel')
			return Array.isArray(gospel?.verses) && gospel.verses.length > 0
		},
	},
	{
		desc: 'ical subscription feed — served as a calendar',
		path: '/api/calendar/ical/subscribe',
		parse: 'text',
		validate: (b, res) => {
			const ical = b as string
			return (
				res.headers.get('content-type')?.includes('text/calendar') === true &&
				ical.startsWith('BEGIN:VCALENDAR') &&
				ical.trimEnd().endsWith('END:VCALENDAR')
			)
		},
	},
	{
		desc: 'ical feed — unique, slug-safe UIDs and no over-long lines',
		path: '/api/calendar/ical/subscribe',
		parse: 'text',
		validate: (b) => {
			const lines = (b as string).split('\r\n')

			// RFC 5545 3.1: no content line may exceed 75 octets once folded
			if (lines.some((l) => new TextEncoder().encode(l).length > 75)) return false

			const uids = lines.filter((l) => l.startsWith('UID:')).map((l) => l.slice('UID:'.length))
			if (uids.length === 0 || new Set(uids).size !== uids.length) return false

			return uids.every((uid) => /^[a-z0-9]+(?:-[a-z0-9]+)*@coptic\.io$/.test(uid))
		},
	},
	{
		desc: 'ical feed — a season authored across many days stays one event per year',
		path: '/api/calendar/ical/subscribe',
		parse: 'text',
		validate: (b) => {
			const lines = (b as string).replace(/\r\n /g, '').split('\r\n')

			// Nayrouz is authored across Tout 1-16 and once emitted 16 duplicates a year
			const nayrouz = lines.filter((l) => l === 'SUMMARY:Coptic New Year (Nayrouz)').length
			const years = new Set(
				lines.filter((l) => l.startsWith('DTSTART;VALUE=DATE:')).map((l) => l.slice(-8, -4)),
			).size

			return years > 0 && nayrouz === years
		},
	},
]

let failed = false

for (const { desc, path, parse, validate } of checks) {
	const url = `${API_URL}${path}`
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
		const body = parse === 'text' ? await res.text() : await res.json()
		if (!res.ok || !validate(body, res)) {
			const shown = typeof body === 'string' ? body.slice(0, 300) : JSON.stringify(body)
			console.error(`FAIL [${desc}]: status=${res.status} body=${shown}`)
			failed = true
		} else {
			console.log(`PASS [${desc}]`)
		}
	} catch (err) {
		console.error(`FAIL [${desc}]: ${err}`)
		failed = true
	}
}

if (failed) process.exit(1)
