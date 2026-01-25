export const typeDefs = /* GraphQL */ `
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
		type: String!
		isMoveable: Boolean
		month: String
	}

	type SynaxariumEntry {
		url: String!
		name: String!
		text: String
	}

	type Reading {
		reference: ReadingReference
		VPsalm: [ReadingDetail]
		VGospel: [ReadingDetail]
		MPsalm: [ReadingDetail]
		MGospel: [ReadingDetail]
		Pauline: [ReadingDetail]
		Catholic: [ReadingDetail]
		Acts: [ReadingDetail]
		LPsalm: [ReadingDetail]
		LGospel: [ReadingDetail]
		Synxarium: [SynaxariumEntry!]!
		celebrations: [Celebration]
		fullDate: CopticDate!
	}

	type ReadingReference {
		Day: String
		VPsalm: String
		VGospel: String
		MPsalm: String
		MGospel: String
		Pauline: String
		Catholic: String
		Acts: String
		LPsalm: String
		LGospel: String
		id: Int
	}

	type ReadingDetail {
		bookName: String
		chapter: Int
		verses: [Verse]
	}

	type Verse {
		verseNumber: Int
		text: String
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

	type SynaxariumSearchResult {
		date: String!
		copticDate: CopticDate!
		entry: SynaxariumEntry!
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
		copticDate(date: String): CopticDate!
		calendarMonth(year: Int!, month: Int!): CalendarMonth!

		# Readings
		readings(date: String, detailed: Boolean): Reading!

		# Celebrations
		allCelebrations: [Celebration!]!
		celebrationsForDate(date: String): [Celebration]
		upcomingCelebrations(days: Int): [UpcomingCelebration!]!

		# Fasting
		fastingForDate(date: String): FastingInfo!
		fastingCalendar(year: Int!): [FastingDay!]!

		# Synaxarium
		synaxariumForDate(date: String, detailed: Boolean): [SynaxariumEntry!]
		searchSynaxarium(query: String!, limit: Int): [SynaxariumSearchResult!]!
	}
`
