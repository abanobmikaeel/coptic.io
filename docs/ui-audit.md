# Coptic.io Frontend UI/UX Audit

> Living document — updated as fixes land and new issues are found.
> Status key: ✅ done · 🔧 in progress · ⬜ remaining

## 1. Presentation mode bugs (scrolling / screen cut-off)

The presentation system lives in `components/LiturgicalSection/PresentationView.tsx`,
`LiturgicalServiceReader.tsx`, `pagination.ts`, and `useViewportFillHeight.ts`.

### 1.1 ✅ Height measured against the *document*, not the scroll container — fixed
~~`useViewportFillHeight.ts` set `height = window.innerHeight - top` but `top` added a stale
`window.scrollY`, which is wrong once the reader locks document scroll (a previously scrolled
route leaves a non-zero `scrollY`).~~
**Done:** `useViewportFillHeight` now measures `window.innerHeight - rect.top` (viewport-relative,
correct under the scroll lock), and re-measures via a `ResizeObserver` on
`document.documentElement` + `resize`/`orientationchange` (not just `window.resize`).

### 1.2 ✅ Magic `100dvh - 116px` fallback removed
~~`LiturgicalServiceReader.tsx` used `style={{ height: containerHeight ?? 'calc(100dvh - 116px)' }}`
— the `116px` hardcoded the chrome stack and could clip on any deviation.~~
**Done:** fallback is now `100dvh` (the measured value is applied synchronously before paint via
`useLayoutEffect`), so the first frame can never clip the sticky chrome.

### 1.3 ⬜ `PAGE_VERTICAL_RESERVE = 20` is a single hardcoded constant
`PresentationView.tsx` subtracts a flat `20px` (plus `28px` only when `contentLayout === 'stanzas'`).
The actual chrome above the content is taller and variable (title bar + rubric + section dots). On
short viewports or large `textSize`, a page that measures as fitting still renders clipped.
**Fix:** compute `available = view.clientHeight - actualOverhead - headerReserve` from measured
values, and detect overflow via `scrollHeight`/`clientHeight` rather than a guess.

### 1.4 ⬜ Page can still overflow with no visual affordance
A single oversized row "scrolls rather than clipping" (per the code comment) and does
`scrollTo(0)` on page turn — but there's no visual cue (no scrollbar due to `scrollbar-hide`, no
hint). Users think a long verse is simply cut off.
**Fix:** add a subtle fade/gradient at the bottom edge when `scrollHeight > clientHeight`, or
split the row.

### 1.5 ✅ Font-load re-pagination jitter (content stuck invisible)
`document.fonts.ready.then(measure)` re-bins pages after first paint, and the content region is
`opacity-0` until `fontsReady`. If a custom font fails/slows, content stays invisible indefinitely
(no timeout on the promise).
**Fix:** `Promise.race` with a ~2s timeout so content always appears.
**Done** in `LiturgicalServiceReader.tsx` — `fontsReady` now settles via a 2s
`setTimeout` racing the `document.fonts.ready` promise.

### 1.6 ⬜ `hasPrev`/`hasNext` computed from stale `pagination` state
`pagination` updates via `onPaginationChange` in a `useLayoutEffect` inside `PresentationView`, so
the bottom/side arrows lag one frame after `prev()`/`next()`; rapid keyboard nav can double-fire.
**Fix:** derive `hasPrev`/`hasNext` synchronously from the `PresentationView` handle, or lift page
index state to the reader.

---

## 2. Synaxarium page standardization (inconsistent with the rest)

Active page is `app/synaxarium/page.tsx` (client component). It previously had a large bespoke hero
and its own header/date-nav. Compare with `app/readings/page.tsx`, `app/agpeya/page.tsx`,
`app/vespers/page.tsx`, which share a consistent pattern (sticky `ReadingsHeader` + breadcrumb +
`DateNavigation` + `DisplaySettings`).

### 2.1 ✅ Competing page implementations / conflicting + dead components
- ~~`SynaxariumHeader` uses `viewMode: 'day' | 'upcoming'`.~~
- ~~`SynaxariumViewToggle` + `SynaxariumTodayView` use `viewMode: 'today' | 'upcoming'`.~~
- ~~`SynaxariumDateNav` is a third date-nav component that is dead code.~~
- ~~`SynaxariumTodayView`, `SynaxariumDateNav`, `SynaxariumViewToggle`, `SynaxariumSection` were
  orphaned/dead.~~

