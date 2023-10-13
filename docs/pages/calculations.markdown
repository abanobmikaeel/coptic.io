---
layout: page
title: Calculations
permalink: /calculations/
nav_order: 4
---

# Calculations

Coptic IO Calculation

# How do we calculate easter?

See our implementation [here](https://github.com/abanobmikaeel/coptic.io/blob/main/utils/calculations/getEaster.ts)

## We use the Meeus's Julian algorithm

Jean Meeus, in his book Astronomical Algorithms (1991, p. 69), presents the following algorithm for calculating the Julian Easter on the Julian Calendar, which is not the Gregorian Calendar used as the civil calendar throughout most of the contemporary world. To obtain the date of Eastern Orthodox Easter on the latter calendar, 13 days (as of 1900 through 2099) must be added to the Julian dates, producing the dates below, in the last row.

| Variable                        | Expression               | Y=2008                     | Y=2009        | Y=2010        | Y=2011        | Y=2016        | Y=2021        |
| ------------------------------- | ------------------------ | -------------------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| a =                             | Y mod 4                  | 0                          | 1             | 2             | 3             | 0             | 3             |
| b =                             | Y mod 7                  | 6                          | 0             | 1             | 2             | 0             | 0             |
| c =                             | Y mod 19                 | 13                         | 14            | 15            | 16            | 2             | 9             |
| d =                             | (19c + 15) mod 30        | 22                         | 11            | 0             | 19            | 23            | 6             |
| e =                             | (2a + 4b - d + 34) mod 7 | 1                          | 4             | 0             | 1             | 4             | 6             |
|                                 | d + e + 114              | 137                        | 129           | 114           | 134           | 141           | 126           |
| month =                         | ⌊(d + e + 114)/31⌋       | 4                          | 4             | 3             | 4             | 4             | 4             |
| day =                           |                          | ((d + e + 114) mod 31) + 1 | 14            | 6             | 22            | 11            | 18            |
| Easter Day (Julian calendar)    |                          | 14 April 2008              | 6 April 2009  | 22 March 2010 | 11 April 2011 | 18 April 2016 | 19 April 2021 |
| Easter Day (Gregorian calendar) |                          | 27 April 2008              | 19 April 2009 | 4 April 2010  | 24 April 2011 | 1 May 2016    | 2 April 2021  |

[Excerpt from Wikipedia](https://en.wikipedia.org/wiki/Date_of_Easter#Meeus's_Julian_algorithm)
