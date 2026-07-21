# Weekly Brief Benchmark

## Goal

Verify that Weekly produces a scoped management judgment from raw evidence,
keeps every meaningful stream visible, and uses evidence ids as drill-down
rather than the spoken narrative. When slides are explicit, also verify that an
individual contributor can present results, runtime-mechanism changes, evidence
boundaries, and closure needs without turning the deck into a technical design
review.

## Core Scenarios

1. **Work scope with mixed vault**: personal projects must not appear anywhere
   in output, including paths and evidence refs.
2. **All scope**: work and personal receive separate judgments, headline
   budgets, portfolios, closure targets, and evidence sections.
3. **Raw entries sufficient**: raw fields drive state, meaning, and risk; matching
   git commits remain coverage/evidence.
4. **Git-only fallback**: meaningful activity remains `limited`; chore noise is
   filtered and no motivation or verified impact is invented.
5. **Artifact context**: source-of-truth references can support a bounded claim;
   general dossier context remains navigation.
6. **Dense week**: normally three and no more than four result arcs per group;
   every other meaningful stream appears in portfolio coverage.
7. **Conflict**: later or conflicting raw states remain visible and lower
   confidence.
8. **Explicit PPT request**: produce 6-10 main slides per group. Default Weekly
   remains a Markdown management brief.
9. **Quantified algorithm result**: recommend a result chart only when metric,
   unit, baseline, current value, delta, sample scope, method, and comparability
   support it.
10. **Missing effect data**: show mechanism or Before/After plus a measurement
    plan and closure criterion; never invent a result chart.
11. **Conflicting metrics**: expose invalid ordering, incompatible samples, or
    unit conflicts, lower confidence, and withhold the chart.
12. **Core runtime mechanism**: generate complete `solution_logic` with a diagram
    type matched to concurrency, data flow, dispatch, failure handling, state,
    or responsibility change.
13. **Core implementation narrative**: derive normal-path, branch-and-fallback,
    and outcome-and-invariant prose from the same core `solution_logic`, without
    introducing new mechanisms or presenting the prose as effect evidence.
14. **Maintenance-only work**: retain parameter tuning, cleanup, and
    non-mechanism configuration work in the portfolio without decorative
    architecture diagrams or implementation narratives.
15. **Contract rejection probes**: reject omitted results, hollow core logic,
    missing, empty, invisible, duplicate, prefixed, composite, or node-list
    implementation narratives, default-deck internal references, unsupported
    result charts, duplicate or unsafe slide titles, oversized narrative or
    logic fields, missing maturity, decorative maintenance logic, and invalid
    slide formats.

## Pass Criteria

- Scope partition occurs before ranking.
- Every reporting group has exactly one repeatable weekly judgment.
- Each headline explains starting constraint, decisive movement, end state,
  management meaning, and remaining gate.
- Headline count is a memory budget, not a coverage limit.
- Non-headline streams remain in the portfolio.
- Next-week closure targets number two to four, normally three.
- Raw entries are semantic truth; git-only work stays limited.
- Activity volume never becomes an outcome by itself.
- Main prose is readable without O/W/D/E ids.
- Claim-level evidence remains available in the appendix.
- Plain slide wording defaults to an IC department update; a technical-review
  deck requires explicit wording.
- Slide 2 states the stage judgment, key results, largest gate, and support need
  in about 30 seconds.
- Each main-deck title states one supported conclusion and each slide has at
  most one primary visual.
- Stable result ids link headline selection, core classification, logic-diagram
  routing, and slide projection; omitted or duplicate results fail validation.
- The declared 6-10 slide count matches the composed conclusion-title list.
- A normal result covers at least two of Before/After, Solution Logic, and Data
  or Validation.
- A result with `solution_logic.significance=core` covers all three and has a
  complete `implementation_narrative` in its slide-projection result.
- Core solution logic records its trigger, actors, ordered main flow, material
  branches, fallbacks, output, invariants, remaining boundary, diagram route,
  and evidence references.
- Main-deck logic diagrams are limited to two or three per group. Supporting
  mechanisms move to the technical appendix.
- Logic diagrams explain how a solution works and remain separate from the
  data, test, eval, or observed evidence used to establish whether it worked.
- Core implementation narratives cover the ordered normal path, the condition
  and reason for a branch or fallback, and the output plus an invariant. They
  are derived from solution logic, use one or two sentences per block in the
  main deck, stay within 600 Unicode characters per block, and do not become
  another source of technical facts.
- Presentation logic lists are bounded to 12 actors or main-flow steps, 8
  branches, fallbacks, or invariants, and 24 evidence references. Larger detail
  is summarized in the technical appendix.
- Presentation coverage is result-level across associated slides. Before/After,
  logic, narrative, and result evidence do not have to occupy one page.
- Mechanism completion, effect validation, and production acceptance are
  reported separately.
- Every open risk and next-week acceptance target has a pass/fail closure
  criterion.
- Expected effects never appear as observed outcomes, and missing numeric
  evidence never becomes a guessed baseline, target, or trend.
- Default department slides keep source paths, commit hashes, raw evidence ids,
  and internal links in the appendix; only explicit technical-review decks may
  show sanitized compact references.

## Slide Visual Routing

| Mechanism or evidence | Expected route |
|---|---|
| Concurrency, asynchronous stages, stage collaboration | sequence or swimlane |
| Data processing, aggregation, materialized rebuild | data flow |
| Provider, model, policy, or strategy dispatch | decision tree |
| Failure handling and fallback | failure path |
| Lifecycle or state transition | state machine |
| Component responsibility change | architecture relationship |
| Comparable algorithm or outcome data | `comparison_chart`, `distribution_chart`, `trend_chart`, `timeline_chart`, or `waterfall_chart` |
| One reliable number | `number_card` |
| Missing or conflicting outcome data | mechanism/validation summary plus measurement plan |

## Real-Output Check

Use a dense real week and generate `work`, `personal`, and `all` candidates
without overwriting the source report. The work brief should be presentable in
about five minutes. For the W29 storyboard candidate, use a nine-slide main deck
and verify that it contains:

1. the weekly throughline;
2. key results and maturity;
3. configuration/model failure Before/After;
4. configuration or provider compatibility logic;
5. streaming execution result evidence;
6. Producer-Consumer logic with queue, completion signal, bypass branch, batch
   fallback, unchanged input, and unchanged call-count invariants;
7. Registry Before/After and materialized-view rebuild logic with canonical
   episodes, ordered fold, existing merge, current view, auto-backfill, stable
   schema, and unchanged downstream interface;
8. risks, collaboration, and closure criteria;
9. next-week acceptance targets.

The Provider, Producer-Consumer, and Registry core results must each pass both
solution-logic completeness and implementation-narrative completeness. Review
the real candidate manually because the executable validator can prove field
presence and reject known label-only shapes, but cannot prove that free prose
faithfully explains a diagram. For each core result, confirm that the narrative
covers the diagram's main path, material branch, fallback, output, and invariant.

Also verify that the streaming quality difference supports only the stated
quality boundary under the current sample. It may justify proceeding to latency
measurement as a safety gate, but it must not be described as observed latency
improvement.

Keep the Nacos or provider logic not selected for the main deck in the technical
appendix. Do not copy project names, model names, or these implementation details
into the reusable skill contract. Keep private fixtures and outputs in ignored
eval folders or temporary storage.