**Done:** deleted `SynaxariumTodayView.tsx`, `SynaxariumDateNav.tsx`, `SynaxariumViewToggle.tsx`,
and `SynaxariumSection.tsx`. Kept `SynaxariumHeader` (now only owns the day/upcoming toggle),
`SynaxariumEntryCompact`/`SynaxariumDayCard` (used by `UpcomingSynaxarium`), and
`SynaxariumSearchResults` (used).

### 2.2 ✅ `/synaxarium/[date]` page deleted (un-themed & inconsistent)
~~`app/synaxarium/[date]/page.tsx` hardcoded `theme="light"`, had hardcoded English strings,
duplicated the accordion logic, and was unreachable from normal navigation (SPA uses `?date=` +
`entry` query).~~
**Done:** deleted the route. It was dead weight and the only consumer of the (now-unused)
`getSynaxariumByCopticDate` helper in `lib/api.ts` (kept, as it maps a documented API endpoint).
Old `/synaxarium/<coptic-date>` URLs now 404.

### 2.3 ✅ Verified not a bug — category filter counts
~~Claimed: categories with `count === 0` render with `(0)` outside day view.~~
**Correction:** the `(count)` chip is rendered inside the `showCounts && (...)` block, so in
upcoming/search views (`showCounts=false`) no count is shown — only the category label renders
(correctly, for filtering). In day view (`showCounts=true`), zero-count categories are hidden
correctly. No action needed.

### 2.4 ✅ Today/upcoming toggle label bug (`SynaxariumHeader`)
~~`{isDayView ? (isToday ? tCommon('today') : t('day')) : tCommon('today')}` — the "Today" vs
"Day" label flips confusingly.~~
**Done:** `SynaxariumHeader` now renders a single "Today"/"Upcoming" toggle with clean labels; the
date display/navigation moved into the shared sticky header.

### 2.5 ⬜ `entryParam` expansion scroll doesn't account for sticky header
Expanded entry has no `scroll-margin-top`; the sticky header can cover the expanded title. Also
`SynaxariumDayView` re-mounts the list with `key={currentDate}`, resetting expanded state on date
nav.

### 2.6 ⬜ Date string parsing
`useSynaxarium` and `Home` use `new Date(\`${date}T00:00:00\`)` (local-time-safe). But
`synaxarium/[date]/page.tsx` does `decodeURIComponent(dateParam).replace(/-/g, ' ')`, silently
assuming a specific URL shape.

### 2.7 ✅ Oversized hero removed + header standardized
~~The synaxarium page had a large decorative hero (ornament cross divider + gradient serif title +
subtitle) that pushed content down and diverged from every other reader page.~~
**Done** in `app/synaxarium/page.tsx`:
- Removed the hero (decorative cross, gradient `h1`, subtitle).
- Added the shared sticky `ReadingsHeader` (`layout="between"`) with `Breadcrumb` (Home ›
  Synaxarium), centered `DateNavigation` (Gregorian + Coptic date), and `DisplaySettings`.
- The day/upcoming toggle moved below the header, then search + category filters.

### 2.8 ✅ Redundant "Today's Saints" featured grid removed
~~`SynaxariumDayView` rendered a `FeaturedTodayCard` ("Today's Saints") that duplicated the
commemoration list rendered immediately below it.~~
**Done:** removed `FeaturedTodayCard` and its now-unused imports (`getCategoryColor`,
`getCategoryForEntry`) and props (`isToday`, `bilingualEntries`) from `SynaxariumDayView`.

---

## 3. Home page — more interesting + bugs

`app/page.tsx`.

### Bugs
- ✅ `copticDate` `'Loading...'` fallback → changed to empty string (no fake loading text).
- ⬜ `upcomingFeasts` card always renders even when empty; `upcomingFasts` is correctly gated.
- ⬜ Email signup CTA is buried at the bottom after 3 cards.
- ⬜ Hero's "today" card is dense (4–5 stacked sections) and duplicates info.

### Ideas
1. Interactive "today at a glance" strip — Coptic date + compact scroll of the day's readings with
   a "read now" per reading (not just references).
2. "Next feast/fast countdown" chip from the already-fetched `upcoming` data.
3. Surface the Synaxarium saint-of-the-day (`celebrations[0]`) as a featured card near the top.
4. Gate empty cards; collapse offerings into a tighter grid.
5. Add a light personal touch (remember last-read section).

