import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { type Locale, defaultLocale, locales } from './config'

export default getRequestConfig(async () => {
	const cookieStore = await cookies()
	const localeCookie = cookieStore.get('NEXT_LOCALE')?.value

	let locale: Locale = defaultLocale

	if (localeCookie && locales.includes(localeCookie as Locale)) {
		locale = localeCookie as Locale
	} else {
		const headersList = await headers()
		const acceptLang = headersList.get('accept-language')

		if (acceptLang) {
			// Parse Accept-Language header and find best match
			const preferredLocales = acceptLang
				.split(',')
				.map((lang) => {
					const [code, qValue] = lang.trim().split(';q=')
					return {
						code: code.split('-')[0].toLowerCase(),
						q: qValue ? Number.parseFloat(qValue) : 1,
					}
				})
				.sort((a, b) => b.q - a.q)

			for (const { code } of preferredLocales) {
				if (locales.includes(code as Locale)) {
					locale = code as Locale
					break
				}
			}
		}
	}

	return {
		locale,
		messages: (await import(`../messages/${locale}.json`)).default,
	}
})
