## Prompt

Add the remaining complete Bohairic Old Testament books available in the Coptic SCRIPTORIUM `bohairic.ot` corpus to the existing Coptic Bible bundle.

Books to import:

- Exodus
- Leviticus
- Numbers
- Deuteronomy
- Job
- Joel
- Obadiah
- Jonah
- Nahum
- Habakkuk
- Haggai

Requirements:

- Extend or generalize `packages/data/scripts/import-bohairic-psalms.cjs` into a reproducible Bohairic OT importer.
- Parse the corpus’s CoNLL-U files while excluding headings/superscriptions marked by `# text_en = ...`.
- Preserve the source chapter and verse numbering.
- Insert books into the correct canonical order in:
  - `packages/data/src/cop/canonical.json`
  - `packages/data/src/cop/canonical-ascii.json`
- Regenerate the ASCII bundle using `unicode-to-ascii-coptic.cjs`.
- Mark imported books as `bohairic` in `sources`.
- Remove imported books from `missingBooks`.
- Expand source attribution documentation for Coptic SCRIPTORIUM and its CC BY 4.0 license.
- Add integrity tests covering expected chapter counts, nonempty verses, canonical order, source metadata, and synchronized Unicode/ASCII bundles.
- Preserve existing local changes and avoid unrelated formatting churn.
- Run data, API, and web type-checks.
- Report which books remain unavailable afterward.