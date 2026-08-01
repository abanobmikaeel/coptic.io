# Conditional text resolution — design

Liturgical services are not fixed text. Parts vary by occasion and **compose**: a
martyr's feast can land on a Sunday inside a fast, and all three affect what is
prayed. Getting this right is the product; everything else is data entry.

This documents what already works, the three things that break it, and a staged
plan. It supersedes nothing — the Incense service's block model is the working
prototype and the starting point.

---

## What works today

The Incense service already resolves conditionally. A section carries either flat
`content` or `blocks`:

```ts
interface IncenseConditionalBlock {
	when?: IncenseCondition   // absent ⇒ always included
	title?: string
	content: IncenseContent[]
}

interface IncenseCondition {
	dayTune?: 'adam' | 'watos'
	season?: 'waters' | 'plants' | 'fruits'
	weekday?: number | number[]
	commemoration?: string | string[]
	feast?: string | string[]
}
```

Resolution is **additive**: every block whose condition matches is included, in
order. That is the correct default, and it is what makes composition work — a
saint's verses and a feast's verses both appear because both matched.

Mutual exclusivity falls out for free when the conditions are themselves exclusive:
Adam and Watos can never both match, so only one intro survives. No special
mechanism needed.

---

## Where it breaks

Three cases the current model cannot express. All three are now documented in real
data, not hypothesised.

### 1. Overlapping conditions on a slot that must yield exactly one

The Fraction prayer is chosen from **thirteen**, by occasion — see
`packages/data/src/en/liturgy/RITE-STRUCTURE.md`. The occasions overlap:

> Theophany **is** a Lord's feast.

Under additive resolution both the Theophany fraction and the Lord's-feasts
fraction match, and the service prints two fraction prayers. The conditions cannot
be made mutually exclusive without every block restating the negation of every
other — thirteen blocks each carrying "…and not any of the other twelve".

**This slot needs "most specific wins", not "include all".**

### 2. Conditions that are not calendar facts

The rite branches on how many clergy are serving:

```
+  In case of no other Priest is present:      Pray.
+  In the presence of other Priest(s):         Pray. Bless
THE OTHER PRIEST(S): (if any)                  You Bless
```

Every condition we support is derived from the date. None of them can express "a
second priest is present" or "the bishop is serving". This is not an edge case —
it recurs through the Liturgy (Opening Greeting, Litany of the Gospel, and the
litanies themselves change with a bishop present).

It is the same *shape* as the Vespers saint-of-the-church picker, which is already
a user-supplied input rather than a calendar one. So the channel exists; the
condition vocabulary does not.

### 3. Replacement, not addition

> "During the fasting days of the week, on Saturdays and Sundays of the Great Lent
> and the feasts of the Cross, the following is said **instead of the above**."

Additive resolution can only express this by giving the *default* block a condition
that excludes every replacing case. That inverts the maintenance burden: adding a
new seasonal variant means editing the default's condition too, and forgetting to
is silent — you get both texts. Same pattern at the Aspasmos.

---

## Proposal

### Resolution mode per section

A section declares how its blocks combine:

```ts
type ResolutionMode =
	| 'all'   // default — every matching block, in order (today's behaviour)
	| 'one'   // the first matching block only
```

`all` stays the default, so nothing changes for the sections that work today —
commemorations, saint verses, litanies you add to.

`one` covers the fraction prayers, the seasonal replacements, and the celebrant
branches. **First match wins, with blocks authored most-specific-first**, and the
unconditioned block last as the default.

Order-based rather than a numeric `priority` field, because:

- it is greppable — the file reads in the order the resolver applies it;
- there are no numbers to keep consistent across thirteen blocks in three
  languages;
- it is one rule, not two (authors already order blocks meaningfully).

The risk is silent authoring mistakes — an unconditioned block placed early makes
everything after it dead. That is mechanically detectable, so it becomes a test:

> **In a `one` section, only the final block may omit `when`.** Any earlier
> unconditioned block makes its successors unreachable.

Worth adding a companion check that every `one` section *has* a terminal
unconditioned block, so there is always a default and resolution cannot yield
nothing.

### Two condition namespaces

Keep one flat object — the data already reads that way — but split the vocabulary
by where the value comes from:

```ts
interface Condition {
	// Calendar — derived from the date by the resolver
	dayTune?: 'adam' | 'watos'
	season?: string
	weekday?: number | number[]
	commemoration?: string | string[]
	feast?: string | string[]

	// Service configuration — supplied by the caller (reader setting, parish default)
	celebrants?: 'single' | 'concelebrated'
	bishopPresent?: boolean
}
```

The resolver builds the calendar half from the date, as now, and takes the service
half from the request. `getIncenseForDate` already accepts
`selectedCommemorations[]`; this generalises that into one `ServiceContext` object
rather than growing the parameter list per condition type.

### Where the code lives

The resolver is currently inside `apps/api/src/services/incense.service.ts`. It is
pure data logic with no HTTP in it, and the Liturgy and Tasbeha need the same
thing, so it should move to `packages/data/src/content/` alongside the shared
content types — `resolve.ts` next to `types.ts`. API services then pass an
occasion and get flattened `content[]` back, exactly as they do now.

This also finishes a cleanup already noted: `role`, section `type`, `Speaker`,
`ContentLine`, `Condition` and `ConditionalBlock` are generic liturgical
primitives that still live in `en/incense/index.ts` under `Incense*` names.
`ContentLine`/`ContentSpeaker` were moved to `content/types.ts` with the Liturgy
work; the rest should follow and drop the `Incense` prefix.

---

## Staging

Each stage is independently shippable and leaves the app working.

**Stage 0 — extract the primitives.** Move `Condition`, `ConditionalBlock`,
`SectionRole`, `SectionType` to `packages/data/src/content/`, rename `Incense*` →
`Liturgical*` keeping aliases so nothing breaks, and move `resolveBlocks` beside
them. No behaviour change; the Incense output must be byte-identical.

**Stage 1 — `mode: 'one'`.** Add the mode, the resolver branch, and both authoring
tests. Port the two known replacement cases (Hymn of the Intercessions, Aspasmos)
off the "default with negated condition" workaround if they use it.

**Stage 2 — service configuration.** Add `celebrants` and `bishopPresent` to the
vocabulary, thread a `ServiceContext` through the API, expose it as a query
parameter, and surface it in the reader's settings the way the saint picker is.

**Stage 3 — the fraction prayers.** The first real exclusive set: thirteen blocks
with stated selection rules, in three languages. This is the proof the model holds,
and it is bounded — the rules are written down in the reference book.

**Stage 4 — shared hymn library.** Hymns recur across services (the Verses of
Cymbals is prayed at both Vespers and Matins). Define each once with its blocks and
reference it by id, so both the content and the resolution are shared rather than
copied.

---

## What this does not solve

Deciding *which saint* a given day commemorates, and which category (apostles,
martyrs, fathers, saints) their verses come from, is a data-classification problem
sitting on free-text Synaxarium entries. The model above consumes a
`commemoration` key; producing that key reliably is separate work, and partly a
parish setting rather than a calculation — the church's patron saint is a
configuration value, not a fact about the date.