---

## 4. Other bugs / UX issues

- ✅ `document.documentElement.style.overflow = 'hidden'` in `LiturgicalServiceReader` → replaced
  with `react-remove-scroll`'s `<RemoveScroll>` wrapper (already a dependency), which scopes and
  restores the lock cleanly on unmount.
- ⬜ `ReadingProgress` rendered in the sticky header may flash 0% before data resolves.
- ✅ Icon-only buttons: TOC button got `aria-label="Sections (T)"` (gear already had
  `aria-label="Settings"`).
- ⬜ `scrollbar-hide` horizontal scroll containers (category filters, offerings) give no scroll
  affordance on mobile.
- ⬜ Hardcoded English strings leak in: `LiturgicalServiceReader` (`"Present"`, `"Scroll"`, `"Reader
  Mode"`, `"Sections (T)"`, `"Settings"`), `SynaxariumDatePage`, `UpcomingFastsList` (`"Show more"`,
  `"No upcoming fasts"`).

---

## Suggested fix order (updated)

1. ⬜ `PAGE_VERTICAL_RESERVE = 20` measured-overhead refinement (1.3) + overflow affordance (1.4).
2. ⬜ `hasPrev`/`hasNext` stale-state fix (1.6).
3. ⬜ Home page: gate empty cards + surface saint-of-the-day (3).
4. ⬜ i18n for remaining hardcoded strings (4).



Terce english
1) Your Holy Spirit, O Lord, whom You had sent forth
upon Your holy disciples and honourable apostles at the
third hour, we ask You our Good Lord, not to take Him
away from us, but rather to renew Him within us! A
pure heart create in me, O God, and a steadfast spirit
renew within me! Do not cast me away from Your
presence and do not take Your Holy Spirit from me!
Do[a Patri ke Uiw ke `agiw Pneumati
TERCE
62
(Glory be to the Father and to the Son and to the Holy Spirit)
(2) O Lord, who sent Your Holy Spirit upon Your Holy
disciples and honourable apostles at the third hour, do
not take Him away from us, O Good One; but we ask
You our Lord Jesus Christ, the Logos, Son of God, to
renew Him within us: the Spirit of uprightness and life-
giving, the Spirit of prophecy and chastity, the Spirit of
holiness, justice and authority. Our almighty God, the
light of our souls illuminating every person who comes
into this world, have mercy upon us.
ke nun ke a`i ke ic touc `e`wnac twn `e`wnwn> `amhn
(Now and forever and unto the ages of all ages, Amen)
(3) O Theotokos, Mother of God, you are the true vine
who carries Christ, the Fruit of life, we ask you, O full of
grace, together with the apostles, to intercede for the
sake of our salvation. Blessed be the Lord our God
whom we praise every day; He prepares our way for He
is the God of our salvation.
ke nun ke a`i ke ic touc `e`wnac twn `e`wnwn> `amhn
(Now and forever and unto the ages of all ages, Amen)
TERCE
(4) O Heavenly King, the Comforter, the Spirit of Truth,
who is present everywhere and fills all; You are the
treasure of goodness and the Life-Giver, graciously
come and abide in us, O Good One, purify us of all
iniquities and save our souls.
Do[a Patri ke Uiw ke `agiw Pneumati
(Glory be to the Father and to the Son and to the Holy Spirit)
(5) Just as You did abide with Your disciples, O Saviour,
and gave them peace, come also now, abide with us and
give us Your peace, save us and deliver our souls.
63
ke nun ke a`i ke ic touc `e`wnac twn `e`wnwn> `amhn
(Now and forever and unto the ages of all ages, Amen)
(6) Whenever we stand in Your holy sanctuary, we are
indeed considered as those who abide in heaven, O
Mother of God. You are the gate of heaven, open for us
the door of mercy.

---

## 5. Agpeya litanies are broken (data + display) — HIGH PRIORITY

### 5.1 Arabic litany sections are over-stuffed (data artifact)
Every Arabic `*-litany` section contains, appended after the litany proper, the
**Kyrie 41×, Holy-Holy-Holy, the Absolution and the Concluding Prayer of Every Hour** —
which are ALSO separate sections named in each hour's `order` (`kyrie41`,
`holy-holy-holy`, `*-absolution`, `conclusion-of-every-hour`). The result is duplicate
content and grossly inflated line counts:

