---
name: lode-session-recap
description: >
  Session-end change log extraction for weekly reporting. Use this skill when the user
  signals end of a work session — e.g. "收工", "今天到这", "done", "wrap up",
  "that's it for today", "好了", "先这样". Also trigger on explicit requests like
  "记录变更", "log changes", "记一下今天做了什么".
  Do NOT trigger when the user is simply saying goodbye or switching topics.
---

# Weekly Change Tracker

Session-end change extraction. When the developer wraps up work, read the conversation context and write structured change entries to Lode raw storage. These entries capture the **why** behind changes — intent and reasoning that git commits rarely convey.

## Configuration

此 skill 使用 Lode 统一配置系统。从以下位置解析知识库路径（`{vault}`），高优先级优先：

| 优先级 | 位置 | 说明 |
|--------|------|------|
| 1 | `.lode/config.yaml`（项目根目录） | 项目级覆盖 |
| 2 | `~/.lode/config.yaml` | 全局配置 |
| 3 | `$WEEKLY_PPT_PATH` 环境变量 | legacy fallback |
| 4 | `~/.weekly-ppt/` | legacy fallback 默认值 |

项目级配置覆盖全局配置的同名字段。如果无法解析 `{vault}`，简短说明未写入 raw log，不要阻塞用户收工。完整配置格式见 `references/weekly-ppt-convention.md`。

Use the repository helper for deterministic storage operations:

```bash
python <this-skill>/scripts/lode_raw.py append-entry --entry /tmp/lode-session-entries.json --cwd "$PWD"
```

此 skill 的产出路径：
- 写入：`{vault}/raw/weeks/{ISO-week}/{project-slug}.json`

## How It Works

### Step 1: Identify the Project

Determine which project was worked on during this session:

Use `python <this-skill>/scripts/lode_raw.py project-slug --cwd "$PWD"` when the helper is available. It applies the shared resolution order:

1. Check `.lode/config.yaml` (project-level then `~/.lode/config.yaml`) for `project_slug`
2. If not set, check `{vault}/raw/projects.json` — match the current working directory against project `path` fields → use the corresponding `slug`
3. If no match, derive a slug from the current working directory name (lowercase, replace spaces/underscores with hyphens)

### Step 2: Analyze Conversation Context

Read the full conversation history for this session and identify:

- **What changed** — files modified, features built, bugs fixed, code restructured
- **Why it changed** — the reasoning, the problem being solved, the design decision
- **Impact** — what this means for the project, downstream effects, risks

Prioritize signals that can appear in a weekly report:

- Shipped or meaningfully advanced capabilities
- Technical decisions, trade-offs, and rejected alternatives
- Risks, blockers, regressions, and follow-up work
- Cross-module or cross-stage contract changes
- Reliability, performance, migration, or validation improvements with clear impact

Deprioritize process-only changes unless they explain a report-worthy signal:

- File moves, formatting, comments, import cleanup
- Small config tweaks without user/system impact
- Intermediate experiments that were reverted or replaced
- Tooling noise, generated files, or local setup changes

Group related work into logical units. A session that touched 15 files for one feature should produce **one** entry, not 15. If several changes share the same user-facing or architecture goal, merge them into one entry even if they were implemented across multiple commits or files.

### Step 3: Generate Change Entries

For each distinct change, produce an entry following the schema in `references/weekly-ppt-convention.md` (read this file for the full spec, including structured guidance on writing summary and context).

The change entry JSON looks like this:

```json
{
  "timestamp": "ISO 8601",
  "type": "feature | fix | refactor | decision | risk",
  "summary": "1 sentence, engineering-level abstraction",
  "context": "1-2 sentences explaining why and impact",
  "related_docs": ["/absolute/path/to/doc"],
  "source": "session-recap"
}
```

- **type**: Classify as `feature` | `fix` | `refactor` | `decision` | `risk`
- **summary**: 1 sentence, engineering-level — what was done, not how
- **context**: 1-2 sentences — why it was done and what impact it has
- **related_docs**: absolute paths to any docs that were created or modified during this session (stage-docs, pipeline-docs, design docs)
- **source**: always `"session-recap"`
- **timestamp**: current time in ISO 8601

**Weekly-friendly writing rules:**

- **summary**: write the report-level outcome or decision, not the list of files touched
- **context**: explain why the work mattered and what it enables, prevents, or changes
- **related_docs**: include architecture docs, design docs, eval notes, or other durable evidence created or changed in the session
- **type**: use `decision` for design choices even when implementation is still pending; use `risk` for discovered issues even when no fix landed

**Granularity**: Maximum 5 entries per session. If the session was complex, aggressively merge related changes. A good default is 1-3 entries: one for the main outcome, one for an important decision, and one for a risk or follow-up if present. The goal is a concise weekly-report signal log, not a detailed diary.

### Step 4: Write to Weekly Log

Write the generated entry object or array to a temporary JSON file, then call the shared helper:

```bash
python <this-skill>/scripts/lode_raw.py append-entry \
  --entry /tmp/lode-session-entries.json \
  --cwd "$PWD"
```

The helper resolves `{vault}`, calculates the current ISO week, resolves the project slug, creates `{vault}/raw/weeks/{ISO-week}/`, validates required entry fields, and appends to the existing `{project-slug}.json` array.

If the helper is unavailable or returns an error, briefly explain that the raw log was not written and do not block session wrap-up.

### Step 5: Confirm

Print a brief confirmation, e.g.:

```
记录了 3 条变更 → comic-automation (2026-W15)
  写入: {vault}/raw/weeks/2026-W15/comic-automation.json
  - [feature] Built scene composition system
  - [fix] Fixed LLM timeout in narrative stage
  - [decision] Chose constraint solver over manual layout
```

No further action needed from the user.

## Anti-Patterns

- **Don't record trivia** — file moved, comment added, import reorganized, git config changed. If it wouldn't appear in a weekly report slide, it shouldn't be here.
- **Don't write essays** — each entry is 2-3 sentences max. summary (1 sentence) + context (1-2 sentences).
- **Don't fabricate** — only record what actually happened in the conversation. If the session was just reading code and discussing, say so honestly or skip entirely.
- **Don't ask for confirmation** — this should be frictionless. Write the entries and show the summary. If the user wants to correct something, they'll say so.
- **Don't split related work** — 3 commits that all serve one feature = 1 entry, not 3.
- **Don't preserve process noise** — if an item only explains how the session unfolded, not what changed in the project, leave it out.
