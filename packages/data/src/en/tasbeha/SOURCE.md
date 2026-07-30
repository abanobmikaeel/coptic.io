# Annual Psalmody source

The generated `sunday.json` … `saturday.json` files are imported from the parallel English, Coptic,
and Arabic hymn rows in Tasbeha.org's **Psalmody** library. The source is sponsored by St. Mark
Coptic Orthodox Church in Jersey City, New Jersey.

- Categories: [216 Midnight Praises (Sunday)](https://tasbeha.org/hymn_library/cat/216),
  [218 Weekdays Theotokeias](https://tasbeha.org/hymn_library/cat/218),
  [217 Weekdays Psalies](https://tasbeha.org/hymn_library/cat/217),
  [215 Vespers Praises (Saturday)](https://tasbeha.org/hymn_library/cat/215)
- Importer: `packages/data/scripts/import-tasbeha.ts`
- Corpus survey and remaining backlog: `CORPUS.md`
- Scope: the complete fixed annual cycle for all seven days — 50 source pages across 7 services

## The seven services

Sunday through Friday are Midnight Praises. **Saturday is a Vespers Praise**, prayed on Saturday
evening: it omits the four canticles and the morning doxology. Its order is attested by
Tasbeha.org's Kiahk order-of-service page (`view/1405`), which lays out the same frame — Psalm 116,
the Fourth Hoos, the psali, the Theotokia with its Sherat, then the conclusion.

Every Midnight Praise shares one annual frame and swaps in that day's **proper psali and
Theotokia** (with that Theotokia's lobsh). The frame's Theotokia introduction, Difnar introduction
and conclusion follow the day's tune: **Adam Sunday–Tuesday, Watos Wednesday–Saturday**, matching
`getDayTune` in `@coptic/core`.

Sunday is the exception in shape rather than in frame: its propers are two psalies and an
eighteen-part Theotokia whose Gospel sits between the sixth and seventh parts, so it has no single
lobsh. Parts 16–18 carry an explicit `resurrection-through-hathor` eligibility marker and are
resolved by the API for the requested date — the only date-limited sections in the corpus.

## How the files are laid out

Most of the annual Psalmody is prayed on more than one day — the four canticles, the
Commemoration of the Saints and the morning doxology are identical Sunday through Friday. Storing
each day as a self-contained service duplicated that frame seven times over, so the generated files
are deduplicated instead:

- **`common.json`** — the 20 sections prayed by more than one service, keyed by id.
- **`{day}.json`** — the service's metadata, its `order` (every section id in prayed sequence), and
  only the sections *proper to that day*.

A day file therefore reads as the rite itself, with its own text inline:

```jsonc
{
  "id": "monday-midnight-praises",
  "rite": { "cycle": "annual", "dayTune": "adam", "weekdays": [1] },
  "order": ["ten-theno", "first-hoos", …, "monday-psali", "monday-theotokia", …],
  "sections": [ /* monday-psali, monday-theotokia, monday-theotokia-lobsh */ ]
}
```

The per-language `index.ts` composes the two back into a `TasbehaServiceData` at load time,
resolving each `order` id against the day's own propers first and then `common.json`, and caching
the result per service. Consumers are unaffected: `getTasbehaService()` and
`getTasbehaServiceForWeekday()` still return fully-resolved services with every section inline.

This cut the generated corpus from about 1.5 MB to 566 KB. Tests in
`src/__tests__/tasbeha-parity.test.ts` assert the invariants — nothing stored in both places,
nothing shared left in a day file, nothing unresolved or unused — so a future import cannot quietly
reintroduce the duplication.

## Regenerating

The importer keeps each source row aligned across English, Coptic, and Arabic and records the exact
page URL on every section. It must be rerun to change generated text; do not hand-edit the JSON
files. Because the annual frame is shared, each page is fetched once and reused across the services
that pray it. Rerunning rewrites `accessedAt` on every section, so expect that field to churn.

Two source-page shapes need care, both documented with page ids in `CORPUS.md`: **pointer pages**
that only cross-reference another page yield zero rows and must not be given definitions, and
**transliteration tails** whose Coptic and Arabic columns are empty are dropped to preserve row
alignment.

Seasonal substitutions remain separate from these annual services — the Resurrection canticle
(`view/104`) among them. They must not be merged into the annual order merely because Tasbeha.org
lists them in the same navigation category.

## Corroborating sources

- St-Takla Annual Psalmody, First Hoos: https://st-takla.org/Lyrics-Spiritual-Songs/Words-of-Coptic-Alhan-Tasbeha-Kodas/Arabic-Coptic-04-Epsalmodia-Tasbeha/Tasbe7a-Coptic-Transliteration-Annual-Psalmody/Praise-Epsalmodya-Tasbeha-004-Hoos-1.html
- St-Takla Annual Psalmody, First Hoos Lobsh: https://st-takla.org/Lyrics-Spiritual-Songs/Words-of-Coptic-Alhan-Tasbeha-Kodas/Arabic-Coptic-04-Epsalmodia-Tasbeha/Tasbe7a-Coptic-Transliteration-Annual-Psalmody/Praise-Epsalmodya-Tasbeha-005-Lobsh-First-Canticle.html
- Sunday Midnight Praise PDF (138 pages, including seasonal doxologies): https://www.saintjohnthebaptistcoptic.com/wp-content/uploads/2019/05/Sunday_Midnight_Praise.pdf

St-Takla is currently used to corroborate, not merge, its edition with the imported Tasbeha.org
edition. Before distributing this corpus beyond the project, confirm that the source translations'
reuse terms are compatible with the intended distribution.
