# Service coverage

What each service actually contains today, what is missing from it, and which
services do not exist yet. Written to be honest rather than flattering — the point
is to know what a user would hit, not to look finished.

Last surveyed: 2026-07-31.

Where a gap is already pinned by a test or a source note, that is linked. Anything
marked **unverified** is an inventory judgement that no test enforces yet.

---

## Summary

| Service | Route | Languages | State |
|---|---|---|---|
| Agpeya (7 hours) | `/agpeya` | en, ar | Complete rite; 17 prose gaps in Arabic |
| Evening Raising of Incense | `/vespers` | en, ar, cop | Complete for Vespers; **Matins missing entirely** |
| Tasbeha (annual, 7 days) | `/tasbeha` | en, ar, cop | Annual cycle complete; seasonal cycles missing |
| Divine Liturgy of St. Basil | `/liturgy` | en, ar, cop | **Skeleton — roughly the second half of the rite** |
| Synaxarium | `/synaxarium` | en, ar | Complete daily cycle |
| Katameros readings | `/readings` | en, ar, es, cop | Complete daily cycle |

---

## Divine Liturgy of St. Basil — the least complete

33 sections. It carries the Anaphora well and the front of the Liturgy barely at
all, so it currently reads as "the Liturgy from the Thanksgiving Prayer onward"
rather than the Liturgy.

### What is present

The Liturgy of the Faithful is substantially there: Reconciliation, Anaphora,
Agios, Institution Narrative, Epiclesis, the Seven Short Litanies, Commemoration
of the Saints, Diptych, the Fraction and prayers after it, the Confession, and the
prayers through to Submission to the Father.

`pauline`, `catholic`, `praxis`, `daily-psalm` and `gospel` correctly carry no
stored text — the API resolves them from the day's Katameros at request time. An
empty `content` on those five is by design, not a gap.

### What is missing

**Everything before the Thanksgiving Prayer.** None of the following exists:

- Vesting and the Prayer of Preparation
- The Offering of the Lamb (Prothesis) — selection, procession, and the prayers at
  the altar
- Absolution of the Ministers
- The Offertory / Prospherin

**Most of the Liturgy of the Word:**

- The Pauline incense and procession, and the Pauline hymn
- Responses to the Catholic and the Praxis
- **The Synaxarium reading** — read after the Praxis. Notable because the
  Synaxarium data already exists in this repo and is served at `/synaxarium`; this
  is a wiring gap, not a data gap.
- The Three Great Litanies (peace, fathers, congregation). `litany-gospel` is
  present but is a different litany.
- The Prayer of the Veil
- The Aspasmos (Adam and Watos) and the Kiss of Peace

**In and after the Anaphora:**

- Congregation and deacon responses are thin. Across the whole service the text
  attributes 70 lines to the Priest, 53 to the People and 22 to the Deacon, with
  193 lines unattributed — in the celebrated rite the priest's prayers alternate
  with responses far more often than that. **Unverified**: no test asserts the
  expected alternation.
- Psalm 150 and the communion hymns
- The Blessing and Dismissal

### Language gaps

- `absolution-to-the-son` has **no Coptic**. The tasbeha.org Three Absolutions page
  carries no Coptic column. Pinned in `packages/data/src/__tests__/liturgy-parity.test.ts`
  so nobody "fixes" it by inventing text.
- **23 of 33 Coptic section titles fall back to English** (`titleLanguage: 'en'`).
  The prayer text is Coptic; only the headings are English.
- Coptic scripture depends on which books the Coptic Bible has. Epistles generally
  resolve; some psalms return a reference with no verses.

---

## Evening Raising of Incense (Vespers)

25 sections, all three languages, complete for the service it covers.

**Missing: the Morning Raising of Incense (Matins).** The data has exactly one
variant, `evening`. Matins is a distinct service prayed daily and is entirely
absent — arguably the single largest missing service in the app, since it is prayed
every morning.

Conditional blocks (`when` on dayTune, season, weekday, commemoration, feast) are
implemented and resolve at runtime, so the seasonal litanies work.

Per project notes, the **Arabic is the canonical Egyptian text and is solid; some
English translations are still being improved**.

---

## Agpeya

All seven hours, plus the three midnight watches. English and Arabic. The rite is
complete; the gaps are Arabic text that has no source yet.

**17 prose gaps**, all Arabic, regenerate the list with:

```bash
cd packages/data && bun scripts/agpeya-gap-report.ts
```

