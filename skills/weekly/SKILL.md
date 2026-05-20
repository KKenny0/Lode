---
name: weekly
description: >
  Convert weekly Lode raw change entries and fallback git commits into a structured
  Markdown PPT outline for presentation. Use this skill for "/lode:weekly".
  Triggers on requests like "周报", "写周报", "本周总结", "weekly PPT",
  "weekly report", "weekly outline", "总结这周工作", "这周做了什么",
  "multi-project status", "cross-project summary", "presentation outline from
  git". Also triggers when user wants to summarize work across repos, prepare a
  weekly slide deck, or consolidate development activity into a report. Supports
  single-project mode too. Key phrases: "周报大纲", "PPT 大纲", "本周汇报",
  "git 周报". Do NOT trigger for: daily notes,
  architecture docs, single-commit lookups, or non-git-based reporting.
---

# Weekly Multi-Project PPT Lite

## Overview

Convert **weekly Lode raw change entries** into a structured Markdown PPT outline, using git commits only as coverage checks and fallback evidence. The weekly outline is Lode's week-level compounding layer: it should explain what changed, what decisions carried forward, which open questions remain, and how hard problems changed next-week planning. Each project gets an independent narrative using a unified template. Cross-project themes appear only on the overview slide.

## Quick Reference

| Phase | Executor | Input | Output |
|-------|----------|-------|--------|
| 1. Scope & Gather | Main dialog | User prompt + config | Raw entries + optional git coverage + params |
| 2. Analyze | Main dialog | Raw entries + fallback git logs + template | Structured JSON (with work_streams) |
| 3. Stitch & Output | Main dialog | JSONs | Markdown PPT outline saved to `{vault}/Work Diary/Weekly/{YYYY-WNN}.md` |

## Inputs

| Parameter | Required | Default | How to resolve |
|-----------|----------|---------|----------------|
| Time range | No | `this_week` | "本周" → this_week; "上周" → last_week |
| Projects (name + repo path + slug) | No | `{vault}/raw/projects.json` or current repo | Prompt overrides project registry |
| Mode: `tech` / `report` | No | `tech` | Infer from context |
| Output path | No | `{vault}/Work Diary/Weekly/{YYYY-WNN}.md` | Prompt overrides config; config overrides default |
| Priority order | No | Auto | By commit volume (see below) |

**Mode:** `tech` = 6-part narrative with technical approach; `report` = 4-part focused on outcomes. See [references/slide-template.md](references/slide-template.md) for both structures.

**Priority (auto):** Prefer `projects.json` `priority` when present. Otherwise sort by raw entry count plus uncovered commit count: ≥5 signals → Core; 2-4 → Supporting; <2 → Exploratory. User override takes precedence.

**Work streams:** Analyze raw entries first to identify narratively independent groups of changes. Use `summary`, `context`, `archetype`, `type`, `artifact_context`, and `related_docs` as the main semantic input. Use git commits only to fill gaps when raw entries are missing or incomplete. Multi-project mode: one stream per project by default. Single-project mode: decide whether to split into streams based on raw entry clustering. See [references/subagent-prompt.md](references/subagent-prompt.md) for the reusable analysis template and detection criteria.

Merge duplicate signals before analysis. New adaptive-depth `session-recap` entries may contain both motivation and technical evidence through `artifact_context`. Historical `arch-doc` entries are legacy evidence; if one describes the same change as a `session-recap` entry, combine them into one work stream. Fallback git commits can add coverage notes, but must not create a duplicate stream for work already explained by raw entries.

## Output Contract

Primary output is a Markdown PPT outline in the knowledge vault wiki layer:

```text
{vault}/Work Diary/Weekly/{YYYY-WNN}.md
```

Resolve the output path in this order:
1. User-provided explicit output path
2. `weekly_outline.output_path` from `.lode/config.yaml`
3. `weekly_outline.output_dir` from `.lode/config.yaml` plus `{YYYY-WNN}.md`
4. Default path: `{vault}/Work Diary/Weekly/{YYYY-WNN}.md`

