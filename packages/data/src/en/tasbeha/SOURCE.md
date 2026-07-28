# Sunday Midnight Praises source

The generated `sunday.json` files are imported from the parallel English, Coptic, and Arabic hymn rows in
Tasbeha.org's **Midnight Praises (Sunday)** library. The source is sponsored by St. Mark Coptic
Orthodox Church in Jersey City, New Jersey.

- Category/order: https://tasbeha.org/hymn_library/cat/216
- Importer: `packages/data/scripts/import-tasbeha.ts`
- Scope: the complete fixed annual Sunday/Adam sequence, including both Sunday psalies, the
  Sunday Theotokia, its Gospel, the Adam Difnar introduction, conclusion, concluding litany, and
  morning doxology
- Parts 16–18 carry an explicit `resurrection-through-hathor` eligibility marker and are resolved
  by the API for the requested date

The importer keeps each source row aligned across English, Coptic, and Arabic and records the exact page URL
on every section. It must be rerun to change generated text; do not hand-edit the JSON files.
The seasonal Resurrection canticle and other seasonal substitutions remain separate from this
annual service. They must not be merged into the annual order merely because Tasbeha.org lists them
in the same navigation category.

## Corroborating sources

- St-Takla Annual Psalmody, First Hoos: https://st-takla.org/Lyrics-Spiritual-Songs/Words-of-Coptic-Alhan-Tasbeha-Kodas/Arabic-Coptic-04-Epsalmodia-Tasbeha/Tasbe7a-Coptic-Transliteration-Annual-Psalmody/Praise-Epsalmodya-Tasbeha-004-Hoos-1.html
- St-Takla Annual Psalmody, First Hoos Lobsh: https://st-takla.org/Lyrics-Spiritual-Songs/Words-of-Coptic-Alhan-Tasbeha-Kodas/Arabic-Coptic-04-Epsalmodia-Tasbeha/Tasbe7a-Coptic-Transliteration-Annual-Psalmody/Praise-Epsalmodya-Tasbeha-005-Lobsh-First-Canticle.html
- Sunday Midnight Praise PDF (138 pages, including seasonal doxologies): https://www.saintjohnthebaptistcoptic.com/wp-content/uploads/2019/05/Sunday_Midnight_Praise.pdf

St-Takla is currently used to corroborate, not merge, its edition with the imported Tasbeha.org
edition. Before distributing this corpus beyond the project, confirm that the source translations'
reuse terms are compatible with the intended distribution.
