---
layout: page
title: API Reference
permalink: /api-reference/
nav_order: 3
---

# API Reference

## Readings

### `GET /api/readings`

Retrieves Coptic liturgical readings and references for the current date.

#### Example Response

```json
{
	"references": {
		"vPsalm": "Psalms 110:4;Psalms 110:7",
		"vGospel": "Matthew 16:13-19",
		"mPsalm": "Psalms 73:23-24;Psalms 73:28;Psalms 9:14",
		"mGospel": "John 15:17-25",
		"pauline": "2 Corinthians 4:5-18;2 Corinthians 5:1-11",
		"catholic": "1 Peter 2:18-25;1 Peter 3:1-7",
		"acts": "Acts 20:17-38",
		"lPsalm": "Psalms 107:32;Psalms 107:41-42",
		"lGospel": "John 10:1-16",
		"synxarium": [
			{
				"url": "https://www.copticchurch.net/synaxarium/2_2.html?lang=en#1",
				"name": "The Coming of Saint Severus, Patriarch of Antioch, to Egypt"
			}
		]
	},
	"celebrations": null,
	"fullDate": {
		"dateString": "Baba 2, 1740",
		"day": 2,
		"month": 2,
		"year": 1740,
		"monthString": "Baba"
	}
}
```

Example Usage:

```javascript
const response = await fetch('/api/readings')
const data = await response.json()
```

---

### `GET /api/readings/date=MM-dd-YYYY&detailed=false`

Retrieves Coptic liturgical readings and references for the specified date.

#### Parameters:

- `date` (Optional): The Gregorian date in the format `YYYY-MM-DD`.
- `detailed` (Optional): Set to `'true'` to include detailed readings text.

#### Example Response

```json
{
	"references": {
		"vPsalm": "Psalms 110:4;Psalms 110:7",
		"vGospel": "Matthew 16:13-19",
		"mPsalm": "Psalms 73:23-24;Psalms 73:28;Psalms 9:14",
		"mGospel": "John 15:17-25",
		"pauline": "2 Corinthians 4:5-18;2 Corinthians 5:1-11",
		"catholic": "1 Peter 2:18-25;1 Peter 3:1-7",
		"acts": "Acts 20:17-38",
		"lPsalm": "Psalms 107:32;Psalms 107:41-42",
		"lGospel": "John 10:1-16",
		"synxarium": [
			{
				"url": "https://www.copticchurch.net/synaxarium/2_2.html?lang=en#1",
				"name": "The Coming of Saint Severus, Patriarch of Antioch, to Egypt"
			}
		]
	},
	"celebrations": null,
	"fullDate": {
		"dateString": "Baba 2, 1740",
		"day": 2,
		"month": 2,
		"year": 1740,
		"monthString": "Baba"
	}
}
```

Example Usage:

```javascript
const response = await fetch('/api/readings/2023-10-12&detailed=true')
const data = await response.json()
```

## Calendar
