# Spanish Agpeya source

The generated Spanish Agpeya is imported from **El Agpeya: Libro de las Plegarias de las
Horas**, an edition of the Coptic Orthodox Cathedral of St. Mary and St. Mark in Santa Cruz,
Bolivia.

- Public document: https://es.scribd.com/document/609667600/El-Agpeya-Completo
- Extent: 91 two-column spreads
- Importer: `packages/data/scripts/import-spanish-agpeya.ts`
- Scope: Prime, Terce, Sext, None, Vespers, Compline, and all three Midnight watches

The importer reconstructs each spread by its positioned text coordinates so the left and right
pages do not interleave. Its printed Spanish psalms retain their Septuagint numbering and are
embedded in the generated Agpeya data; they are not substituted from the repository's
Reina-Valera Bible. Since the source does not print verse numbers, its continuous liturgical
paragraphs are preserved without invented verse labels.
