# Engineering Guide for Agents

This file defines the default engineering standards for this repository. Follow it for every
change unless a more specific `AGENTS.md` exists deeper in the tree.

## Priorities

1. Preserve runtime correctness.
2. Preserve liturgical and textual accuracy.
3. Keep multilingual behavior explicit and tested.
4. Prefer consistent, reusable architecture over locally convenient fixes.
5. Keep implementations concise without sacrificing clarity.

Do not optimize for completing one small task at the expense of the surrounding system. This
project is expected to support many liturgical services, languages, and text editions.

## Before Coding

- Read the relevant route, components, hooks, services, types, and tests before editing.
- Search for an existing component, hook, utility, service, or domain rule before creating one.
- Identify whether a rule is presentation, orchestration, domain, or data logic, and place it in
  the corresponding layer.
- Check how the same behavior works across languages and existing liturgical services.
- Prefer extending an established abstraction when it genuinely fits. Do not force unrelated
  behavior into an abstraction merely to reduce line count.
- Keep changes scoped. Record unrelated debt instead of silently expanding the task.

## Architecture Boundaries

### Data: `packages/data`

- Owns curated texts, translations, references, and source metadata.
- Generated data must have a reproducible importer or transformation script.
- Do not manually patch large generated files when the source script can produce the correction.
- Inspect generated diffs for dropped sections, language leakage, ordering changes, and suspicious
  size changes.
- Never invent or silently translate liturgical or Scriptural text. Preserve source provenance.

### Domain: `packages/core`

- Owns pure calendar, season, feast, and liturgical eligibility rules.
- Domain functions must not depend on React, Next.js, HTTP, storage, or UI state.
- Seasonal and service-ordering rules must be generic enough for all applicable services. Do not
  encode a universal rule inside an Agpeya- or Vespers-specific component.

### BFF/API: `apps/api`

- Owns orchestration and returns the final ordered liturgical service for the requested context.
- Route handlers should validate and delegate; services should contain behavior.
- The BFF may expose available optional prayers and defaults. The client sends selected option IDs;
  the BFF validates them and retains ownership of eligibility and ordering.
- Prefer simple functions and explicit contracts. Avoid framework-heavy abstractions and hidden
  control flow.
- Parse request inputs through shared helpers across every entry point (REST and GraphQL), not
  ad-hoc parsing per handler. Date strings must be parsed as local time; never use
  `new Date('YYYY-MM-DD')`, which the spec interprets as UTC and shifts the day in negative-offset
  timezones.
- Match cache TTL to each route's volatility. Wall-clock-dependent responses (e.g. "current
  hour") must not share a date-deterministic cache lifetime, and cache middleware must not
  clobber a `Cache-Control` header the handler set intentionally.
- Never return raw `Error.message` or stack traces to clients. Return a public-safe error
  envelope and log internals server-side only; prefer a single global error handler over
  per-route try/catch that re-implements it.
- Business logic requires focused unit tests.

### Web: `apps/web`

- Owns rendering, interaction, responsive layout, reading modes, pagination, fonts, and local user
  preferences.
- The web application must not decide seasonal validity or liturgical ordering.
- Pages and routes compose existing units; they should not contain domain logic.
- Shared liturgical UI belongs in `apps/web/components/liturgy`; generic visual primitives belong in
  `apps/web/components/ui`; reusable state belongs in `apps/web/hooks`.
- Introduce service-specific folders only after the service has enough unique behavior to justify
  one. Do not create speculative directory hierarchies.

## UI Standards

- Target fewer than 200 lines per UI component.
- Target fewer than 100 lines per route or page.
- Treat these as design pressure, not an excuse to split coherent code into trivial wrappers.
- Extract stateful or effect-heavy behavior into focused hooks.
- Keep components narrow: data preparation, state coordination, and rendering should not accumulate
  in one file.
- Use shared design tokens and existing UI primitives. Avoid one-off spacing, colors, typography,
  and controls when a project pattern exists.
- Prefer composition over boolean-heavy components with many unrelated modes.
- Keep accessibility and bidirectional layout behavior intact for every UI change.

## Reuse and Abstraction

- Search first, reuse second, create third.
- Do not duplicate domain logic, translation fallback logic, responsive behavior, or formatting
  rules.
- Rubric alignment, multilingual section alignment, pagination, and presentation behavior are
  cross-service capabilities, not service-specific exceptions.
- Design for demonstrated requirements. Preserve obvious extension points, but do not build a
  generalized platform for a hypothetical future feature.
- Refactor incrementally when related code is touched. Avoid unrelated big-bang migrations.
- Prefer readable duplication over a premature abstraction when the concepts are not yet proven to
  be the same.

## Languages and Text Editions

- Language and translation/edition are distinct concepts. Do not introduce new APIs that assume one
  translation per language.
- Do not undertake a repository-wide translation-model migration until a concrete feature requires
  it.
- Multilingual displays must not use the first requested language as an implicit structural source
  when another selected language contains more complete service content.
- Never silently fall back to another language or edition. A fallback must be labeled in the
  returned contract and visible or discoverable in the UI.
- Every language-specific bug requires a regression test covering the affected combination.
- Test left-to-right, right-to-left, missing-text, and uneven-content cases where relevant.

## Testing and Quality

- New or changed business logic should achieve at least 90% unit coverage in its affected scope.
- Add regression tests for every runtime, language, ordering, pagination, and data-alignment bug.
- Prefer unit tests for pure domain and service logic; use component tests for interaction and
  Playwright for critical end-to-end journeys.
- Data tests should verify completeness, ordering, language identity, reference alignment, and
  invariants rather than only checking that files parse.
- Tests must assert behavior, not implementation details.
- Do not weaken, delete, or broadly skip tests to make a change pass.

## Definition of Done

Before declaring work complete:

1. Run `pnpm check`.
2. Run `pnpm typecheck`.
3. Run focused tests for the changed packages.
4. Run broader tests when shared contracts, domain logic, or user journeys changed.
5. Inspect generated data and repository diffs.
6. Confirm no unrelated or generated local artifacts were committed.
7. Use a Conventional Commit message.

If a required check cannot run, report the exact blocker and run the strongest available substitute.

## Quality Enforcement

- Static analysis should gate new and changed code first, allowing existing debt to be reduced
  deliberately instead of forcing unrelated rewrites.
- Treat new reliability, security, and maintainability findings as merge blockers.
- Complexity and duplication reports are prompts for engineering judgment, not targets to game.
- Architectural consistency and data accuracy require tests and review; static analysis alone is
  insufficient.
