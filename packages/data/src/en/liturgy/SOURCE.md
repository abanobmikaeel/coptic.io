# Divine Liturgy (St. Basil) — Source

## Provenance

All liturgical text is imported from the [tasbeha.org hymn library](https://tasbeha.org/hymn_library/)
by `packages/data/scripts/extract-liturgy.ts`. Each source page lays English, Unicode
Coptic, and Arabic out as parallel rows, and the importer parses them as aligned
triples so the three languages stay turn-by-turn identical.

To regenerate:

```bash
cd packages/data
bun run scripts/extract-liturgy.ts        # all three languages
bun run scripts/extract-liturgy.ts cop    # one language only
```

Re-running regenerates every section's `content` from the source pages. Review the
git diff before committing, and verify with `pnpm --filter @coptic/data test`.

**Regenerate only the sections you are changing** — `bun run scripts/extract-liturgy.ts
--only trisagion,gospel-response` — and every other section is carried over unchanged.
tasbeha.org moved to a word-synced page layout in 2026 (parsed by
`scripts/lib/tasbeha-rows.ts`), and some pages imported here came out of the move
damaged; a full run would overwrite good text with them. See *Source regressions* below.

## Source pages

| Section | Page |
|---|---|
| Thanksgiving Prayer | [view/1833](https://tasbeha.org/hymn_library/view/1833) |
| Absolution to the Son (trimmed from The Three Absolutions) | [view/2594](https://tasbeha.org/hymn_library/view/2594) |
| Trisagion | [view/1836](https://tasbeha.org/hymn_library/view/1836) |
| Litany for the Gospel | [view/1842](https://tasbeha.org/hymn_library/view/1842) |
| Gospel Response | [view/1843](https://tasbeha.org/hymn_library/view/1843) |
| Introduction to the Creed | [view/1837](https://tasbeha.org/hymn_library/view/1837) |
| Orthodox Creed | [view/1852](https://tasbeha.org/hymn_library/view/1852) |
| Prayer of Reconciliation | [view/2035](https://tasbeha.org/hymn_library/view/2035) |
| Anaphora | [view/2038](https://tasbeha.org/hymn_library/view/2038) |
| Agios | [view/2039](https://tasbeha.org/hymn_library/view/2039) |
| Was Incarnate | [view/2040](https://tasbeha.org/hymn_library/view/2040) |
| He Rose from the Dead | [view/2041](https://tasbeha.org/hymn_library/view/2041) |
| Institution Narrative | [view/2042](https://tasbeha.org/hymn_library/view/2042) |
| Descent of the Holy Spirit | [view/2043](https://tasbeha.org/hymn_library/view/2043) |
| Seven Short Litanies | [view/2044](https://tasbeha.org/hymn_library/view/2044) |
| Commemoration of the Saints | [view/2045](https://tasbeha.org/hymn_library/view/2045) |
| Diptych | [view/2046](https://tasbeha.org/hymn_library/view/2046) |
| Those, O Lord | [view/2047](https://tasbeha.org/hymn_library/view/2047) |
| Lead Us | [view/2048](https://tasbeha.org/hymn_library/view/2048) |
| Introduction to the Fraction | [view/2051](https://tasbeha.org/hymn_library/view/2051) |
| The Fraction | [view/2052](https://tasbeha.org/hymn_library/view/2052) |
| Prayers after the Fraction | [view/2053](https://tasbeha.org/hymn_library/view/2053) |
| The Confession | [view/2054](https://tasbeha.org/hymn_library/view/2054) |
| Prayers before the Distribution | [view/2596](https://tasbeha.org/hymn_library/view/2596) |
| Thanksgiving after Communion | [view/2597](https://tasbeha.org/hymn_library/view/2597) |
| Prayer of Submission to the Father | [view/2598](https://tasbeha.org/hymn_library/view/2598) |

## Festal variants

The Trisagion and the Gospel Response are first-match (`mode: 'one'`) sections: the
blocks below are tried in order, and the annual text above is the default. Seasons come
from `getFestalSeason` in `@coptic/core`; feast keys are the day's celebrations as
`apps/api/src/services/occasion.ts` names them.

| Section | When | Page |
|---|---|---|
| Trisagion | Nativity season (Kiahk 29 – Tobi 6) | [view/1428](https://tasbeha.org/hymn_library/view/1428) |
| Trisagion | Theophany season (Tobi 11–13) | [view/1634](https://tasbeha.org/hymn_library/view/1634) |
| Trisagion | Resurrection to the 39th day | [view/1011](https://tasbeha.org/hymn_library/view/1011) |
| Trisagion | Ascension to Pentecost | [view/1030](https://tasbeha.org/hymn_library/view/1030) |
| Gospel Response | Circumcision (`circumcision-feast`) | [view/669](https://tasbeha.org/hymn_library/view/669) |
| Gospel Response | Cana of Galilee (`wedding-of-cana-of-galilee-feast`) | [view/1651](https://tasbeha.org/hymn_library/view/1651) |
| Gospel Response | Pentecost (`pentecost`) | [view/415](https://tasbeha.org/hymn_library/view/415) |
| Gospel Response | Nativity season | [view/89](https://tasbeha.org/hymn_library/view/89) |
| Gospel Response | Theophany season | [view/117](https://tasbeha.org/hymn_library/view/117) |
| Gospel Response | Cross (Tout 17–19, Paremhat 10) | [view/165](https://tasbeha.org/hymn_library/view/165) |
| Gospel Response | Resurrection to the 39th day | [view/376](https://tasbeha.org/hymn_library/view/376) |
| Gospel Response | Ascension to Pentecost | [view/404](https://tasbeha.org/hymn_library/view/404) |

How the pages are composed, so the result stays traceable to the source:

- **Trisagion.** The festal pages carry only the verse that changes, prayed thrice; from
  the Doxa on, the importer appends the annual hymn from view/1836. The Nativity page
  writes the verse out three times; the importer collapses it to one line marked
  "(3)", as the other festal pages write it.
- **Gospel Response.** The two closing doxology stanzas ("This is He who is worthy of
  glory…", "For blessed be the Father…") are common to every feast, and several pages
  abbreviate them or leave a language blank. An incomplete copy, matched by its Coptic
  incipit, is replaced with the full stanza from view/89 and view/1843 respectively.
  Pages that omit a stanza entirely are left as the source gives them: the Cross page
  carries only its own stanza, and the Resurrection and Pentecost pages end at "This is
  He…".
- The Cross has no festal Trisagion page, so the annual one is kept at the Cross.

## Derived sections

- `lord-prayer-post-trisagion` and `lords-prayer` are derived from the Thanksgiving
  Prayer's Lord's Prayer lines (same approach as the incense data).
- `pauline`, `catholic`, `praxis`, `daily-psalm`, and `gospel` carry no text — the API
  resolves them from the day's Katameros readings at runtime.

## Known source gaps

- **The Offertory is partial.** `offering-of-the-lamb` is titled "(Response)" because
  the source page carries only the congregation's sung Alleluia — the priest's prayers
  over the selection of the lamb are not on it, and are still missing.
- **Two Offertory pages are held back.** Their language columns have different row
  counts, so importing them would misalign the reader: 1959 *Shere Maria Tee-oro*
  (en=10, cop=10, ar=17) and 1965 *Alleluia Je Efmevee* (en=2, cop=1, ar=1). They need
  the rows reconciled against the source by hand.
- **Deacon responses (cat 223) are excluded on purpose.** Which response is sung
  depends on season and occasion, so they belong to the conditional-block model rather
  than a flat import.
- Some Coptic pages carry the prayer text without a speaker label where English and
  Arabic label it. The parity test compares row counts always but speaker attribution
  only where the source labels at all — the alternative would be inventing rubric.

- The Three Absolutions page has no Coptic column, so `absolution-to-the-son` is
  English/Arabic only. The parity test pins this so nobody "fixes" it by inventing
  Coptic text.
- Coptic section titles fall back to English (`titleLanguage: 'en'`) except where a
  verified Coptic title already existed in the incense data.

## Source regressions (2026 relayout)

Found when re-running the importer against the new layout. The current data predates
the move and is kept; these pages must not be re-imported until they are fixed upstream
or reconciled by hand:

- **view/2594, The Three Absolutions** (`absolution-to-the-son`): prayer paragraphs are
  marked as speaker cues, and speaker labels disagree across columns (English "Deacon:"
  beside Coptic and Arabic "Priest:"). Re-importing empties the section.
- **view/2044, Seven Short Litanies** (`seven-litanies`): truncated to 15 paragraphs
  against the 57 lines in the current data.
- **view/1962, Kyrie Eleison** (`offertory-kyrie-eleison`): the priest's petition is gone;
  only the label "Priest:" remains. The current data carries the petition, mislabeled as
  a rubric.
- `offertory-kyrie-eleison` also ends with the Lord's Prayer abbreviated as "Our Father
  Who art in heaven ...", as the source prints it.