| hour | ar litany lines | true litany proper (before "Kyrie 41×") | en litany lines |
|---|---|---|---|
| prime | 3 | 3 | 9 |
| terce | 25 | 17 | 4 |
| sext | 26 | 18 | 4 |
| none | 28 | 20 | 4 |
| vespers | 17 | 9 | 4 |
| compline | 16 | 9 | 4 |
| midnight-1 | 18 | 18 | 3 |
| midnight-2 | 18 | 18 | 3 |
| midnight-3 | 21 | 21 | 3 |

**Fix (data):** trim each Arabic litany to the petitions + their Doxa/Ke-nin responses,
ending before the "كيرياليسون (يا رب ارحم) 41 مرة" line. The Kyrie/Holy/conclusion stay as
their own sections.

### 5.2 English litanies are wrong text (not a translation of the Arabic/Coptic source)
The English litany content does **not** match the Arabic/Coptic litany at all — it is a
generic 4-line paraphrase that conflates the petitions. Compare Vespers:
- Arabic petitions: (1) "If the righteous one is hardly saved…" (2) "O my Saviour, hasten
  to open Your fatherly bosom…" (3) "With full awareness and enthusiasm…"
- English "litany": "We worship You, O Christ…", "O Lord, Who at the Eleventh Hour was taken
  down from the Cross…", "We have sinned and committed iniquity…", "O Lord, as the sun sets…"

This makes English readers miss the actual litany and is why the columns misalign so badly.

**Canonical source:** `~/Downloads/agpeya_english.pdf` (extracted to text) has the faithful
English litanies with the Doxa/Ke-nin responses inline, matching the Arabic line structure.

### 5.3 Downstream display bug: giant cells → page scrolls in presentation mode
Because Arabic litanies have far more lines than English, `alignSection` falls back to
`alignProportional`, which packs many Arabic lines into each cell (anchored on the shorter
English line count). Cells become 500–2400px tall. `computePageBreaks` guarantees ≥1 row per
page, so an oversized row lands alone on a page that then **scrolls** (`overflow-y-auto`).

Reproduced on `/agpeya?hour=vespers` → Litanies with `en,ar`:
- 1440×700: rows 527px, scroller scrollable
- 900×700: rows 672–1308px, scrollable
- 390×844: rows 1226–2404px, scrollable

**Fix (display, after the data is corrected):** with litanies parallel in both languages,
`alignSection` takes the line-parallel path (one line per row) and the giant cells disappear.
Also harden `computePageBreaks`/`PresentationView` so a single row taller than the viewport is
split rather than silently scrollable.

### 5.4 Parity-test ratchet to update
`packages/data/src/__tests__/agpeya-parity.test.ts` lists all the litanies in
`KNOWN_PROSE_GAPS`. After correcting the data, remove the fixed entries — the test fails if a
listed section *starts* matching, so the list must always equal the remaining work.

### 5.5 Confirmed: the Arabic litany tail is an exact duplicate
The Arabic litany's trailing lines are byte-identical to the shared sections in
`packages/data/src/ar/agpeya/common.json`:
- `kyrie41` (5 lines), `holy-holy-holy` (4 lines), `conclusion-of-every-hour` (4 lines)
which are already listed in each hour's `order`. So the litany tail is duplicated content,
not additional litany. Trimming it is a pure dedup (safe).

### 5.6 Implementation plan (staged)
1. **Trim Arabic litanies** — cut each `ar/*-litany` (and midnight watch litanies) content at
   the "كيرياليسون (يا رب ارحم) 41 مرة" line (exclusive). Keep the petitions + Doxa/Ke-nin
   responses. (prime already correct at 3.)
2. **Rewrite English litanies** from `~/Downloads/agpeya_english.pdf` so each English litany
   mirrors the Arabic line structure (petitions + inline Doxa/Ke-nin responses). The PDF has
   faithful translations (Vespers Litany pp.115–117, Terce pp.62–63, and so on).
3. **Update `KNOWN_PROSE_GAPS`** — remove the entries that now match; the parity test ratchet
   must equal the remaining work exactly.
4. **Harden presentation pagination** — after alignment is line-parallel, verify pages no longer
   scroll at 1440/900/390 widths; add a guard for any single row taller than the viewport.
