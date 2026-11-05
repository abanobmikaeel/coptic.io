export const typeDefs = /* GraphQL */ `
	"Languages the calendar, celebrations and fasting are named in"
	enum CalendarLanguage {
		en
		ar
		es
	}

	"Languages the Synaxarium is published in"
	enum SynaxariumLanguage {
		en
		ar
	}

	type CopticDate {
		dateString: String!
		day: Int!
		month: Int!
		year: Int!
		monthString: String!
	}

	type Celebration {
		id: Int!
		name: String!
		type: String! @deprecated(reason: "Use category")
		category: String!
		periodType: String @deprecated(reason: "Always single, and absent from most celebrations")
		isMoveable: Boolean
		month: String
		celebratedOnEve: Boolean
	}

	type SynaxariumEntry {
		id: String!
		name: String!
		url: String!
		text: String
		sourceRef: String
	}

	type Reading {
		reference: ReadingReference
		Prophecies: [ReadingDetail!]
		VPsalm: [ReadingDetail!]
		VGospel: [ReadingDetail!]
		MPsalm: [ReadingDetail!]
		MGospel: [ReadingDetail!]
		Pauline: [ReadingDetail!]
		Catholic: [ReadingDetail!]
		Acts: [ReadingDetail!]
		LPsalm: [ReadingDetail!]
		LGospel: [ReadingDetail!]
		EPPsalm: [ReadingDetail!]
		EPGospel: [ReadingDetail!]
		Synaxarium: [SynaxariumEntry!]!
		synaxariumLanguage: String
		celebrations: [Celebration]
		season: String
		seasonKey: String
		seasonDay: String
		cycle: String!
		readingsAvailable: Boolean!
		fullDate: CopticDate!
	}

	type ReadingReference {
		id: Int
		Prophecies: String
		VPsalm: String
		VGospel: String
		MPsalm: String
		MGospel: String
		Pauline: String
		Catholic: String
		Acts: String
		LPsalm: String
		LGospel: String
		EPPsalm: String
		EPGospel: String
	}

	type ReadingDetail {
		bookName: String!
		chapters: [ReadingChapter!]!
	}

	type ReadingChapter {
		chapterNum: Int!
		verses: [Verse!]!
	}

	type Verse {
		num: Int!
		text: String!
	}

	type DailyVerseText {
		book: String!
		chapter: Int!
		verse: Int!
		text: String!
	}

	type DailyVerse {
		verse: DailyVerseText!
		reference: String!
		readingSlot: String!
		readingReference: String!
		language: String!
		requestedLanguage: String
		fallback: Boolean
		season: String
		seasonKey: String
		fullDate: CopticDate!
	}

	type FastingInfo {
		isFasting: Boolean!
		fastType: String
		description: String
	}

	type FastingDay {
		date: String!
		copticDate: CopticDate!
		fastType: String!
		description: String!
	}

	type UpcomingCelebration {
		date: String!
		copticDate: CopticDate!
		celebrations: [Celebration!]!
	}

	type SynaxariumSearchCopticDate {
		dateString: String!
		day: Int!
		monthString: String!
	}

	type SynaxariumSearchEntry {
		url: String
		name: String
	}

	type SynaxariumSearchResult {
		date: String!
		copticDate: SynaxariumSearchCopticDate!
		entry: SynaxariumSearchEntry!
	}

	type CalendarDayFasting {
		isFasting: Boolean!
		fastType: String
		description: String
	}

	type CalendarDay {
		gregorianDate: String!
		copticDate: CopticDate!
		fasting: CalendarDayFasting!
	}

	type CopticMonthInfo {
		month: Int!
		monthString: String!
		year: Int!
		startDay: Int!
	}

	type CalendarMonth {
		year: Int!
		month: Int!
		monthName: String!
		days: [CalendarDay!]!
		copticMonths: [CopticMonthInfo!]!
	}

	# ── Shared ────────────────────────────────────────────────────────────────

	"Languages a liturgical service is published in"
	enum ServiceLanguage {
		en
		ar
		cop
	}

	"Bible translations the API serves"
	enum BibleLanguage {
		en
		ar
		es
		cop
	}

	"""
	A prayed line. REST sends a line said by everyone as a plain string; here every
	line is an object, and such a line has only text.
	"""
	type ContentLine {
		text: String!
		speaker: String
		isRubric: Boolean
		isResponse: Boolean
		coptic: String
	}

	# ── Season ────────────────────────────────────────────────────────────────

	type Season {
		date: String!
		season: String!
		description: String!
		startDate: String
		endDate: String
		isFasting: Boolean!
		type: String
	}

	"A season or fasting period of a year; isFasting is set on seasons only"
	type SeasonPeriod {
		name: String!
		description: String!
		startDate: String!
		endDate: String!
		type: String!
		isFasting: Boolean
	}

	type SeasonYear {
		year: Int!
		seasons: [SeasonPeriod!]!
	}

	type FastingPeriods {
		year: Int!
		fastingPeriods: [SeasonPeriod!]!
	}

	# ── Lent ──────────────────────────────────────────────────────────────────

	type LentSermon {
		title: String!
		preacher: String
		youtubeUrl: String!
		thumbnail: String
	}

	type LentResolvedReference {
		reference: String!
		readings: [ReadingDetail!]
	}

	type LentDay {
		dayOffset: Int!
		dayNumber: Int!
		part: String!
		weekNumber: Int!
		weekTheme: String!
		day: String!
		title: String!
		references: [String!]!
		sermons: [LentSermon!]
		sundayHolyGospelReading: String
		date: String!
		"Set when requested with detailed"
		resolvedReferences: [LentResolvedReference!]
	}

	type LentSchedule {
		year: Int!
		easterDate: String!
		lentStart: String!
		lentEnd: String!
		days: [LentDay!]!
	}

	# ── Search ────────────────────────────────────────────────────────────────

	enum SearchCategory {
		bible
		synaxarium
		agpeya
	}

	type BibleSearchResult {
		type: String!
		book: String!
		chapter: Int!
		verse: Int
		text: String!
		url: String!
		score: Float
	}

	type SynaxariumSearchHit {
		type: String!
		name: String!
		date: String!
		copticDate: String!
		summary: String
		url: String!
		score: Float
	}

	type AgpeyaSearchResult {
		type: String!
		id: String!
		name: String!
		englishName: String!
		traditionalTime: String
		url: String!
		score: Float
	}

	type SearchResults {
		bible: [BibleSearchResult!]!
		synaxarium: [SynaxariumSearchHit!]!
		agpeya: [AgpeyaSearchResult!]!
	}

	type SearchResponse {
		results: SearchResults!
		query: String!
		totalCount: Int!
	}

	# ── Incense and the Liturgy ───────────────────────────────────────────────

	enum IncenseTime {
		evening
		morning
	}

	"""
	A section of the Incense or the Liturgy. Prayers carry content; psalms, epistles
	and gospels carry reference and verses.
	"""
	type ServiceSection {
		id: String!
		type: String!
		role: String!
		title: String!
		titleLanguage: ServiceLanguage
		rubric: String
		"Offered as an extra the reader can add, rather than prayed by default"
		optional: Boolean
		content: [ContentLine!]
		reference: String
		verses: [Verse!]
	}

	type LiturgicalService {
		type: String!
		name: String!
		date: String!
		copticDate: CopticDate!
		sections: [ServiceSection!]!
	}

	# ── Tasbeha ───────────────────────────────────────────────────────────────

	enum Weekday {
		sunday
		monday
		tuesday
		wednesday
		thursday
		friday
		saturday
	}

	type TasbehaSource {
		name: String!
		url: String!
		pageId: Int!
		accessedAt: String!
		corroboratingUrls: [String!]
	}

	type TasbehaRite {
		cycle: String!
		dayTune: String!
		weekdays: [Int!]!
	}

	type TasbehaSection {
		id: String!
		type: String!
		role: String!
		kind: String!
		title: String!
		titleLanguage: ServiceLanguage
		content: [ContentLine!]!
		source: TasbehaSource!
	}

	type TasbehaService {
		type: String!
		id: String!
		name: String!
		description: String!
		status: String!
		rite: TasbehaRite!
		sections: [TasbehaSection!]!
	}

	# ── Agpeya ────────────────────────────────────────────────────────────────

	enum AgpeyaHourId {
		prime
		terce
		sext
		none
		vespers
		compline
		midnight
	}

	enum PsalmSource {
		septuagint
		bible
	}

	type AgpeyaPrayer {
		title: String
		content: [ContentLine!]!
		inline: Boolean
	}

	type AgpeyaPsalm {
		title: String!
		reference: String!
		rubric: String
		verses: [Verse!]!
	}

	type AgpeyaGospel {
		reference: String!
		rubric: String
		verses: [Verse!]!
	}

	"""
	A part of an hour in prayed order: prose carries content, scripture carries
	reference and verses, and a Midnight watch (kind "watch") groups its own parts.
	"""
	type AgpeyaPart {
		id: String!
		kind: String
		title: String
		rubric: String
		inline: Boolean
		content: [ContentLine!]
		reference: String
		verses: [Verse!]
		theme: String
		prayer: String
		psalmsIntro: String
		psalmsRubric: String
		sections: [AgpeyaPart!]
	}

	type AgpeyaWatch {
		id: String!
		name: String!
		theme: String!
		opening: AgpeyaPrayer
		psalmsIntro: String
		psalms: [AgpeyaPsalm!]!
		gospel: AgpeyaGospel
		gospelConclusion: AgpeyaPrayer
		litanies: AgpeyaPrayer
		closing: AgpeyaPrayer
		conclusion: [AgpeyaPart!]
	}

	"An hour of the Agpeya. Midnight has watches in place of psalms and a gospel."
	type AgpeyaHour {
		id: String!
		name: String!
		englishName: String!
		traditionalTime: String!
		introduction: String
		opening: AgpeyaPrayer!
		hourIntro: AgpeyaPrayer
		comeLetUsWorship: AgpeyaPrayer
		thanksgiving: AgpeyaPrayer
		introductoryPsalm: AgpeyaPsalm
		psalmsIntro: String
		psalms: [AgpeyaPsalm!]
		gospel: AgpeyaGospel
		gospelConclusion: AgpeyaPrayer
		litanies: AgpeyaPrayer
		lordsPrayer: AgpeyaPrayer
		thanksgivingAfter: AgpeyaPrayer
		closing: AgpeyaPrayer
		conclusion: [AgpeyaPart!]
		watches: [AgpeyaWatch!]
		"Set when requested with includeSections"
		sections: [AgpeyaPart!]
	}

	# ── Queries ───────────────────────────────────────────────────────────────

	type Query {
		# Calendar
		copticDate(date: String, lang: String): CopticDate!
		calendarMonth(year: Int!, month: Int!): CalendarMonth!

		# Readings
		readings(date: String, detailed: Boolean, lang: String): Reading!
		dailyVerse(date: String, lang: String): DailyVerse

		# Celebrations
		allCelebrations: [Celebration!]!
		celebrationsForDate(date: String, lang: CalendarLanguage): [Celebration!]!
		upcomingCelebrations(days: Int, lang: CalendarLanguage): [UpcomingCelebration!]!

		# Fasting
		fastingForDate(date: String, lang: CalendarLanguage): FastingInfo!
		fastingCalendar(year: Int!): [FastingDay!]!

		# Synaxarium
		synaxariumForDate(date: String, detailed: Boolean, lang: SynaxariumLanguage): [SynaxariumEntry!]
		searchSynaxarium(query: String!, limit: Int): [SynaxariumSearchResult!]!

		# Season
		season(date: String, lang: String): Season!
		seasonsForYear(year: Int!): SeasonYear!
		fastingPeriods(year: Int!): FastingPeriods!

		# Lent
		lentSchedule(year: Int): LentSchedule!
		"The devotional for a date, or null outside Great Lent"
		lentDay(date: String, detailed: Boolean, lang: String): LentDay

		# Search
		search(query: String!, limit: Int, categories: [SearchCategory!]): SearchResponse!

		# Agpeya
		agpeyaHour(
			hour: AgpeyaHourId!
			lang: BibleLanguage
			psalms: PsalmSource
			includeSections: Boolean
		): AgpeyaHour!
		currentAgpeyaHour(lang: BibleLanguage, psalms: PsalmSource): AgpeyaHour!
		agpeyaHours(lang: BibleLanguage, psalms: PsalmSource): [AgpeyaHour!]!
		"A Midnight watch, 1 to 3"
		agpeyaWatch(watch: Int!, lang: BibleLanguage, psalms: PsalmSource): AgpeyaWatch!
		agpeyaTranslations: [BibleLanguage!]!

		# Incense and the Liturgy
		incense(
			time: IncenseTime!
			date: String
			lang: ServiceLanguage
			commemorations: [String!]
		): LiturgicalService!
		incenseCommemorations: [String!]!
		liturgy(date: String, lang: ServiceLanguage): LiturgicalService!

		# Tasbeha
		tasbeha(date: String, lang: ServiceLanguage): TasbehaService!
		sundayTasbeha(date: String, lang: ServiceLanguage): TasbehaService!
		tasbehaForDay(day: Weekday!, date: String, lang: ServiceLanguage): TasbehaService!
	}
`
