# Divine Liturgy — rite structure and conditionals

The canonical order of the Liturgy of St. Basil, and the points where the rite
branches, taken from the *St. Basil Liturgy Reference Book* (ed. Fr. Abraam D.
Sleman, CopticChurch.net, Preparatory Edition 2007). Page numbers below refer to
that book.

**Structure only — no text is imported from it.** Its English is older than the
tasbeha.org parallel text we import, and the reference book interleaves commentary
with the prayers. Text keeps coming from `SOURCE.md`; this file records the *order*
and the *conditions*, which the parallel source does not state.

Used with the editor's permission.

---

## The order, against what we ship

`✓` present · `—` missing · `~` present but partial

### Part I — The Offertory (pp. 6–29)

| ✓ | Rite | Our section | Book |
|---|---|---|---|
| — | Getting dressed; preparing the altar | | 7, 9 |
| — | The Prayer of Preparation | | 10 |
| — | Prayer after the Preparation | | 12 |
| — | The Canonical Hours (which hours — **conditional**) | | 13 |
| — | The Hand Washing | | 13 |
| ✓ | The Orthodox Creed (said here, again later) | `creed` | 14 |
| — | **The Rite of Choosing the Lamb** | | 16 |
| — | **The Procession of the Lamb** | | 18 |
| — | **The Lamb's Blessings** (**conditional**, 3 branches) | | 20 |
| ~ | Offertory hymns and responses | `offertory-*` | 22 |
| — | The Opening Greeting (**conditional** on concelebrants) | | 23 |
| ✓ | The Prayer of Thanksgiving | `offertory-thanksgiving` | 24 |
| — | The Prayer of the Offertory | | 27 |

### Part II — The Liturgy of the Catechumens (pp. 30–79)

| ✓ | Rite | Our section | Book |
|---|---|---|---|
| ✓ | The Absolution to the Son | `absolution-to-the-son` | 31 |
| ✓ | The Absolution of the Ministers | `absolution-of-the-servants` | 32 |
| ✓ | The Pauline Epistle | `pauline` | 35 |
| — | The Pauline Epistle Prayer; **Procession of the Pauline Incense** | | 35, 36 |
| — | The People's Confession; Hymn of the Censer | | 41, 42 |
| — | **The Hymn of the Intercessions** (**conditional**, 3 branches) | | 43 |
| — | Inaudible Prayer of the Pauline | | 45 |
| ✓ | The Catholic Epistle | `catholic` | 47 |
| — | Inaudible Prayer of the Catholic | | 47 |
| ✓ | The Acts of the Apostles (Praxis) | `praxis` | 48 |
| — | Praxis Inaudible Prayer; **Procession of the Praxis Incense** | | 49 |
| — | **The Sinaxarium** — read here | *(data exists at `/synaxarium`)* | 54 |
| ✓ | The Hymn of the Trisagion | `trisagion` | 55 |
| ✓ | The Litany of the Gospel | `litany-gospel` | 57 |
| ✓ | Reciting the Psalm and the Gospel | `daily-psalm`, `gospel` | 59 |
| — | The Inaudible Prayer of the Gospel | | 61 |
| — | The Sermon | | 64 |
| — | **The Prayer of the Veil** | | 65 |
| — | **The Litany of the Peace** | | 66 |
| — | **The Litany of the Fathers** | | 68 |
| — | The Litany of the Congregation | | *TOC* |
| ✓ | The Orthodox Creed | `creed` | 72 |
| — | Washing the Hands (pre-Anaphora) | | 74 |
| ✓ | The Prayer of Reconciliation | `reconciliation` | 75 |
| — | **The Apostolic Kiss** (Aspasmos — **conditional**) | | 78 |

### Part III — The Liturgy of the Faithful (pp. 80–134)

