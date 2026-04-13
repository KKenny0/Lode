---
name: weekly-change-tracker
description: >
  Session-end change log extraction for weekly reporting. Use this skill when the user
  signals end of a work session — e.g. "收工", "今天到这", "done", "wrap up",
  "that's it for today", "好了", "先这样". Also trigger on explicit requests like
  "记录变更", "log changes", "记一下今天做了什么".
  Do NOT trigger when the user is simply saying goodbye or switching topics.
---

# Weekly Change Tracker

Session-end change extraction. When the developer wraps up work, reads the conversation context and writes structured change entries to the shared weekly-ppt storage. These entries capture the **why** behind changes — intent and reasoning that git commits rarely convey.

## When to Use

- User signals end of work: "收工", "今天到这", "done", "wrap up", "that's it for today", "好了", "先这样"
- User explicitly asks: "记录变更", "log changes", "记一下今天做了什么"

**Not for:** generating reports, summarizing code, creating documentation — those are separate skills. This skill only writes raw change log entries.

## How It Works

### Step 1: Identify the Project

Determine which project was worked on during this session:

1. Check `{base_path}/projects.json` — match the current working directory against project `path` fields → use the corresponding `slug`
2. If no match, derive a slug from the current working directory name (lowercase, replace spaces/underscores with hyphens)

### Step 2: Analyze Conversation Context

Read the full conversation history for this session and identify:

- **What changed** — files modified, features built, bugs fixed, code restructured
- **Why it changed** — the reasoning, the problem being solved, the design decision
- **Impact** — what this means for the project, downstream effects, risks

Group related work into logical units. A session that touched 15 files for one feature should produce **one** entry, not 15.

### Step 3: Generate Change Entries

For each distinct change, produce an entry following the schema in `references/weekly-ppt-convention.md` (read this file for the full spec).

- **type**: Classify as `feature` | `fix` | `refactor` | `decision` | `risk`
- **summary**: 1 sentence, engineering-level — what was done, not how
- **context**: 1-2 sentences — why it was done and what impact it has
- **related_docs**: absolute paths to any docs that were created or modified during this session (stage-docs, pipeline-docs, design docs)
- **source**: `"session-recap"`
- **timestamp**: current time in ISO 8601

**Granularity**: Maximum 5 entries per session. If the session was complex, aggressively merge related changes. The goal is a concise log, not a detailed diary.

### Step 4: Write to Weekly Log

1. Calculate current ISO week: `date +%Y-W%V`
2. Ensure directory exists: `{base_path}/weeks/{ISO-week}/`
3. If `{project-slug}.json` already exists, read the existing array
4. Append new entries to the array
5. Write the updated file

### Step 5: Confirm

Print a brief confirmation, e.g.:

```
记录了 3 条变更 → comic-automation (2026-W15)
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
