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
	}
`
