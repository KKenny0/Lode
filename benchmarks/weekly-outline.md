# Weekly Outline Benchmark

This benchmark documents the quality bar for `lode-weekly-outline`.

The actual eval fixtures may live locally under `skills/lode-weekly-outline/evals/`.
That directory is intentionally ignored by git so local benchmark runs can keep raw
examples, transcripts, and grading notes without publishing them.

## Goal

Verify that `lode-weekly-outline` stays raw-first:

- Use Lode raw change entries as the primary semantic source.
- Use git logs only for coverage checks and fallback evidence.
- Preserve architecture decisions, risks, and follow-up work instead of flattening
  everything into a success-only weekly report.

## Core Scenarios

### 1. Raw Entries Sufficient

Raw entries exist for the target week and project.

Expected behavior:

- Build the weekly narrative from `summary`, `context`, `type`, `source`, and
  `related_docs`.
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

### 3. Raw With Related Architecture Docs

Raw entries include `source: arch-doc` and `related_docs`.

Expected behavior:

- Treat `arch-doc` entries as high-confidence technical signals.
- Discuss the architecture change, contract boundary, decision, or risk; do not
  say only that a document was written.
- Read related docs only when raw entry text is not enough to explain the
  technical approach.
- Preserve risks and migration constraints in the final summary or next steps.

## Pass Criteria

A run passes when the output:

- Uses raw entries as the main narrative source whenever they exist.
- Keeps git commits out of the main narrative unless raw entries are missing or
  incomplete.
- Groups related entries into coherent work streams instead of listing raw items
  chronologically.
- Includes an overview slide and a summary/next-steps slide.
- Keeps `decision` and `risk` entries visible.
- Uses `related_docs` as evidence, not as the message itself.

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

- `skills/lode-weekly-outline/SKILL.md`
- `skills/lode-weekly-outline/references/subagent-prompt.md`
- `references/weekly-ppt-convention.md`
- `lode-session-recap` or `lode-arch-doc` raw entry production rules
