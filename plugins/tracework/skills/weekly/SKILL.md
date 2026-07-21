---
name: weekly
description: >
  Generate a management-facing weekly brief from Tracework raw entries, using
  git only as limited fallback coverage. Supports work, personal, and private
  all-project scopes; defaults to a Markdown brief and produces a slide outline
  only when explicitly requested. Use for "/tracework:weekly", "周报",
  "本周总结", "weekly report", "weekly brief", "weekly PPT", or a
  multi-project weekly status. Do not use for daily notes or single-commit
  analysis.
---

# Tracework Weekly

Turn a week of agent work into a management judgment: what situation changed,
which uncertainties closed, what remains gated, and where next week should
focus. Preserve all meaningful work without giving every stream equal headline
prominence.

The default slide audience is an individual contributor reporting inside a
department to managers and peers. Slide mode is a presentation projection over
the weekly analysis, not a paginated copy of the Markdown brief.

## Required References

Read:

- `references/reporting-narrative-contract.md` for scope partition, selection,
  closure, evidence, and audience safety.
- `references/subagent-prompt.md` for the structured analysis contract.
- `references/weekly-brief-template.md` for the default output.
- `references/slide-template.md` only when the user explicitly requests PPT,
  slides, or an演示大纲.

## Inputs and Output

Resolve `{vault}` from project then global `.tracework/config.yaml`.

Defaults:

- Date range: current Monday through today.
- Scope: explicit `all` or an exact registered group such as `work` or
  `personal`; otherwise
  `profile.default_reporting_group`; otherwise `work`.
- Format: `brief`. Use `slides` only for explicit PPT/slide wording.
- Output: `{vault}/Work Diary/Weekly/{YYYY-WNN}.md`, unless the user or config
  provides another path.

If the target exists, ask before overwriting unless the user requested update,
rewrite, or overwrite. If no vault exists, return the report in conversation.

## Workflow

### 1. Resolve and Partition

1. Load projects from the prompt, `raw/projects.json`, or current repo.
2. Resolve each project's `reporting_group` from project config, then registry.
3. Filter for the exact requested group. For `all`, keep groups separate
   throughout analysis and writing.
4. Exclude unassigned projects from scoped output and report the missing
   classification. Show them separately only in `all`.

### 2. Gather Evidence

For every in-scope project:

1. Read matching `{vault}/raw/weeks/{week}/{slug}.json` entries.
2. Read optional artifact dossiers for navigation and recorded scope.
3. Run a lightweight git log only to detect uncovered work.
4. Merge duplicate raw/git signals before analysis.

Raw entries are the semantic source. Git-only work remains `limited` and cannot
substantiate a completed outcome or invented trade-off.

### 3. Analyze and Rank

Apply `references/subagent-prompt.md` in the main dialog. Produce coherent work
streams, then rank them inside each reporting group by:

- observable end-state significance;
- management relevance;
- evidence strength;
- effect on the next planning decision.

Write one weekly judgment per group. Use normally three result arcs; two to four
is acceptable. Put every remaining meaningful stream in the portfolio table.
Do not allocate slides or prose by entry count.

### 4. Project Slides When Requested

Skip this step for brief mode. For slides, transform the weekly analysis into a
department-facing deck before applying the slide template.

1. Treat plain `weekly PPT` or slide wording as a department update from an
   individual contributor. Use a technical-review deck only when the user
   explicitly asks for a technical review, architecture review, or equivalent.
2. Select two to three core results. A result earns main-deck space because it
   changes a material state or decision, not because its implementation is
   complicated.
3. Build the result evidence and visual candidates defined in
   `references/subagent-prompt.md`. Validate metric comparability before
   recommending a chart.
4. Route each result through the presentation triad:

   ```text
   why it changed -> how the new solution works -> whether it worked
   Before/After      Solution Logic               Data or validation
   ```

   A normal result covers at least two parts. A core solution-logic result must
   cover all three.
5. When a core technical result changes data flow, control flow, execution
   timing, state generation, component responsibility, provider or strategy
   dispatch, or failure handling and fallback, the main deck must contain a
   solution-logic diagram brief. This is a quality gate, not an optional visual
   suggestion.
