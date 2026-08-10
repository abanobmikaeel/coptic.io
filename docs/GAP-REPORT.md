# Gap report — what stands between us and complete liturgical coverage

A backlog, not a status page. [COVERAGE.md](COVERAGE.md) says what each service
holds today; this says what is missing, how big each piece is, and whether a
source exists for it.

Surveyed 2026-07-31. Source counts come from the Tasbeha.org hymn library index,
whose category tree ships inline on `/hymn_library/` — 209 categories, parseable in
one request. Counts are the site's own hymn counts, not row counts, so treat them
as scope signals rather than exact work estimates.

---

## Part 1 — gaps inside what we already ship

### Agpeya — the English is the incomplete side

**This corrects an earlier reading.** The 17 prose gaps are not missing Arabic. In
13 of 17 the Arabic is the fuller text and the **English is a stub**:

| Section | English lines | Arabic lines |
|---|---|---|
| `prime.litanies` | 5 | 19 |
| `terce.litanies` | 4 | 25 |
| `sext.litanies` | 4 | 26 |
| `none.litanies` | 4 | 28 |
| `vespers.litanies` | 4 | 17 |
| `compline.litanies` | 4 | 16 |
| `midnight.opening` | 3 | 6 |
| `midnight.closing` | 1 | 24 |
| `midnight.{1,2,3}.litanies` | 3 | 18 / 18 / 21 |

Only four go the other way — `midnight.{1,2,3}.closing` have **no Arabic at all**
(`ar=0`) — plus three closings where Arabic is one line against two or three
(`terce`, `vespers`, `compline`).

So the Agpeya's remaining work is mostly **translating the Arabic litanies and the
midnight closing into English**, not sourcing Arabic. The rite itself is complete:
all seven hours, all three midnight watches, and **0 psalm versification gaps** —
the psalter aligns verse-for-verse.

**No Coptic Agpeya exists.** The hours are English and Arabic only, and no Coptic
Agpeya has been sourced. This is the largest single hole in the Agpeya.

Regenerate the list: `cd packages/data && bun scripts/agpeya-gap-report.ts`

### Divine Liturgy — the front half is missing

We hold roughly the Anaphora onward. Absent:

| Missing | Source |
|---|---|
| The Offering of the Lamb (Prothesis), vesting, Absolution of the Ministers | cat 222 "The Offertory تقديم الحمل" |
| Pauline procession and hymn, the Three Great Litanies, Prayer of the Veil, Aspasmos | cat 204 "The Liturgy of the Word" |
| Communion hymns, Psalm 150, the Blessing and Dismissal | cat 205 "The Liturgy of the Believers" |
| Deacon responses throughout | cat 227 — 29 hymns |
| **The Synaxarium reading** | **none needed** — the data already ships at `/synaxarium`; this is wiring |

Also: `absolution-to-the-son` has no Coptic (the source page carries no Coptic
column — pinned in the parity test), and 23 of 33 Coptic section titles fall back
to English.

### Evening Incense — Matins is absent

The module has one variant, `evening`. The Morning Raising of Incense is prayed
daily and does not exist. Source: **cat 83, "Raising Incense of Matins & Vespers",
17 hymns** — the same category we already drew Vespers from, so the sourcing
pattern is proven.

### Tasbeha — annual only

Complete for the annual weekly cycle in all three languages. Missing: Kiahk
(cat 33), and every seasonal cycle — Great Lent, Resurrection, Theophany,
Nativity, Hosanna Sunday, the 29th of the month, Annunciation, Ascension, Apostles.
Also "Midnight Psalmody — 7 & 4" (cat 258, 10 hymns).

Known import limit: **Arabic-only rows are dropped**, because the aligned-row
schema requires all three columns. The Kiahk Expositions carry long Arabic طرح
prose with no English or Coptic parallel — one page has ~1,900 characters of Arabic
that we discard. Fixing this needs a per-language optional-row model.

---

