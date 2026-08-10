# Divine Liturgy (St. Basil) — Source

## Provenance

All liturgical text is imported from the [tasbeha.org hymn library](https://tasbeha.org/hymn_library/)
by `scripts/extract-liturgy.ts` (repo root). Each source page lays English, Unicode
Coptic, and Arabic out as parallel rows, and the importer parses them as aligned
triples so the three languages stay turn-by-turn identical.

To regenerate:

```bash
bun run scripts/extract-liturgy.ts        # all three languages
bun run scripts/extract-liturgy.ts cop    # one language only
```

Re-running regenerates every section's `content` from the source pages. Review the
git diff before committing, and verify with `pnpm --filter @coptic/data test`.

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
