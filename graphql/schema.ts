const { buildSchema } = require('graphql')

const schema = buildSchema(`
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
    copticDate: CopticDate
  }

  type Query {
    getReferences(date: String): Reading
  }
`)

export default schema