They cluster in two places — the litanies of every hour, and the closings:

```
prime.litanies, terce.litanies, terce.closing, sext.litanies, none.litanies,
vespers.litanies, vespers.closing, compline.litanies, compline.closing,
midnight.opening, midnight.closing,
midnight.{1,2,3}.litanies, midnight.{1,2,3}.closing
```

Psalm versification gaps: **0** — the psalter is aligned verse-for-verse between
English and Arabic.

**No Coptic Agpeya at all.** The hours exist only in English and Arabic.

---

## Tasbeha (Midnight Praises)

The annual weekly cycle is complete: seven services (Sunday through Friday Midnight
Praises, Saturday Vespers Praise), all three languages, 39 ordered sections on
Sunday plus 20 shared sections.

Missing, per `packages/data/src/en/tasbeha/CORPUS.md`:

- **Kiahk** — the month's own Psalmody. Roughly 20 unique texts (the site's 129
  count is mostly melody variants of the same 9 Theotokia parts).
- **Every seasonal cycle** — Great Lent, Resurrection, Theophany, Nativity, Hosanna
  Sunday, the 29th of the month, Annunciation, Ascension, Apostles. Not yet probed.
- Two Sunday pages still outstanding (Evol Hetin long form; the Year Round Canticle
  is a pointer page).

Known fidelity limit: **Arabic-only rows are dropped on import.** The Kiahk
Expositions carry long Arabic طرح prose with no English or Coptic parallel — one
page has ~1,900 characters of Arabic alone. The aligned-row schema requires all
three columns, so that text is discarded. Capturing it needs a per-language
optional-row model.

---

## The cross-cutting gap: everything here is the annual form

Counting missing *services* understates the distance. Every service implemented
above is its **annual (ordinary-time) form**. The tradition varies almost all of
them by season, feast and occasion, and that variation is largely absent:

- **Great Lent** changes the Liturgy's responses, the Psalmody, and the hours.
- **Kiahk** has its own Psalmody, its own vigil, and its own Liturgy responses.
- **Pascha and Holy Week** replace the ordinary rite outright.
- **The Resurrection through Pentecost** carries its own hymns and responses.
- **Each major feast** has proper doxologies, responses and hymns.
- **Commemorations** — the saint of the day changes doxologies and the Difnar.

The Incense service is the only one with a working conditional mechanism: its
sections carry `when` blocks keyed on dayTune, season, weekday, commemoration and
feast, resolved per request. Nothing else has it. The Liturgy, the Agpeya and the
Tasbeha all store a single fixed text.

So a realistic reading of coverage is: **the annual skeleton of four services, one
of which (the Liturgy) is itself half-built**, with seasonal resolution existing in
one service only. Closing the gap is less about importing more pages than about the
conditional-text model that lets one service render correctly across the year — see
the block schema and resolver work tracked as the core product problem.

---

## Services that do not exist at all

Ordered roughly by how often they are prayed.

| Service | Note |
|---|---|
| **Morning Raising of Incense (Matins)** | Prayed daily. The incense module has only `evening`. |
| **Liturgy of St. Gregory** | The second of the three Anaphoras, used on feasts. |
| **Liturgy of St. Cyril** | The third, used in Kiahk and Great Lent. |
| **Holy Week (Pascha)** | The largest single body of text in the tradition. |
| **Kiahk Psalmody and vigil** | See Tasbeha above. |
| **Doxologies and Difnar** | Per season and per saint of the day; drives much of the daily variation. |
| **Blessing of the Waters (Laqqan)** | Theophany, Great Friday, the Apostles' feast. |
| **Funeral rites** | Distinct rites for men, women, children, clergy, and by season. |
| **Baptism and Chrismation** | |
| **Matrimony** | Includes the betrothal and crowning rites. |
| **Unction of the Sick** | The seven prayers. |
| **Occasional prayers** | Travel, meals, the sick, blessing a home. |
| **Ordination and consecration rites** | Lowest priority — clergy-facing, rarely read by laity. |

---

## How to keep this honest

- Agpeya: `cd packages/data && bun scripts/agpeya-gap-report.ts` prints current gaps
  and the exact `KNOWN_PROSE_GAPS` block to paste into the parity test.
- Liturgy, Tasbeha, Incense: the parity tests in `packages/data/src/__tests__/`
  fail when languages drift out of alignment, and pin known source gaps explicitly.
- Anything above marked **unverified** has no test behind it. Prefer converting
  those into pinned test expectations over trusting this file.
