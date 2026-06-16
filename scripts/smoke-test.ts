const API_URL = process.env.API_URL ?? process.argv[2]

if (!API_URL) {
	console.error('Usage: API_URL=https://... tsx scripts/smoke-test.ts')
	process.exit(1)
}

type Check = {
	desc: string
	path: string
	validate: (body: unknown) => boolean
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
]

let failed = false

for (const { desc, path, validate } of checks) {
	const url = `${API_URL}${path}`
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
		const body = await res.json()
		if (!res.ok || !validate(body)) {
			console.error(`FAIL [${desc}]: status=${res.status} body=${JSON.stringify(body)}`)
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
