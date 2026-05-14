# Weekly Outline Benchmark

This benchmark documents the quality bar for `weekly`.

The actual eval fixtures may live locally under `skills/weekly/evals/`.
That directory is intentionally ignored by git so local benchmark runs can keep raw
examples, transcripts, and grading notes without publishing them.

## Goal

Verify that `weekly` stays raw-first:

- Use Lode raw change entries as the primary semantic source.
- Use git logs only for coverage checks and fallback evidence.
- Preserve architecture decisions, risks, and follow-up work instead of flattening
  everything into a success-only weekly report.

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

## Pass Criteria

A run passes when the output:

- Uses raw entries as the main narrative source whenever they exist.
- Keeps git commits out of the main narrative unless raw entries are missing or
  incomplete.
- Groups related entries into coherent work streams instead of listing raw items
  chronologically.
- Includes an overview slide and a summary/next-steps slide.
- Keeps `decision` and `risk` entries visible.
- Uses `artifact_context` and `related_docs` as evidence, not as the message
  itself.

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
