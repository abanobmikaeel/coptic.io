// IS_WORKERS is injected as `true` by wrangler's [define] at bundle time.
// esbuild eliminates the Bun-dev dynamic-import branch from the Workers bundle,
// so bible translation packages are never bundled into the Worker.
// In Bun dev / tests, IS_WORKERS is undefined and the dynamic-import branch runs.
declare const IS_WORKERS: boolean | undefined

import type { R2Bucket } from '../../env'
import type {
	BibleBook,
	BibleChapter,
	BibleTranslation,
	BibleType,
	BibleVerse,
	Reading,
} from '../../types'

type TranslationCache = { index: TranslationIndex; raw: BibleType }

// Module-level cache: survives for the lifetime of a Worker isolate (warm requests
// skip R2 entirely) and for the lifetime of the Bun dev process.
const translationCache = new Map<BibleTranslation, TranslationCache>()
const pendingLoads = new Map<BibleTranslation, Promise<void>>()

let r2Bucket: R2Bucket | null = null

export function setBibleBucket(bucket: R2Bucket) {
	r2Bucket = bucket
}

type TranslationIndex = {
	booksByName: Map<string, BibleBook>
	chaptersByBook: Map<string, Map<number, BibleChapter>>
	versesByChapter: Map<string, Map<number, Map<number, BibleVerse>>>
}

function buildIndex(bible: BibleType): TranslationIndex {
	const booksByName = new Map<string, BibleBook>()
	const chaptersByBook = new Map<string, Map<number, BibleChapter>>()
	const versesByChapter = new Map<string, Map<number, Map<number, BibleVerse>>>()

	for (const book of bible.books) {
		booksByName.set(book.name, book)

		const chapterMap = new Map<number, BibleChapter>()
		const verseMap = new Map<number, Map<number, BibleVerse>>()

		for (const chapter of book.chapters) {
			chapterMap.set(chapter.num, chapter)

			const versesInChapter = new Map<number, BibleVerse>()
			for (const verse of chapter.verses) {
				versesInChapter.set(verse.num, verse)
			}
			verseMap.set(chapter.num, versesInChapter)
		}

		chaptersByBook.set(book.name, chapterMap)
		versesByChapter.set(book.name, verseMap)
	}

	return { booksByName, chaptersByBook, versesByChapter }
}

async function loadTranslation(lang: BibleTranslation): Promise<BibleType> {
	// Workers path: fetch from R2 (injected constant IS_WORKERS=true removes the else branch)
	if (typeof IS_WORKERS !== 'undefined' && IS_WORKERS) {
		if (!r2Bucket) throw new Error('BIBLE_BUCKET R2 binding not initialised')
		const obj = await r2Bucket.get(`bible-${lang}.json`)
		if (!obj) throw new Error(`bible-${lang}.json not found in R2 bucket`)
		return obj.json<BibleType>()
	}

	// Bun dev / test path: computed path prevents esbuild from statically
	// bundling bible packages into the Workers bundle.
	const pkg = `@coptic/data/${lang}`
	// biome-ignore lint/suspicious/noExplicitAny: computed import, type asserted below
	const m = (await import(pkg)) as any
	return m.bibleData as BibleType
}

/**
 * Ensures the translation index is ready before the synchronous lookup chain
 * runs. Concurrent calls share a single in-flight Promise so R2 is hit once.
 */
export async function warmTranslation(lang: BibleTranslation): Promise<void> {
	if (translationCache.has(lang)) return

	if (!pendingLoads.has(lang)) {
		const load = loadTranslation(lang).then((data) => {
			translationCache.set(lang, { index: buildIndex(data), raw: data })
		})
		pendingLoads.set(
			lang,
			load.finally(() => pendingLoads.delete(lang)),
		)
	}

	await pendingLoads.get(lang)
}

export function getRawBible(lang: BibleTranslation = 'en'): BibleType {
	const cache = translationCache.get(lang)
	if (!cache) throw new Error(`Translation not loaded: ${lang} — was warmTranslation() called?`)
	return cache.raw
}

function getIndex(translation: BibleTranslation = 'en'): TranslationIndex {
	const cache = translationCache.get(translation)
	if (!cache) {
		throw new Error(`Translation index not ready: ${translation} — was warmTranslation() called?`)
	}
	return cache.index
}

export const getBook = (
	bookName: string,
	translation: BibleTranslation = 'en',
): BibleBook | undefined => getIndex(translation).booksByName.get(bookName)

export const getChapter = (
	book: BibleBook,
	chapterNum: number,
	translation: BibleTranslation = 'en',
): BibleChapter | undefined => getIndex(translation).chaptersByBook.get(book.name)?.get(chapterNum)

export const getChapterByBookName = (
	bookName: string,
	chapterNum: number,
	translation: BibleTranslation = 'en',
): BibleChapter | undefined => getIndex(translation).chaptersByBook.get(bookName)?.get(chapterNum)

export const getVerse = (chapter: BibleChapter, verseNum: number): BibleVerse | undefined =>
	chapter.verses.find((currVerse) => currVerse.num === verseNum)

export const getVerseByBookChapter = (
	bookName: string,
	chapterNum: number,
	verseNum: number,
	translation: BibleTranslation = 'en',
): BibleVerse | undefined =>
	getIndex(translation).versesByChapter.get(bookName)?.get(chapterNum)?.get(verseNum)

// Pre-load all translations at module-init in Bun dev/tests so getByCopticDate
// stays synchronous. esbuild eliminates this block when IS_WORKERS=true.
if (typeof IS_WORKERS === 'undefined') {
	await warmTranslation('en')
	await warmTranslation('ar')
	await warmTranslation('es')
	await warmTranslation('cop')
}

export const getChapterAndOrVerse = (
	bookName: string,
	chapterNum: number,
	verseNum?: number,
	translation: BibleTranslation = 'en',
): Reading => {
	const book = getBook(bookName, translation)
	const chapter = book && getChapter(book, chapterNum, translation)
	let verses: BibleVerse[] = []

	if (verseNum) {
		const foundVerse = chapter && getVerse(chapter, verseNum)
		if (foundVerse) {
			verses.push(foundVerse)
		}
	} else {
		verses = chapter?.verses ?? []
	}

	return {
		bookName,
		chapters: [{ chapterNum, verses }],
	}
}
