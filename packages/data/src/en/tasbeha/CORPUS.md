# Tasbeha.org corpus inventory

A survey of what Tasbeha.org actually holds for the Psalmody, and which pages are ready to import.
`SOURCE.md` documents what is *already* imported; this file is the backlog behind it.

Every page below was probed with the importer's own parallel-row extractor
(`packages/data/scripts/import-tasbeha.ts`), so the row counts are what the importer would produce,
not what the page appears to contain. Surveyed 2026-07-28.

## Reading the site

- Page: `https://tasbeha.org/hymn_library/view/<id>` — content lives in repeating
  `englishtext` / `coptictext_utf8` / `arabictext` column triplets.
- Category: `https://tasbeha.org/hymn_library/cat/<id>`.
- The library index (`/hymn_library/`) ships the **entire 239-category tree** inline as
  `d.add(id, parentId, 'title', '/hymn_library/cat/N', 'N hymns', …)` calls. Parsing that one page
  is far cheaper than crawling categories.
- `robots.txt` contains only explanatory comments about content signals — no `User-agent`,
  no `Disallow`, and no signal values are actually set.

Three page shapes recur, and the importer must distinguish them:

| Shape | Extracted rows | Handling |
|---|---|---|
| Parallel hymn | rows > 0 | Import normally |
| **Pointer page** | 0 | Body reads "can be found here:" and links another `view/` id. Alias to that page; do not add a definition |
| Transliteration tail | rows dropped | Latin-transliteration rows with empty Coptic/Arabic columns, appended after the real text. Already dropped correctly to preserve alignment |

## Tier 1 — the annual weekly cycle — IMPORTED

Took the annual Psalmody from Sunday-only to all seven days: 25 further content pages, 50 pages in
all across seven services. See `SOURCE.md` for the generated files and the order each service is
prayed in.

### Weekdays Theotokeias (cat 218)

| Page | Title | Rows |
|---|---|---|
| 353 | Monday Theotokia — Adam | 54 |
| 449 | Monday Theotokia Lobsh | 12 |
| 467 | Tuesday Theotokia — Adam | 55 |
| 468 | Tuesday Theotokia Lobsh | 8 |
| 469 | Wednesday Theotokia — Watos | 48 |
| 470 | Wednesday Theotokia Lobsh | 10 |
| 473 | Ti-galili-a (7th part of the Wednesday Theotokia) | 8 |
| 471 | Thursday Theotokia — Watos | 74 |
| 472 | Thursday Theotokia Lobsh | 10 |
| 146 | Friday Theotokia — Watos | 34 |
| 457 | Friday Theotokia Lobsh | 12 |

Pointer pages in this category — 655, 1930, 1931, 1932, 1933 — resolve to the Difnar
introductions, Theotokia conclusions, and concluding litany already imported for Sunday.

### Weekdays Psalies (cat 217)

| Page | Title | Rows |
|---|---|---|
| 352 | Monday Psali | 16 (+14 transliteration rows dropped) |
| 351 | Tuesday Psali | 6 |
| 356 | Wednesday Psali | 7 |
| 466 | Thursday Psali | 6 |
| 384 | Friday Psali | 6 |

### Vespers Praises — Saturday (cat 215)

Saturday evening Vespers Praise is a distinct Watos service, not a variant of Sunday.

| Page | Title | Rows |
|---|---|---|
| 454 | Ni-ethnos Teero — the beginning of the Vespers Praise | 4 |
| 1927 | The Fourth Hoos | pointer → 127 |
| 362 | Saturday Psali | 16 |
| 1928 | Introduction to the Watos Theotokias | 2 |
| 359 | Saturday Theotokia — Watos | 40 |
| 450 | Saturday Theotokia Lobsh — the Sherat | 26 |
| 656 | Difnar Introduction — Watos | 4 |
| 1929 | Conclusion of the Watos Theotokias | 13 |
| 1179 | Psali Watos for St. Mary — Tout 21 and the annual praise | 12 |

### Sunday gaps still in cat 216

| Page | Title | Rows | Note |
|---|---|---|---|
| 104 | The Hymn of the Resurrection — Tennav | 9 | Seasonal; belongs to the seasonal layer, not the annual order |
| 2170 | Evol Hetin — Long | 2 | |
| 2539 | The Year Round Canticle | pointer | |

Category 219 is St. Antony Monastery's *alternate English translation* of the same Sunday service —
a translation variant, not new content.

## Tier 2 — Kiahk (cat 33)

Kiahk advertises 129 hymns under Vespers Praises (cat 52), but that count is misleading:
**roughly 20 unique texts plus ~110 melody variants of the same 9 Theotokia parts.**

The variant axis is the tune — Roumi (Greek), Bohairic A/B, Moakab, Egyptian, Sahidic,
Ma'llem Abo El-Saad, Ma'llem Ghobrial A/B/C, Anba Markos, El-Bardanohe — applied to each of the
nine parts. Modeling that as a tune dimension over 9 parts, rather than 110 sections, is the
difference between a tractable import and an unusable one.

Unique Kiahk text:

| Page | Title | Rows |
|---|---|---|
| 1405 | **Order of the Kiahk Saturday Vespers Tasbeha** | rubric (English only) |
| 101 | Psali Watos (Amoini Teero) | 12 |
| 102 | Another Psali Watos | 16 |
| 1419 | Intro to the Watos Theotokias | 2 |
| 526–534 | The nine parts of the Saturday Theotokia | 4,4,4,4,4,7,4,5,4 |
| 657 | Intro to the Exposition — Watos | 2 |
| 658, 617, 659, 660 | Expositions for weeks 1–4 | 9, 5, 6, 7 |

Page 1405 is the prize: it is the authoritative running order for the whole Kiahk vespers service,
in sequence. It carries no parallel columns, so it must be read as a rubric and hand-encoded into
section ordering rather than imported as content.

Pointers in cat 52: 1418, 208, 612. Page 1422 is an Arabic *madeha* with no Coptic/English parallel.
Category 258 (Kiahk Midnight Psalmody, "7 & 4") holds a further 10 pages, not yet probed in detail.

## Tier 3 — seasonal Midnight Praises

Not yet probed; listed so the seasonal layer can be scoped later. Counts are the site's own.

| Cat | Season | Hymns |
|---|---|---|
| 82 | Great Lent — Midnight Praises | 17 |
| 300 | Great Lent — Vespers Praises | 10 |
| 306 | Resurrection to the 39th day — Midnight Praises | 5 |
| 89 | Resurrection — Midnight Tasbeha | 9 |
| 100 | Theophany — Midnight Tasbeha | 19 |
| 111 | Nativity — Vespers & Midnight Tasbeha | 15 |
| 85 | Hosanna Sunday — Vespers & Midnight Praise | 10 |
| 213 | 29th of every Coptic month | 8 |
| 94 | Annunciation — Vespers & Midnight Tasbeha | 5 |
| 97 | Ascension — Vespers & Midnight Tasbeha | 3 |
| 125 | Apostles — Vespers & Midnight Tasbeha | 2 |

## Known fidelity limits

- **Arabic-only rows are dropped.** The Kiahk Expositions carry a long Arabic prose طرح with no
  English or Coptic parallel (page 658 row 10 is ~1,900 characters of Arabic alone). Requiring all
  three columns keeps rows aligned but discards that text. Capturing it needs a per-language
  optional-row model, which the current aligned-row schema does not support.
- **Melody variants are text-identical across tunes.** Importing them as separate sections would
  inflate the corpus without adding text.
- Reuse terms for the Tasbeha.org translations still need confirming before redistribution — see
  the note at the end of `SOURCE.md`.
