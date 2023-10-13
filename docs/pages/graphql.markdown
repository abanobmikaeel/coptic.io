---
layout: page
permalink: /graphql/
title: GraphQL
nav_order: 5
---

## GraphQL

#### The API supports GraphiQL for easier utilization of graphql required fields

**Route: /graphql**

```graphql
query {
	getReferences(date: "02-12-2023") {
		pauline
		catholic
		acts
		vPsalm
		vGospel
		mPsalm
		mGospel
		lPsalm
		lGospel
		copticDate {
			dateString
			day
			month
			year
			monthString
		}
		synxarium {
			name
			url
		}
	}
}
```