Create the output directory if it does not exist. If the target file already exists, ask before overwriting unless the user explicitly requested update, rewrite, or overwrite behavior.

If `{vault}` cannot be resolved and no explicit output path was provided, return the Markdown outline in the chat and tell the user to run `/lode:cold-start-interview` or configure `knowledge_vault`.

After writing the file, report the absolute output path.

## Phase 0: Scope & Gather

Parse the user's prompt, resolve configuration, and collect missing parameters before analysis.

### Date Calculation

- `this_week`: current week's Monday → today
- `last_week`: previous week's Monday → previous week's Sunday

### Project Resolution

- Resolve `{vault}` using the Lode configuration convention.
- If the prompt lists projects, use those names/paths/slugs as overrides.
- Otherwise read `{vault}/raw/projects.json` and include registered projects.
- If no registry exists, use the current repo as a single project and derive the slug from the repo directory.

### Raw Entry Collection

For each project, read `{vault}/raw/weeks/{week}/{slug}.json` and filter entries whose `timestamp` falls inside the requested date range.

Primary fields:
- `summary` + `context`: main narrative signal
- `archetype`: session shape and treatment depth
- `type`: category and risk/decision signal
- `source`: distinguish current session recap from legacy architecture documentation
- `artifact_context`: embedded scope/delta/source-of-truth evidence for technical approach
- `related_docs`: optional deep evidence for technical approach
- `motivation`, `exploration_paths`, `root_cause`, `open_questions`, `abandoned_alternatives`, `status`, `impact`: compounding signals for next-week planning

Use `artifact_context` before reading files from disk. If `related_docs` points to an existing architecture or design document, read it only when the raw entry is not enough to explain the technical approach. Do not read every related document by default.

Read `{vault}/raw/artifacts/{slug}.json` when present. Use artifact index metadata as optional source navigation for high-value docs. Missing artifact index must not block output. Do not invent decision facts from artifact titles alone.

### Raw Data Coverage

Before analysis, compute the coverage ratio for each project:

```
coverage = raw_entry_count / (raw_entry_count + uncovered_commit_count)
```

Show one badge per project:

- `coverage >= 0.7`: "High signal — {N} raw entries, {M} git-only gaps"
- `0.3 <= coverage < 0.7`: "Moderate — {N} raw entries, {M} git-only gaps. Consider running /lode:capture"
- `coverage < 0.3`: "Low signal — mostly git-only. Narrative may miss decisions and trade-offs"
- `coverage = 0` (no raw entries at all): "No raw data — fallback git analysis only. Quality limited."

Display this badge prominently at the top of each project's analysis section in the final output.

### Git Coverage Check

For projects with a repo path, run a lightweight git log only to detect uncovered work:

```bash
git -C <repo_path> log --oneline --no-merges --since="<start_date>"
```

For `last_week`, add `--until="<this_monday_date>"`. Dates are YYYY-MM-DD.

Compare commit subjects against raw entry summaries/contexts. If a commit is clearly covered by a raw entry, exclude it from analysis. Pass only uncovered commits forward as fallback evidence.

**Edge cases:**
- Raw entries exist and git path is missing/invalid → proceed from raw entries; mention that git coverage was skipped
- No raw entries but repo path valid → fallback to git log analysis and mark resulting streams as lower-confidence / fallback-only
- No raw entries and no valid git path → mark as "maintenance week" or ask user for project source
- All projects maintenance week → output overview slide only with a note

Pass collected raw entries and uncovered git logs into Phase 1 as `{raw_entries}` and `{fallback_git_logs}`.

## Phase 1: Analyze

For each project, use the template in [references/subagent-prompt.md](references/subagent-prompt.md) to produce a structured analysis. Analysis runs in the main dialog. The analysis returns a `work_streams` array — each stream is an independent narrative unit with its own technical approach.