6. Keep at most two to three solution-logic diagrams in the main deck. Move
   supporting mechanisms and implementation detail to the technical appendix.
7. Route parameter tuning, small refactors, code cleanup, and configuration
   edits that do not change runtime behavior to the portfolio. Do not manufacture
   diagrams for them.

Use these visual routes:

| Evidence or mechanism | Visual route |
|---|---|
| Comparable algorithm, model, quality, latency, cost, or throughput data | comparison, distribution, trend, timeline, or waterfall chart brief |
| One reliable number | number card |
| Architecture, process, ownership, or failure-path change | Before/After diagram |
| Concurrency, asynchronous stages, or stage collaboration | sequence or swimlane diagram |
| Data processing, aggregation, or materialized rebuild | data-flow diagram |
| Provider, model, or strategy dispatch | decision tree |
| Failure handling and fallback | failure-path diagram |
| Lifecycle or state transition | state machine |
| Component responsibility change | architecture relationship diagram |

If data is missing, incomparable, or contradictory, do not invent a chart.
Use a mechanism or state-change diagram, lower the evidence boundary, expose
the measurement gap, and name its closure criterion.

### 5. Write

- Default: use `weekly-brief-template.md`.
- Explicit PPT/slides: use `slide-template.md` and keep the main deck to 6-10
  slides, excluding the evidence appendix.
- Put report-local `O#`, `W#`, `D#`, and `E#` primarily in the evidence appendix.
  Main prose must be readable without ids.
- Preserve risks, unresolved decisions, and evidence gaps.

## Coverage

Calculate project coverage as raw entries versus uncovered commits, but put
coverage badges in the appendix or portfolio—not in the headline narrative.

- High: raw explains intent and status.
- Moderate: mixed raw and git-only gaps.
- Low: mostly git-only; narrative is limited.
- None: no usable work signal.

Coverage measures source completeness, not value.

## Quality Gate

- Scope partition happened before headline ranking.
- `work` contains no personal or unassigned titles, paths, commits, artifacts, or refs.
- Every group has exactly one weekly judgment.
- Headline arcs explain constraint, movement, end state, meaning, and gate.
- Normally three and never more than four headline arcs per group.
- Every meaningful non-headline stream appears in the portfolio.
- Next-week closure targets number two to four, normally three.
- Brief mode can be presented in about five minutes per group.
- Slide mode has 6-10 main slides per group and no stream-by-stream page quota.
- Slide 2 communicates the stage judgment, key results, largest gate, and
  collaboration need in about 30 seconds.
- Every main-deck slide title states the conclusion supported by that slide.
- Every slide has at most one primary visual and one main conclusion.
- An algorithm or effectiveness claim uses comparable data with metric, unit,
  baseline, current value, sample scope, method, and evidence boundary when
  those fields apply. Missing fields remain visible rather than guessed.
- A core runtime-mechanism change has a solution-logic diagram brief containing
  its trigger, actors, main flow, material branches, fallbacks, output,
  invariants, remaining boundary, and evidence references.
- A solution-logic diagram explains how the solution works; it never counts as
  evidence that the solution worked.
- Normal results cover at least two of Before/After, Solution Logic, and Data or
  Validation. Results with `solution_logic.significance=core` cover all three.
- The main deck contains at most two to three solution-logic diagrams.
- Mechanism completion, effect validation, and production acceptance are stated
  separately.
- Every unresolved risk or next-week target has a concrete closure criterion.
- Main slides omit commit hashes, source locations, SDK line numbers, and raw
  evidence ids unless the user explicitly requested a technical-review deck.
- Evidence grades and uncertainty are preserved.

## Anti-Patterns

- Flat project or commit list as the overview.
- One slide per stream by default.
- Cross-group themes in `all` mode.
- Activity volume promoted into outcomes.
- Evidence ids dominating the spoken narrative.
- Hiding work because it did not qualify as a headline.
- Topic-only slide titles such as `结果弧线一` or `工作组合状态`.
- Charts without comparable evidence, units, or sample context.
- Treating expected impact as an observed result.
- Treating code completion as production acceptance.
- Decorative architecture diagrams with only component names and arrows.
- Using a solution-logic diagram as proof of effectiveness.
