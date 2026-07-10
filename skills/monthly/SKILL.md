---
name: monthly
description: >
  Generate a raw-first monthly management review, using Daily and Weekly reports
  as prior human judgments rather than semantic truth. Supports work, personal,
  and private all-project scopes. Use for "/tracework:monthly", "月报",
  "月度总结", "月度回顾", "monthly review", or monthly Daily Note archiving.
  Do not use for performance packaging or unsupported value claims.
---

# Tracework Monthly

Write a phase-level judgment: what state changed this month, which outcomes or
decisions matter, which risks repeated, and what next month should close. Raw
entries are the semantic source. Daily and Weekly are editorial context and
coverage, not stronger evidence.

## Required References

Read:

- `references/reporting-narrative-contract.md`
- `references/daily-note-format.md`
- `references/worklog-summary-template.md`
- `references/project-tagging-guide.md` when Daily project labels are ambiguous
- `references/tracework-storage-convention.md` for storage details

## Inputs and Outputs

Resolve `{vault}` from project then global `.tracework/config.yaml`.

Inputs:

- `{vault}/raw/weeks/` entries matching the target month: semantic source.
- `{vault}/Daily Note.md`: daily judgments, date index, and legacy coverage.
- Matching `{vault}/Work Diary/Weekly/*.md`: optional prior prioritization hints.

Outputs:

- Monthly archive: `{vault}/Work Diary/Monthly/{YYYY-MM}.md`
- Signals: `{vault}/raw/months/{YYYY-MM}/signals.json`
- Skeleton: `{vault}/raw/months/{YYYY-MM}/skeleton.json`
- Review: `{vault}/Work Diary/Monthly/{YYYY-MM}.summary.md`

## Workflow

### 1. Resolve Month and Scope

- Parse explicit `all` or an exact registered reporting-group name such as
  `work` or `personal`.
- Otherwise use `profile.default_reporting_group`; when absent, default a
  workplace-facing review to `work`.
- Partition projects before ranking. Apply the audience-safety rules in the
  shared narrative contract.
- Exclude unassigned projects from scoped output and report the missing
  classification; show them separately only in `all`.

### 2. Archive Daily Note

Run `<this-skill>/scripts/split_daily_note.py` to preserve the original monthly
Daily sections without rewriting them. Existing archives follow the configured
overwrite policy.

### 3. Build Raw-First Context

Run:

```bash
python <this-skill>/scripts/prepare_monthly_data.py \
  --input {vault}/Work\ Diary/Monthly/{YYYY-MM}.md \
  --vault {vault} \
  --month {YYYY-MM} \
  --signals-output {vault}/raw/months/{YYYY-MM}/signals.json \
  --skeleton-output {vault}/raw/months/{YYYY-MM}/skeleton.json
```

The script performs deterministic extraction only. It preserves matching raw
entries, Daily report fields, project grouping, source coverage, and conflicts.
It does not decide importance or write the review.

### 4. Write the Review

Use raw entries for status, impact, decisions, risks, evidence, and end-state
claims. Use Daily judgments and matching Weekly reports to understand what was
previously emphasized, but never let a repeated Daily phrase override a later
raw status.

For each reporting group:

- Write one monthly judgment.
- Select normally three phase-result arcs; two to four is acceptable.
- Keep all remaining meaningful projects in the portfolio.
- Surface only recurring risks supported by repeated timestamps, explicit
  recurrence metadata, or an unresolved risk carried across periods.
- Write two to four next-month closure targets, normally three.
- Put evidence and activity metadata in appendices.

`all` is a private combined review with separate complete sections per group.
Never rank work and personal projects together.

### 5. Report Execution

Return the output paths, selected scope, raw coverage, Daily-only coverage,
warnings, and whether existing files were overwritten.

## Conflict Rules

- Later raw state supersedes earlier raw state when the lifecycle/thread match
  is explicit.
- Daily/raw disagreement remains visible and lowers confidence.
- Git-only or Daily-only material is `limited`.
- Repetition across days does not prove importance or completion.
- Artifact dossiers provide navigation and recorded scope, not independent
  verification unless direct evidence is present.

## Quality Gate

- Scope partition happened before selection.
- Work output contains no personal or unassigned material, including appendices.
- Raw entries are the semantic source whenever available.
- Every group has one monthly judgment and normally three phase arcs.
- Portfolio coverage preserves meaningful non-headline work.
- Recurring risks have actual repeated or carried evidence.
- Next-month targets name closure gates, not every task.
- Candidate Rules appear only when explicitly requested.
- Main review is roughly 40-80 lines per group, excluding appendices.
- Activity counts never substantiate outcomes.