5. **Regression test** — add a data test asserting every hour's litany has equal en/ar line
   counts, and a Playwright check that the Litanies section does not scroll at mobile width.

### 5.7 ✅ FIXED — Agpeya litanies corrected (data)
All nine litanies are now parallel texts and the display bug is gone.

**Arabic** (`packages/data/src/ar/agpeya/*.json`)
- Removed the duplicated tail (Kyrie 41×, Holy-Holy-Holy, Absolution, Concluding
  Prayer) that was appended to every litany — those remain as their own sections in
  `common.json` and each hour's `order`, so nothing is lost, only the duplication.
- Merged the split Doxa/Ke-nin response transliterations into single lines.
- Merged petitions that the source had split across lines (midnight-3).

**English** (`packages/data/src/en/agpeya/*.json`)
- Replaced the wrong, non-translating paraphrase litanies with the faithful text from
  **copticchurch.net** (the source we already have permission to use), one line per
  Arabic line, including the transliterated responses
  (`Dthoxa Patri ke Eiou ke Agio Epnevmati.` / `Ke neen ke a-ee …`).
- Note: comment in the source says the corrected counts are the same as Arabic.

**Resulting line counts (en == ar):**

| litany | lines |
|---|---|
| prime | 3 |
| terce | 16 |
| sext | 16 |
| none | 16 |
| vespers | 7 |
| compline | 7 |
| midnight 1/2/3 | 16 |

**Parity ratchet:** removed `*.litanies` from `KNOWN_PROSE_GAPS`; the parity test now
enforces equal en/ar line counts for every litany.

**Display:** with line-parallel rows, the giant proportional cells are gone. On
`/agpeya?hour=vespers` → Litanies the presentation page no longer scrolls at 1440px;
at narrow widths a single long petition can still exceed the viewport (legitimate content
length) — remaining task is the overflow affordance (§1.4).

---

## 6. Agpeya content gaps vs copticchurch.net

Compared every hour's `order` (`packages/data/src/{en,ar}/agpeya/*.json`) against the
copticchurch.net Agpeya pages. The **shared prayers all exist** in `common.json`
(`holy-holy-holy`, `kyrie41`, `gloria`, `trisagion`, `hail-to-you`, `creed`,
`creed-introduction`, `absolution`, `conclusion-of-every-hour`, psalms, etc.). The gaps are
only where an hour's `order` fails to reference them.

| Hour | Status vs copticchurch.net |
|---|---|
| Prime | ✅ complete (Gloria, Trisagion, Hail-to-You, Creed, both absolutions). We additionally include Kyrie+Holy, which the source's prime page omits — harmless. |
| Terce / Sext / None / Vespers | ✅ complete |
| **Compline** | ⬜ **"Graciously O Lord"** (the prayer after the litanies, before the Absolution) is still missing from both languages. |
| **Midnight** | ✅ Closing sequence added: Kyrie 41×, Holy-Holy-Holy, the Lord's Prayer, the Midnight Gospel (Luke 2:29-32), the Tenouwst, the Creed, a second Kyrie/Holy/Lord's Prayer, the Midnight Absolution, and the Conclusion of Every Hour. |

### Notes
- "Holy, holy, holy" is a separate prayer/`common.json` section, **not** part of the litany —
  it was removed from the litany only because the litany had a *duplicate copy* of it; the real
  section still renders in every hour where the `order` includes `holy-holy-holy`.
- Midnight's three watches have per-watch closings (`midnight-{1,2,3}-closing`) in English that
  Arabic lacks. These are the only entries left in the parity test's `KNOWN_PROSE_GAPS`.
- The shared concluding prayers in `common.json` (gloria, trisagion, hail-to-you, creed,
  creed-introduction, lords-prayer, holy-holy-holy, conclusion-of-every-hour, the per-hour
  absolutions) are now re-split so English and Arabic pair 1:1 in the reader's aligned rows.
- The vestigial common sections no hour referenced were deleted; both `common.json` files hold
  the same 41 sections.

## 7. Open items

- ⬜ Compline "Graciously O Lord" (both languages).
- ⬜ Arabic for the three Midnight per-watch closings, or dropping the English ones.
- ⬜ Theme/language preference sprawl (URL vs cookie vs localStorage) — unify to one mechanism.
- ⬜ Agpeya Prime renders Arabic-only in some locales; six server pages still need
  `getDefaultContentLanguages(locale)`.
