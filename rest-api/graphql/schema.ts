const { buildSchema } = require('graphql')

const schema = buildSchema(`
  type SynxariumEntry {
    url: String,
    name: String
  }
  type CopticDate {
    dateString: String,
		day: Int,
		month: Int,
		year: Int,
		monthString: String
  }

  type Reading {
    vPsalm: String
    vGospel: String,
    mPsalm: String,
    mGospel: String,
    pauline: String,
    catholic:  String,
    acts: String,
    lPsalm:  String,
    lGospel: String,
    copticDate: CopticDate,
    synxarium: [SynxariumEntry]
  }

  type Query {
    getReferences(date: String): Reading
  }
`)

export default schema
