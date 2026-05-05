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

Session-end change extraction. When the developer wraps up work, read the conversation context and produce structured change entries that capture the **why** behind changes — intent, exploration paths, and reasoning that git commits rarely convey.

## Zero-Config Mode

This skill works with or without a configured knowledge vault:

- **With vault**: entries are written to `{vault}/raw/weeks/{ISO-week}/{project-slug}.json` and a brief confirmation is shown.
- **Without vault**: entries are rendered as structured Markdown directly in the conversation. No files written, no directories created. A one-line setup hint follows the output.

The zero-config mode is the default first experience. Value before configuration.

## How It Works

### Step 1: Analyze Conversation Context

Read the full conversation history for this session. **Start with the decision landscape** — understand what problems were being solved, what alternatives were considered, what trade-offs were accepted. The concrete changes (files, commits) are evidence for decisions, not the primary output.

Extract in this order:

- **Decision context** — motivations, constraints, goals, the problems driving changes
- **Exploration paths** — approaches tried, alternatives rejected, reasons for rejection
- **What changed** — files modified, features built, bugs fixed, code restructured
- **Impact** — downstream effects, risks, dependencies created or removed
- **Open questions** — what remains unresolved at session end, entry points for next session

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

### Step 2: Generate Change Entries

For each distinct change, produce an entry following the schema in `references/weekly-ppt-convention.md` (read this file for the full spec, including structured guidance on writing summary, context, and quality levels). Prefer Good or Excellent raw entries: capture the durable engineering signal, not the fact that files changed.

The change entry JSON looks like this:

```json
{
  "timestamp": "ISO 8601",
  "type": "feature | fix | refactor | decision | risk",
  "summary": "1 sentence, engineering-level abstraction",
  "context": "1-2 sentences explaining why and impact",
  "related_docs": ["/absolute/path/to/doc"],
  "source": "session-recap",
  "status": "done | ongoing | risk | decision",
  "impact": "optional report-ready impact",
  "evidence_refs": ["optional commit SHA, issue ID, eval ID, or doc path"],
  "motivation": "optional: trigger reason and goal for the change",
  "exploration_paths": ["optional: approaches tried and outcomes"],
  "abandoned_alternatives": ["optional: approaches rejected and why"],
  "open_questions": ["optional: unresolved questions at session end"]
}
```

**Core fields**:

- **type**: Classify as `feature` | `fix` | `refactor` | `decision` | `risk`
- **summary**: 1 sentence, engineering-level — what was done, not how
- **context**: 1-2 sentences — why it was done and what impact it has
- **related_docs**: absolute paths to any docs that were created or modified during this session
- **source**: always `"session-recap"`
- **timestamp**: current time in ISO 8601
- **status**: recommended when clear — `done`, `ongoing`, `risk`, or `decision`
- **impact**: recommended when the user/system/reporting impact is clear

**Decision-recording fields** (fill when context is available; motivation is expected for every non-trivial entry):

- **motivation**: the trigger for this change — what problem was being solved, what constraint forced the change, or what goal was being pursued. **Expected for every entry that isn't a trivial fix.** An entry without motivation is a change log, not a decision record.
- **exploration_paths**: approaches tried during the session and their outcomes (e.g. "lazy loading → marginal gain on mobile first-screen"). Fill when the session involved comparing approaches or backtracking.
- **abandoned_alternatives**: approaches explicitly considered and rejected, with rejection reasons — valuable for future roadmap decisions. Fill when alternatives were discussed and ruled out.
- **open_questions**: unresolved decisions or questions at session end — entry points for the next session. Fill when there are genuine unknowns remaining.

**Quality gate** — before finalizing, check each entry:
- Does it explain WHY, not just WHAT? If motivation is empty and the entry isn't a trivial fix, reconsider whether it's report-worthy.
- Would someone who wasn't in this session understand the reasoning a month later?
- Is the summary a decision-level abstraction, not a file-level description?

**Weekly-friendly writing rules**:

- **summary**: write the report-level outcome or decision, not the list of files touched
- **context**: explain why the work mattered and what it enables, prevents, or changes
- **related_docs**: include architecture docs, design docs, eval notes, or other durable evidence created or changed in the session
- **type**: use `decision` for design choices even when implementation is still pending; use `risk` for discovered issues even when no fix landed