## Part 2 — services we do not have

Ordered by how often they are prayed, with source availability.

### Prayed daily or weekly

| Service | Source | Scope |
|---|---|---|
| **Morning Raising of Incense (Matins)** | cat 83 | 17 hymns |
| **Doxologies** (seasonal and per-saint) | cat 40, 71 | Drives much of the daily variation |
| **Liturgy of St. Gregory** | cat 209 | 20 hymns |
| **Liturgy of St. Cyril** | cat 210 | 32 hymns |

The two extra Anaphoras are the cheapest large win: the Liturgy shell already
exists, and Gregory and Cyril differ from Basil mainly in the Anaphora itself.

### Seasonal

| Service | Source | Note |
|---|---|---|
| **Holy Pascha Week** | cat 38 | The largest single body of text in the tradition |
| **Great Lent** | cat 37 | Own hymns plus rite changes to existing services |
| **Kiahk** | cat 33 | Psalmody, vigil, and Liturgy responses |

### Sacraments and occasional rites

| Service | Source | Scope |
|---|---|---|
| **Holy Matrimony (Crowning)** | cat 235 | 41 hymns |
| **Unction of the Sick (Andeel)** | cat 236 | 37 hymns |
| **The Sagda (Prostrations)** | cat 237 | 29 hymns — prayed at Pentecost |
| **General Funeral** | cat 86, 118 | 1 + 11 hymns; the tradition has separate rites per category of departed |
| **Consecrations** | cat 316 | Churches, altars, vessels |
| **Preparation of the Holy Myron** | cat 299 | Rare; patriarchal |

### Not available from this source

**Baptism and Chrismation.** The category tree has no baptism entry — zero matches
across all 209 categories. It sits under "Other Liturgical & Sacramental Services"
alongside Matrimony and Unction in the tradition, but the source does not carry it.
Sourcing it means finding another text, not another import run. The same likely
applies to Ordination.

---

## Part 3 — the gap that is not a content gap

Every service we ship is its **annual form**. The tradition varies nearly all of
them by season, feast and commemoration, and only the Incense service can express
that: its sections carry `when` blocks keyed on dayTune, season, weekday,
commemoration and feast, resolved per request. The Liturgy, Agpeya and Tasbeha each
store one fixed text.

This matters for sequencing. Importing Kiahk or Lent as *separate services* would
duplicate the annual text with small deltas and multiply the maintenance surface.
The conditional-text model — blocks plus a resolver — is what lets one service
render correctly across the year, and it should land before the seasonal imports,
not after.

---

## Suggested order

1. **Matins incense** — daily, proven sourcing pattern, one category.
2. **Agpeya English litanies** — translation of text we already hold, no new source.
3. **Liturgy front half** — Offertory and Liturgy of the Word; makes `/liturgy` a
   complete service rather than a partial one, and wires in the Synaxarium reading
   we already have.
4. **Conditional-text model** — before any seasonal import.
5. **St. Gregory and St. Cyril** — reuse the Liturgy shell.
6. **Seasonal cycles** — Kiahk, Great Lent, Pascha, on top of the model from 4.
7. **Sacraments** — Matrimony, Unction, Sagda, Funeral.
8. **Baptism** — blocked on finding a source.

---

## Keeping this current

- Agpeya: `cd packages/data && bun scripts/agpeya-gap-report.ts` regenerates the
  gap list and the exact allowlist block for `agpeya-parity.test.ts`.
- There is **no equivalent report for the Liturgy, Tasbeha or Incense**. Their gaps
  live in prose across `SOURCE.md`, `CORPUS.md` and pinned sets inside the parity
  tests, which is why assembling this took a survey. Porting the Agpeya script's
  pattern — report, then paste into a ratcheting allowlist — to the other three
  would make most of this file generated rather than hand-maintained.
- The source category tree can be re-read in one request from
  `https://tasbeha.org/hymn_library/`; the tree is inline in the page.
