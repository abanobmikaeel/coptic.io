# Bohairic Psalms

The `Psalms` book in `canonical.json` is derived from the Coptic SCRIPTORIUM
`bohairic.ot` corpus, release 6.0.0.

- Work: `urn:cts:copticLit:ot.pss`
- Source: Marcion and Hany Takla
- Editors/annotators: Coptic SCRIPTORIUM contributors
- License: Creative Commons Attribution 4.0 International (CC BY 4.0)
- Corpus: https://github.com/CopticScriptorium/corpora/tree/master/bohairic.ot

The source uses Septuagint numbering and includes Psalms 1-151. Import with:

```sh
node packages/data/scripts/import-bohairic-psalms.cjs /path/to/bohairic.ot_CONLLU
```

The importer stores the corpus text directly as Unicode Coptic in `canonical.json`.
Do not convert it to a legacy font-specific ASCII encoding.
