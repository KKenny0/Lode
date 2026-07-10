---
name: daily
description: >
  Generate or update workplace-facing daily reports from Tracework raw entries,
  using git only as limited fallback coverage. Supports work, personal, and
  private all-project scopes without mixing audiences. Use for
  "/tracework:daily", "更新日报", "写日报", "日报", "工作日志", "补日报",
  "daily note", or a dated daily work report. Do not use for agent handoff,
  meeting notes, generic prose reports, or git operations.
---

# Tracework Daily

Write a concise daily management-closure view. Answer what changed today, why
it matters, what is now closed or bounded, and the next gate. Do not produce a
module inventory or agent handoff.

## Required References

Read both before writing:

- `references/reporting-narrative-contract.md`: scope partition, closure types,
  headline selection, evidence rules, and audience safety.
- `references/daily-note-writing.md`: source handling, merge rules, and exact
  output shape.

## Configuration

Resolve configuration in this order:

1. Project `.tracework/config.yaml`
2. `~/.tracework/config.yaml`

The primary output defaults to `{vault}/Daily Note.md`, overridable through
`daily_note.path`. Project paths come from `daily_note.repos`, then
`{vault}/raw/projects.json`, then the current repo.

If no vault can be resolved, return the report in the conversation and suggest
`/tracework:cold-start-interview`. Do not create an unrequested vault.

## Workflow

1. **Resolve date and scope.**
   - Default date: today.
   - Accept a date range and write one section per date.
   - Parse explicit `all` or an exact registered reporting-group name such as
     `work` or `personal`.
   - Otherwise use `profile.default_reporting_group`; when absent, default a
     workplace-facing report to `work`.

2. **Partition projects before ranking.**
   - Read each project `profile.reporting_group`, then its `projects.json`
     `reporting_group`.
   - Apply the audience-safety rules in the shared narrative contract.
   - Exclude unassigned projects from scoped output and report the missing
     classification. Show them separately only in `all`.

3. **Collect raw entries.**
   - Calculate the ISO week and read
     `{vault}/raw/weeks/{week}/{slug}.json` for the target date.
   - Prefer factual top-level fields and optional `reporting` boundaries.
   - Artifact dossiers are optional navigation. Do not copy full artifacts.

4. **Check git coverage.**
   - Use lightweight commit subject/stat inspection only for work not already
     covered by raw entries.
   - Git-only material is `limited`; do not infer motivation, decisions,
     verified impact, or management meaning that the commit does not support.
   - Filter formatting, generated-bundle, and chore-only noise unless it is a
     recorded risk or release gate.

5. **Synthesize state transitions.**
   - Group entries and fallback commits by coherent work stream.
   - Merge feature/fix/refactor entries that describe one state transition.
   - For each reporting group, write one daily judgment and normally three
     headline advances. Two to four is acceptable when the evidence warrants
     it. Put remaining meaningful work under Other activity.
   - Preserve explicit risk, conflict, open question, rejected path, and
     evidence gaps.

6. **Write incrementally.**
   - Match existing `### YYYY.MM.DD` or `### YYYY-MM-DD` headings.
   - Merge into an existing date section; never duplicate the date.
   - Preserve the exact project label `- [Project Name]` and stable field labels
     required by Monthly.
   - Do not write an empty date section.

## Quality Gate

Before writing, verify:

- Scope partition happened before headline selection.
- A `work` report contains no personal or unassigned material, including evidence.
- Each reporting group has one clear daily judgment.
- Headline items describe starting situation, movement, end state, meaning, and
  next gate.
- Remaining meaningful work is still covered.
- `ongoing` and `risk` are not rewritten as completed outcomes.
- The report is readable in about one minute per reporting group.
- Source/evidence boundaries are explicit.

## References

- `references/reporting-narrative-contract.md`
- `references/daily-note-writing.md`
- `references/config-template.yaml`
