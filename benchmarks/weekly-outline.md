# Weekly Outline Benchmark

This benchmark documents the quality bar for `weekly`.

The actual eval fixtures may live locally under `skills/weekly/evals/`.
That directory is intentionally ignored by git so local benchmark runs can keep raw
examples, transcripts, and grading notes without publishing them.

## Goal

Verify that `weekly` stays raw-first while implementing the report-local 3+1
contract:

- Use Lode raw change entries as the primary semantic source.
- Use git logs only for coverage checks and fallback evidence.
- Preserve architecture decisions, risks, and follow-up work instead of flattening
  everything into a success-only weekly report.
- Roll work up into at most three outcome/progress items and allow every material
  claim to drill down through `O#`/`W#`/`D#`/`E#` references.
- Apply the Fruit Check so activity volume cannot masquerade as an outcome.

## Core Scenarios

### 1. Raw Entries Sufficient

Raw entries exist for the target week and project.

Expected behavior:

- Build the weekly narrative from `summary`, `context`, `archetype`, `type`,
  `artifact_context`, and `related_docs`.
- Use git log only to check whether obvious commits are missing from raw entries.
- Avoid duplicate work streams based on commit subjects already covered by raw.
- Use `projects.json` priority when present.

### 2. Raw Missing, Fallback Git

No raw entries exist, but a valid repo path exists.

Expected behavior:

- Fall back to git log analysis.
- Filter out low-value `chore`, formatting, and generated-file noise.
- Mark fallback-only streams as lower confidence or evidence-limited.
- Present any headline candidate as `limited` progress, never as an outcome.
- Still produce a usable Markdown PPT outline.

### 3. Adaptive Raw With Artifact Context

Raw entries include `source: session-recap`, `archetype`, and
`artifact_context`.

Expected behavior:

- Treat `artifact_context` as high-confidence technical signal.
- Discuss the architecture change, contract boundary, decision, repair root
  cause, or risk; do not flatten the entry into a file update.
- Read related docs only when raw entry text and `artifact_context` are not
  enough to explain the technical approach.
- Preserve risks and migration constraints in the final summary or next steps.

### 4. Legacy Arch-Doc Compatibility

Historical raw entries may include `source: arch-doc` and `related_docs`.

Expected behavior:

- Treat legacy `arch-doc` entries as high-confidence technical evidence.
- Merge legacy `arch-doc` entries with matching `session-recap` entries instead
  of duplicating work streams.

### 5. Verified Outcome With Full Traceability

A raw entry records an observable result and points to a matching commit plus a
test/eval result or source-of-truth artifact.

Expected behavior:

- Promote the result to an `O#` outcome only when it passes the Fruit Check.
- Grade it `verified`, link it to at least one supporting `W#`, and map the
  outcome and stream claims to concrete `E#` entries.
- Preserve any explicit choice or rejected/deferred alternative as a `D#` claim
  with evidence.
- Use unique, report-local IDs across multiple projects.

### 6. Recorded Impact Without Independent Verification

A raw entry explicitly records status and impact but has no commit, test/eval,
issue state, or source-of-truth artifact that independently verifies the claim.

Expected behavior:

- The item may be an outcome when the recorded state change is concrete, but it
  must be graded `recorded`, never `verified`.
- A raw entry's existence is provenance, not independent verification.
- The evidence appendix makes the limitation visible.

### 7. Activity Inflation and Prospective Impact

Inputs contain many commits/tasks/files, or describe only expected future
benefit, without a recorded outcome.

Expected behavior:

- Do not mechanically merge activity into a major outcome.
- Label bounded work as progress or `activity`; keep expected impact explicitly
  prospective.
- Keep the work visible even when it cannot support an `O#` outcome.

### 8. More Than Three Candidate Headlines

Four or more defensible candidates exist across one or multiple projects.

Expected behavior:

- Slide 2 contains no more than three `O#` items for the whole report.
- Remaining work streams stay visible as supporting or unaligned work rather
  than disappearing.
- Selection favors impact and evidence strength, not commit or entry count.

### 9. Conflicting or Inferred Decisions

Raw entries contain conflicting status statements, or a trade-off can only be
inferred from the available material.

Expected behavior:

- Preserve the conflict instead of selecting the more positive interpretation.
- Mark inferred decisions as `inferred`; do not present them as explicit facts.
- Link every material `D#` claim to its supporting `E#` source.

### 10. Tech and Report Mode Parity

Run the same input once in `tech` mode and once in `report` mode.

Expected behavior:

- Both outputs retain the same headline limit, Fruit Check, evidence grades,
  and `O#`/`W#`/`D#`/`E#` traceability backbone.
- `tech` includes fuller problems, technical approach, and diagrams; `report`
  shortens those sections without losing claim-level evidence.

## Pass Criteria

A run passes when the output:

- Uses raw entries as the main narrative source whenever they exist.
- Keeps git commits out of the main narrative unless raw entries are missing or
  incomplete.
- Groups related entries into coherent work streams instead of listing raw items
  chronologically.
- Includes an overview slide and a summary/next-steps slide.
- Uses Slide 2 for at most three report-wide outcome/progress items rather than
  a flat stream list.
- Applies `verified`, `recorded`, and `limited` according to their defined
  evidence boundaries.
- Never promotes fallback-only work to an outcome.
- Keeps meaningful unaligned work visible as exploration, maintenance, or activity.
- Keeps `decision` and `risk` entries visible.
- Uses `artifact_context` and `related_docs` as evidence, not as the message
  itself.
- Assigns unique report-local `O#`, `W#`, `D#`, and `E#` identifiers without
  changing the raw-entry schema or weekly output path.
- Includes a claim-level evidence appendix; an unlinked commit dump does not pass.

## Suggested Run Record

Record each benchmark run locally with:

- Date and model.
- Repository commit SHA.
- Skill version or local diff summary.
- Scenario name.
- Pass/fail for each assertion.
- Short failure reason and output excerpt for failed assertions.

## When To Run

Run this benchmark after changes to:

- `skills/weekly/SKILL.md`
- `skills/weekly/references/subagent-prompt.md`
- `references/weekly-ppt-convention.md`
- `capture` raw entry production rules
- evidence grading, Fruit Check, or report-local traceability rules
