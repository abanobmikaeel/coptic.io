import { fetchPage } from './agpeya-source'
for (const lang of ['en', 'ar'] as const) {
	const p = await fetchPage('01_Prime', lang)
	const g = p.findIndex(
		(l, i) =>
			i > 50 &&
			(lang === 'en' ? /^THE HOLY GOSPEL/ : /إنجيل يوحنا 1: 1-17/).test(l) &&
			i > p.length / 2,
	)
	console.log(`== ${lang} from ${g} of ${p.length}`)
	p.slice(g, g + 75).forEach((l, i) =>
		console.log(g + i, l.length > 90 ? `${l.slice(0, 90)}… (${l.length})` : l),
	)
}
