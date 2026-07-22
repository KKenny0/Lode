---
name: weekly
description: >
  Generate a management-facing weekly report from Tracework raw entries, using
  git only as limited fallback coverage. Supports work, personal, and private
  all-project scopes. Three modes: quick conversation review ("这周做了啥",
  "周报简版", "quick weekly", "本周概要"), default Markdown brief ("写周报",
  "周报", "/tracework:weekly", "weekly brief", "本周总结", "weekly report"),
  and slide outline only when weekly PPT is explicit ("weekly PPT", "周报 PPT",
  "weekly slides", "演示大纲"). Do not use for daily notes, generic slide
  decks, or single-commit analysis.
---

# Tracework Weekly

Turn a week of agent work into a management judgment: what situation changed,
which uncertainties closed, what remains gated, and where next week should
focus. Preserve all meaningful work without giving every stream equal headline
prominence.

## Modes

Resolve mode before gathering evidence. Prefer the strongest explicit cue.

Priority when cues conflict: `slides` > `quick` > `brief`.

| Mode | Triggers (examples) | Output | Write files | Heavy slide rules |
| :--- | :--- | :--- | :--- | :--- |
| `quick` | 这周做了啥, 周报简版, quick weekly, 本周概要 | Conversation 5–7 bullets + carried-forward | No | No |
| `brief` | 写周报, 周报, /tracework:weekly, weekly brief, 本周总结, weekly report | Management brief | Yes when vault exists; else conversation | No |
| `slides` | weekly PPT, 周报 PPT, weekly slides, 演示大纲; or PPT/slides only after this skill is already selected for a weekly report | 6–10 page department outline | Same as brief | Yes |

Default is `brief` when the request is a normal weekly report without PPT or
quick wording. Do not treat bare “PPT” or “slides” alone as a reason to start
this skill; those words select slides mode only inside an already weekly
report request.

Slide mode is a presentation projection over the weekly analysis, not a
paginated copy of the Markdown brief. The default slide audience is an
individual contributor reporting inside a department to managers and peers.

## Progressive References

Always:

- `references/reporting-narrative-contract.md` for scope partition, selection,
  closure, evidence, and audience safety.

For `brief` and `slides` only:

- `references/subagent-prompt.md` for structured analysis. Use the brief
  analysis path unless mode is `slides`.
- `references/weekly-brief-template.md` for brief output (and as analysis
  backbone before slides).

For `slides` only:

- Full slide sections in `references/subagent-prompt.md`
- `references/slide-template.md`

Do not read `slide-template.md` for `quick` or `brief`.

## Inputs and Output

Resolve `{vault}` from project then global `.tracework/config.yaml`.

Defaults:

- Date range: current Monday through today.
- Scope: explicit `all` or an exact registered group such as `work` or
  `personal`; otherwise `profile.default_reporting_group`; otherwise `work`.
- Mode: as above; default `brief`.
- Brief/slides file output: `{vault}/Work Diary/Weekly/{YYYY-WNN}.md`, unless
  the user or config provides another path. Quick mode never writes this file.

If the target brief/slides file exists, ask before overwriting unless the user
requested update, rewrite, or overwrite. If no vault exists, return brief or
slides content in conversation. Quick mode always stays in conversation.

## Workflow

### 0. Resolve Mode, Range, and Scope

1. Choose `quick`, `brief`, or `slides` from the mode table.
2. Resolve week range and reporting scope.
3. If mode is `quick`, follow **Quick Mode** and stop after its quality gate.
4. Otherwise continue with partition → evidence → analysis → write.

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

### 3. Analyze and Rank (brief and slides)

Apply `references/subagent-prompt.md` in the main dialog. For `brief`, keep
`slide_projection` null and do not build solution-logic diagram briefs,
implementation narratives, or chart briefs unless the user later upgrades to
slides.

Produce coherent work streams, then rank them inside each reporting group by:

- observable end-state significance;
- management relevance;
- evidence strength;
- effect on the next planning decision.

Write one weekly judgment per group. Use normally three result arcs; two to four
is acceptable. Put every remaining meaningful stream in the portfolio table.
Do not allocate prose by entry count.

### 4. Project Slides When Requested

Skip this entire step for `quick` and `brief`. Run it only for `slides`.

Transform the weekly analysis into a department-facing deck before applying
`references/slide-template.md`.

1. Treat plain `weekly PPT` or slide wording as a department update from an
   individual contributor. Use a technical-review deck only when the user
   explicitly asks for a technical review, architecture review, or equivalent.
2. Select two to three core results. A result earns main-deck space because it
   changes a material state or decision, not because its implementation is
   complicated.
3. Build the result evidence and visual candidates defined in the slide sections
   of `references/subagent-prompt.md`. Validate metric comparability before
   recommending a chart.
4. Route each result through the presentation triad:

   ```text
   why it changed -> how the new solution works -> whether it worked
   Before/After      Solution Logic               Data or validation
   ```

   A normal result covers at least two parts. A core solution-logic result must
   cover all three and add an implementation narrative that makes the logic
   speakable without turning it into a second source of technical truth.
5. When a core technical result changes data flow, control flow, execution
   timing, state generation, component responsibility, provider or strategy
   dispatch, or failure handling and fallback, the main deck must contain a
   solution-logic diagram brief. This is a slides-only quality gate. The result
   must also contain three short implementation narrative blocks: normal path,
   branch and fallback, and outcome and invariant. Derive them only from the
   result's existing `solution_logic` and evidence.