Raw entries are authoritative for intent and impact because they were produced at session wrap-up time. Adaptive-depth `session-recap` entries may be both intent-rich and evidence-rich. Legacy `arch-doc` entries remain valid evidence. Fallback git commits are lower-confidence evidence and should never override or duplicate a clear raw entry.

The analysis must preserve decisions revisited, open questions carried forward,
and hard problems that changed next-week planning. Fallback-only streams must be
marked lower confidence in the narrative or next steps.

**Error handling:**
- Analysis returns non-JSON → retry with "Return ONLY valid JSON, no markdown fencing"
- Missing required fields → fill from available data; impossible to infer → "待确认"

## Phase 2: Stitch & Output

Assemble the final Markdown PPT outline from collected JSONs. Each project's `work_streams` array drives the slide layout. Apply [references/slide-template.md](references/slide-template.md) per stream based on mode and priority.

Write the assembled outline to the resolved output path from the Output Contract.

**Slide budget per stream (narrative-density driven):**

Evaluate each stream independently based on its narrative density — archetype depth matters more than entry count. Never penalize a rich stream just because other streams exist.

| Density | Criteria | Slides | Layout |
|---|---|---|---|
| Rich | 4+ raw entries, **or** any entry with `artifact_context` / `exploration_paths` / `root_cause` + `abandoned_alternatives` — these carry full narrative arcs even in a single entry | 3-4 | Full |
| Moderate | 2-3 entries with some archetype depth, **or** 1 entry with `root_cause` + `open_questions` (repair/investigation singletons) | 2 | Standard |
| Light | 1 maintenance entry without archetype depth, or fallback-only from git | 2 | Standard |
| Empty | 0 meaningful changes after filtering | merge into overview | — |

Never classify a single repair/investigation/decision entry as Light just because the count is 1.

**Total slide range:** For a week with N non-trivial streams:
- 1 stream: 6-8 slides (title + overview + 3-4 content + summary)
- 2-3 streams: 9-14 slides
- 4+ streams: 12-18 slides

Do NOT compress individual streams to stay under 10 slides. Each stream deserves a complete narrative arc. The slide count should reflect the week's actual work density.

When streams share close context (e.g. a bug fix stream and the feature it fixes), consider merging their slides to avoid redundancy — but do not merge purely to reduce slide count.

**Overview slide:** 1 sentence per stream. Natural cross-stream themes are fine when they genuinely emerge, but don't force them.

**Hard stuff this week:** Add this section to the summary slide only when raw
entries contain at least one supported risk, recurring open question, stale
thread, or abandoned alternative worth revisiting. Omit the section entirely
when empty. This is the absorbed hard-stuff radar behavior for weekly planning;
it must cite raw-entry evidence and must not invent concerns from git subjects
or artifact titles alone.

**Summary slide:** Aggregate next steps and status from all streams into one table.

## Anti-Patterns

| Anti-Pattern | Symptom | Fix |
|-------------|---------|-----|
| commit流水账 | Commits listed verbatim | Prefer raw entry summaries/contexts; use commits only as fallback evidence |
| 项目拼接 | Each project has different slide format | Apply same template; vary depth by priority |
| 没有目标 | "做了一些优化" without why | Every stream needs a clear goal |
| 跨项目强行融合 | Invented themes in project slides | Keep cross-project themes on overview slide only |
| Raw git appendix | Commit logs in main slides | Logs are coverage evidence, not the main narrative |
| Phase inflation | Treating the 3 phases as rigid quality gates | Phases are an execution checklist; the goal is a clear PPT reference, not process compliance |

## Clarity Over Constraints

The goal is to explain the work clearly, not to hit arbitrary limits. That said:

- **key_changes** should only list items that are distinct enough to warrant separate explanation. If 5 items naturally emerge, include all 5 — but ask whether any can be merged for narrative coherence.
- **Slide density** should match what a presenter can actually talk through. If a slide needs a diagram to explain the approach, that's the right amount. If it's a wall of text that no one would read on screen, split it.