**Quality target**: write entries that would still make sense in a weekly report a month later. "Updated docs" is bad; "Clarified validation and repair-loop ownership so future schema migrations have a source of truth" is excellent.

**Granularity**: Maximum 5 entries per session. If the session was complex, aggressively merge related changes. A good default is 1-3 entries: one for the main outcome, one for an important decision, and one for a risk or follow-up if present. The goal is a concise weekly-report signal log, not a detailed diary.

### Step 3: Output

After generating entries, determine whether a knowledge vault is configured. Attempt to resolve `{vault}` using the standard priority order:

| Priority | Location | Scope |
|----------|----------|-------|
| 1 | `.lode/config.yaml` (project root) | Project-level override |
| 2 | `~/.lode/config.yaml` | Global default |
| 3 | `$WEEKLY_PPT_PATH` env var | Legacy fallback |
| 4 | `~/.weekly-ppt/` | Legacy fallback default |

Use `python <this-skill>/scripts/lode_raw.py resolve-config --cwd "$PWD"` to check, or inspect the config files directly.

#### 3A: Vault Configured — Write to Raw Log

Write the generated entry object or array to a temporary JSON file, then call the shared helper:

```bash
python <this-skill>/scripts/lode_raw.py append-entry \
  --entry /tmp/lode-session-entries.json \
  --cwd "$PWD"
```

The helper resolves `{vault}`, calculates the current ISO week, resolves the project slug, creates `{vault}/raw/weeks/{ISO-week}/`, validates required entry fields, and appends to the existing `{project-slug}.json` array.

If the helper is unavailable or returns an error, fall through to **Step 3B** (Markdown output) instead of blocking.

#### 3B: No Vault — Markdown Output

Output the entries as structured Markdown directly in the conversation. This is the primary deliverable, not a degraded fallback.

Use this template:

```markdown
## Session Recap — {project-dir-name} ({date})

{for each entry:

### {emoji} {type}: {summary}

{context}

{if motivation present:
**动机**: {motivation}
}

{if exploration_paths present:
**探索路径**:
{for each path:
  - {path} → {outcome}
}
{if the chosen path is clear:
  - 最终选择: {chosen approach}
}
}

{if abandoned_alternatives present:
**放弃的方案**: {join with '；'}
}

{if open_questions present:
**开放问题**:
{for each question:
  - {question}
}
}

---

}
```

Type-to-emoji mapping: `feature` → ✨, `fix` → 🔧, `refactor` → ♻️, `decision` → ⚖️, `risk` → ⚠️

**{date}** format: `YYYY-MM-DD`

**{project-dir-name}**: the current working directory's folder name

After the last entry, append a setup hint:

```
💡 配置 knowledge vault 可以持久保存这些记录，并在周报、月报中自动复用：
   mkdir -p ~/.lode && echo 'knowledge_vault: /your/path' > ~/.lode/config.yaml
```

### Step 4: Confirm

#### 4A: Vault Mode

Print a brief confirmation:

```
记录了 {N} 条变更 → {slug} ({week})
  写入: {vault}/raw/weeks/{week}/{slug}.json
  - [{type}] {summary}
  - [{type}] {summary}
```

#### 4B: Zero-Config Mode

The Markdown output from Step 3B already serves as confirmation. No additional summary needed — the user has already read the full recap.

No further action needed from the user in either mode.

## Anti-Patterns

- **Don't record trivia** — file moved, comment added, import reorganized, git config changed. If it wouldn't appear in a weekly report slide, it shouldn't be here.
- **Don't write essays** — each entry is 2-3 sentences max. summary (1 sentence) + context (1-2 sentences).
- **Don't fabricate** — only record what actually happened in the conversation. If the session was just reading code and discussing, say so honestly or skip entirely.
- **Don't ask for confirmation** — this should be frictionless. Write the entries and show the summary. If the user wants to correct something, they'll say so.
- **Don't split related work** — 3 commits that all serve one feature = 1 entry, not 3.
- **Don't preserve process noise** — if an item only explains how the session unfolded, not what changed in the project, leave it out.
- **Don't gate value behind configuration** — the zero-config Markdown output is the primary first experience. It should feel complete and valuable on its own.
- **Don't skip motivation** — every non-trivial entry should explain why the change was needed. An entry without motivation is a change log, not a decision record.