6. Keep at most two to three solution-logic diagrams in the main deck. Move
   supporting mechanisms and implementation detail to the technical appendix.
7. Route parameter tuning, small refactors, code cleanup, and configuration
   edits that do not change runtime behavior to the portfolio. Do not
   manufacture diagrams for them.

Use these visual routes only in `slides` mode:

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

- `quick`: conversation only; see Quick Mode.
- `brief`: use `weekly-brief-template.md`.
- `slides`: use `slide-template.md` and keep the main deck to 6-10 slides,
  excluding the evidence appendix.
- Put report-local `O#`, `W#`, `D#`, and `E#` primarily in the evidence
  appendix. Main prose must be readable without ids.
- Preserve risks, unresolved decisions, and evidence gaps.
- When evidence is thin or git-only, keep the main narrative short and mark
  `limited` explicitly rather than padding with architecture theater.

## Quick Mode

Triggers: `这周做了啥`, `周报简版`, `quick weekly`, `本周概要`, and clear
equivalents.

Behavior:

1. Resolve week range and scope (same defaults as brief).
2. Partition projects; exclude unassigned from scoped `work` / `personal`.
3. Read raw entries for in-scope projects. Optionally glance at git only to
   detect whether uncovered commits exist.
4. Do not read `slide-template.md`, do not build slide_projection, and do not
   require solution-logic diagrams or implementation narratives.
5. Output 5–7 bullets in the conversation only. Prefer
   `[archetype] summary`-style lines grounded in raw fields.
6. Append at most three carried-forward lines for open risks or unresolved
   decisions.
7. If no raw entries but meaningful git exists: say evidence is `limited`, list
   at most a few commit-derived bullets without inventing intent, and offer a
   full brief.
8. If no raw and no usable git: empty-state with a short hint to capture or run
   a full brief after more work signal exists.

Suggested shape:

```markdown
## {YYYY-WNN} 快速回顾（{scope}）

- [decision] …
- [build] …
- [repair] …

**结转**：… · …
```

Do not write vault files in quick mode.

## Coverage

Calculate project coverage as raw entries versus uncovered commits, but put
coverage badges in the appendix or portfolio—not in the headline narrative.

- High: raw explains intent and status.
- Moderate: mixed raw and git-only gaps.
- Low: mostly git-only; narrative is limited.
- None: no usable work signal.

Coverage measures source completeness, not value. Quick mode may mention
coverage in one line; it does not need badges.

## Quality Gate

### Shared (all modes that emit scoped narrative)

- Scope partition happened before ranking or bullet selection.
- `work` contains no personal or unassigned titles, paths, commits, artifacts, or refs.
- Evidence grades and uncertainty are preserved; git-only material stays `limited`.
- Activity volume is never promoted into outcomes.

### Quick only

- Conversation output only; no weekly file write.
- 5–7 bullets, plus at most three carried-forward lines.
- No slide structure, solution-logic diagrams, or implementation narratives.

### Brief only

- Every group has exactly one weekly judgment.
- Headline arcs explain constraint, movement, end state, meaning, and gate.
- Normally three and never more than four headline arcs per group.
- Every meaningful non-headline stream appears in the portfolio.
- Next-week closure targets number two to four, normally three.
- Every unresolved risk or next-week target has a concrete closure criterion.
- Brief mode can be presented in about five minutes per group.
- No requirement for Before/After diagrams, solution-logic diagrams,
  implementation narratives, or chart briefs.

### Slides only

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
- A core runtime-mechanism result has a non-empty implementation narrative
  covering the normal path, branch and fallback, and outcome and invariant.
  Each block stays to one or two sentences in the main deck; fuller mechanism
  detail belongs in the technical appendix.
- The implementation narrative is stored only in the slide projection. It
  restates supported solution logic in reader-friendly execution order and
  must not introduce a new mechanism, effect, or evidence claim.
- A solution-logic diagram explains how the solution works; it never counts as
  evidence that the solution worked.
- Normal results cover at least two of Before/After, Solution Logic, and Data or
  Validation. Results with `solution_logic.significance=core` cover all three
  and include the implementation narrative. Coverage is evaluated across the
  result's associated slides; the four artifacts do not have to share one page.
- The main deck contains at most two to three solution-logic diagrams.
- Mechanism completion, effect validation, and production acceptance are stated
  separately.
- Main slides omit commit hashes, source locations, SDK line numbers, and raw
  evidence ids unless the user explicitly requested a technical-review deck.

## Anti-Patterns

### All modes

- Flat project or commit list as the overview.
- Cross-group themes in `all` mode.
- Activity volume promoted into outcomes.
- Hiding work because it did not qualify as a headline (brief/slides) or
  omitting material risks from carried-forward (quick).
- Treating expected impact as an observed result.
- Treating code completion as production acceptance.
- Applying slides-only diagram or implementation-narrative gates to brief or
  quick output.

### Brief and slides

- Evidence ids dominating the spoken narrative.

### Slides only

- One slide per stream by default.
- Topic-only slide titles such as `结果弧线一` or `工作组合状态`.
- Charts without comparable evidence, units, or sample context.
- Decorative architecture diagrams with only component names and arrows.
- Node lists, field labels, or repeated titles presented as implementation
  narrative.
- Using a solution-logic diagram as proof of effectiveness.
