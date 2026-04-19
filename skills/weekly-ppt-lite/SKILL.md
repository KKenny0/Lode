---
name: weekly-multi-project-ppt-lite
description: Use when consolidating multiple projects weekly git activity into a presentation outline, or when user requests cross-project weekly reports, 周报, weekly PPT, or multi-project status summaries
---

# Weekly Multi-Project PPT Lite

## Overview

Convert **multiple projects' weekly git commits** into a structured Markdown PPT outline. Each project gets an independent narrative using a unified template. Cross-project themes appear only on the overview slide.

**Related skill:** weekly-report-ppt (for actual .pptx file generation)

## When to Use

- Multiple projects running in parallel need a consolidated weekly report
- User wants git history summarized into presentation format

**Not for:** Actual .pptx generation, non-git-based reporting.

## Quick Reference

| Phase | Executor | Input | Output |
|-------|----------|-------|--------|
| 0: Scope | Main dialog | User prompt | Git logs + params |
| 1: Analysis | Subagent × N | Git logs + template | Structured JSON (with work_streams) |
| 2: Stitching | Main dialog | JSONs | Markdown PPT outline |

## Inputs

| Parameter | Required | Default | How to resolve |
|-----------|----------|---------|----------------|
| Time range | No | `this_week` | "本周" → this_week; "上周" → last_week |
| Projects (name + repo path) | **Yes** | — | From prompt, or ask user |
| Mode: `tech` / `report` | No | `tech` | Infer from context |
| Priority order | No | Auto | By commit volume (see below) |

**Mode:** `tech` = 6-part narrative with technical approach; `report` = 4-part focused on outcomes. See [references/slide-template.md](references/slide-template.md) for both structures.

**Priority (auto):** Sort by commit count descending. ≥10 commits → Core; 5-9 → Supporting; <5 → Exploratory. User override takes precedence.

**Work streams:** The subagent identifies work streams from commit patterns — each stream is a narratively independent group of changes. Multi-project mode: one stream per project by default. Single-project mode: the subagent decides whether to split into streams based on commit clustering. See [references/subagent-prompt.md](references/subagent-prompt.md) for the detection criteria.

## Phase 0: Scope Gathering

Parse the user's prompt and collect missing parameters before dispatching subagents.

### Date Calculation

- `this_week`: current week's Monday → today
- `last_week`: previous week's Monday → previous week's Sunday

### Git Log Collection

For each project:
```bash
git -C <repo_path> log --oneline --no-merges --since="<start_date>"
```

For `last_week`, add `--until="<this_monday_date>"`. Dates are YYYY-MM-DD.

**Edge cases:**
- Repo path invalid → ask user to verify, don't guess
- No commits in range → mark as "maintenance week"
- All projects maintenance week → output overview slide only with a note

Pass collected logs into Phase 1's subagent as `{git_logs}`.

## Phase 1: Dispatch Subagents

For each project, dispatch a subagent using the template in [references/subagent-prompt.md](references/subagent-prompt.md). Multiple projects run in parallel. The subagent returns a `work_streams` array — each stream is an independent narrative unit with its own technical approach.

**Error handling:**
- Subagent returns non-JSON → retry with "Return ONLY valid JSON, no markdown fencing"
- Missing required fields → fill from available data; impossible to infer → "待确认"

## Phase 2: PPT Stitching

Assemble the final Markdown PPT outline from collected JSONs. Each project's `work_streams` array drives the slide layout. Apply [references/slide-template.md](references/slide-template.md) per stream based on mode and priority.

**Slide budget per stream (by total stream count):**

| Stream count | Core stream | Supporting stream | Exploratory stream |
|---|---|---|---|
| 1 | 3-4 slides (full narrative) | 2-3 slides | 1-2 slides |
| 2-3 | 2-3 slides (background + tech/approach combined) | 1-2 slides | 1 slide |
| 4+ | 2 slides (key changes + results) | 1 slide | merge into overview |

When streams share close context (e.g. a bug fix stream and the feature it fixes), consider merging their slides to avoid redundancy.

**Overview slide:** 1 sentence per stream. Natural cross-stream themes are fine when they genuinely emerge, but don't force them.

**Summary slide:** Aggregate next steps and status from all streams into one table.

## Anti-Patterns

| Anti-Pattern | Symptom | Fix |
|-------------|---------|-----|
| commit流水账 | Commits listed verbatim | Group and abstract into engineering descriptions |
| 项目拼接 | Each project has different slide format | Apply same template; vary depth by priority |
| 没有目标 | "做了一些优化" without why | Every stream needs a clear goal |
| 跨项目强行融合 | Invented themes in project slides | Keep cross-project themes on overview slide only |
| Raw git appendix | Commit logs in main slides | Logs are input, not output. Use optional appendix for verification |

## Clarity Over Constraints

The goal is to explain the work clearly, not to hit arbitrary limits. That said:

- **key_changes** should only list items that are distinct enough to warrant separate explanation. If 5 items naturally emerge, include all 5 — but ask whether any can be merged for narrative coherence.
- **Slide density** should match what a presenter can actually talk through. If a slide needs a diagram to explain the approach, that's the right amount. If it's a wall of text that no one would read on screen, split it.
