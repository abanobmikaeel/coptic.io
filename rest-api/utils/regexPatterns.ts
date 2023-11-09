/**
 * Concatenates two expressions together
 * @param reg
 * @param exp
 * @returns
 */
const concatRegexp = (reg: RegExp, exp: RegExp) => {
	let flags = reg.flags + exp.flags
	flags = Array.from(new Set(flags.split(''))).join()
	return new RegExp(reg.source + exp.source, flags)
}

/**
 * Single chapter, example: Psalms 119
 */
export const oneChapterPattern = new RegExp('[0-9]* *[A-z]+ [0-9]+')
export const oneChapterPatternExact = new RegExp('^[0-9]* *[A-z]+ [0-9]+$')

/**
 * Single verse, example: Psalms 119:96
 */
export const oneVersePattern = concatRegexp(
	oneChapterPattern,
	new RegExp(':[0-9]+')
)

/**
 * Verse range, example: Psalms 119:96-97
 */
export const verseRangePattern = concatRegexp(
	oneVersePattern,
	new RegExp('-[0-9]')
)

/**
 * Verse with commas,
 * examples:
 *   Psalms 119:96-97,98,101
 *   Psalms 119:96-97,98-99,101
 *   Psalms 119:96-97,98-99,101
 */
export const verseWithCommas = concatRegexp(oneVersePattern, new RegExp(','))

/**
 * Multi chapter range,
 * example: 2 Peter 1:19-2:8
 */
export const multiChapterRange = concatRegexp(
	oneChapterPattern,
	new RegExp(':[0-9]+-[0-9]+:[0-9]+')
)