| ✓ | Rite | Our section | Book |
|---|---|---|---|
| ✓ | The Anaphora — "The Lord is with you", "Worthy and Just" | `anaphora` | 80, 82 |
| ✓ | The Sanctus | `agios` | 83 |
| ✓ | The Institution Narrative | `institution` | 88 |
| ✓ | The Anamnesis | `was-incarnate`, `he-rose` | 93 |
| ✓ | The Epiclesis | `epiclesis` | 94 |
| ✓ | The Seven Litanies | `seven-litanies` | 97–104 |
| ✓ | Commemoration of the Saints | `commemoration-saints` | 104 |
| ✓ | The Diptych | `diptych` | 107 |
| ✓ | Prayers before the Fraction | `intro-fraction` | 109 |
| ✓ | Prayer of the Fraction (**conditional** — see Part VI) | `fraction` | 112 |
| ✓ | The Lord's Prayer | `lords-prayer` | 115 |
| ✓ | Prayer of Submission | `prayer-of-submission` | 117 |
| — | Absolution to the Father | | 118 |
| ✓ | The Confession | `confession` | 121–124 |
| ~ | The Holy Communion | `prayers-before-distribution` | 125 |
| — | **Communion Praises; Psalm 150** | | 127 |
| ✓ | Prayer after Communion | `thanksgiving-after-communion` | 128 |
| — | **The Dismissal** — Laying of Hands; the Ending Blessing (**conditional**) | | 129, 131 |

---

## Conditionals

Where the rite branches. This is the part the parallel source does not give us, and
the reason deacon responses and doxologies are blocked.

### 1. Fraction prayers by occasion (pp. 135–155)

The book devotes a whole part to it — **13 fraction prayers**, selected by occasion:

| # | Occasion | Page |
|---|---|---|
| 2 | Theophany | 136 |
| 3 | The Great Lent | 136 |
| 4 | Palm Sunday | 138 |
| 5 | Holy Thursday | 138 |
| 6 | The Great Saturday | 141 |
| 7 | Easter through Pentecost | 143 |
| 8 | The Lord's Feasts | 144 |
| 9 | The Apostles | 146 |
| 10 | The Holy Virgin and the Angels | 147 |
| 11–13 | To the Son (incl. from St. Cyril's and the Gregorian liturgies) | 149–155 |

We ship exactly one `fraction`. This is the cleanest first target for the
conditional-block model: a bounded, enumerated set with the selection rule stated.

### 2. Season and day of week

| Rite | Branches | Page |
|---|---|---|
| The Canonical Hours before the Liturgy | which hours are prayed differs during fasts, and again during Great Lent | 13 |
| The Lamb's Blessings | Sundays / feasts / Pentecostal period · fasting and week days · Great Lent | 20 |
| The Hymn of the Intercessions | weekday fasts, Saturdays and Sundays of Great Lent, and feasts of the Cross take one text; **weekdays of Great Lent take another** | 43 |
| The Praxis response | "for You have risen" (*ak Tonk*) on Sundays | 48 |
| The Aspasmos | seasonal text replaces the default | 83 |

### 3. Celebrant configuration — a dimension we do not model

Several points branch on **how many priests are serving**, which is not a calendar
fact at all:

```
+  In case of no other Priest is present:      Pray.
+  In the presence of other Priest(s):         Pray. Bless
THE OTHER PRIEST(S): (if any)                  You Bless
```

Occurs at the Opening Greeting (p. 24) and the Litany of the Gospel (p. 57), among
others; a bishop's presence changes it further (p. 66).

The Incense service's `when` blocks key on `dayTune`, `season`, `weekday`,
`commemoration` and `feast` — all calendar-derived. **None of them can express
"another priest is present".** Whatever shape the conditional model takes, it needs
a second class of condition: service configuration the reader (or the church)
supplies, not the date. Same class of problem as the Vespers saint-of-the-church
picker, which is already a user-supplied input.

### 4. Alternates at the Dismissal

The Prayer of Laying the Hands has an alternate said inaudibly (p. 129), and the
priest **may** say a short blessing instead of the full one (p. 133) — an optional
branch rather than a conditional one, closer to the Incense data's `optional` flag.

---

## What this implies for sequencing

- The Liturgy's missing sections are mostly **Part I and Part II**, and most of them
  have no conditional attached — they can be imported from the parallel source as
  plain sections once pages are identified.
- The fraction prayers should wait for the block model. Importing 13 as separate
  sections would put the selection logic in the reader.
- The model needs **two condition classes**: calendar-derived (season, weekday,
  feast) and service-configuration (concelebrants, bishop present). Only the first
  exists today.
