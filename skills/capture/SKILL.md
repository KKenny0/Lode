---
name: capture
description: >
  Adaptive-depth session recap and low-friction checkpoint capture for weekly
  reporting and decision replay. Use this skill for "/lode:capture" or when
  the user signals end of a work session — e.g. "收工", "今天到这", "done",
  "wrap up", "that's it for today", "好了", "先这样".
  Also trigger on explicit requests like "记录变更", "log changes",
  "记一下今天做了什么", "记一下当前进展", or "checkpoint". Do NOT trigger when
  the user is simply saying goodbye or switching topics.
---

# Adaptive-Depth Session Recap

Session-end and checkpoint signal extraction. When the developer wraps up work
or explicitly asks to checkpoint the current progress, dispatch to the capture
subagent to produce raw entries rich enough for weekly outlines, monthly
reviews, decision roadmaps, and session-start recall.

The capture subagent (`agents/capture.md`) handles archetype classification,
signal extraction, and raw entry generation in its own context window. The
main session only compiles context, dispatches, writes the result to the vault,
and shows a receipt. This keeps the main session context clean.

The goal is not a chronological diary. Capture the durable engineering signal:
why the work happened, what was decided, what was tried, what changed, and what
future sessions need to remember.

## Zero-Config Mode

This skill works with or without a configured knowledge vault:

- **With vault**: entries are written to
  `{vault}/raw/weeks/{ISO-week}/{project-slug}.json`; durable artifact indexes
  are written to `{vault}/raw/artifacts/{project-slug}.json` when applicable.
  Output is quiet by default: after a successful write, return only a short
  confirmation unless the user explicitly asks for verbose output.
- **Without vault**: entries are rendered as structured Markdown directly in the
  conversation. No files written, no directories created. A one-line setup hint
  follows the output.

Zero-config mode is best-effort. Fill every field that can be inferred from the
conversation, but do not interrogate the user only to satisfy a schema field.
Depth enforcement is warning-based in the helper, not a hard block.

## Capture Modes

Default mode is a session-end recap. It is triggered by `/lode:capture`, "收工",
"done", and similar wrap-up signals.

Checkpoint mode is a mid-session progress record. Trigger it when the user says
"checkpoint", "记一下当前进展", `/lode:capture checkpoint`, or clearly asks to
record the current state before continuing. A checkpoint is not a diary entry.
Capture only durable stage signals:

- A decision made or clarified
- A meaningful phase completed or unblocked
- A risk, blocker, or open question discovered
- An abandoned approach and the reason it was dropped
- A next-session or next-phase entry point

Checkpoint entries use the same raw entry schema as session recaps. Prefer
`status: "ongoing"` unless the checkpoint records a clearly completed phase,
resolved repair, or chosen decision. Keep checkpoint entries shorter than
session-end recaps, but still preserve the "why" when it is available.

Verbose output is opt-in. Treat "verbose", "show recap", "展开总结", or an
explicit request to inspect the recap as a request to print the full Markdown
recap after writing. Quiet output remains the default in vault mode for both
session-end and checkpoint captures.

## Auto-Capture (Optional)

When configured, `/lode:capture` can run automatically at session end via a
Claude Code `Stop` hook, and before context compaction via a `PreCompact` hook.
This eliminates the dependency on remembering to say "收工".

**Enable**: Set `auto_capture.enabled: true` in `~/.lode/config.yaml`.
`/lode:cold-start-interview` sets this by default for new configurations.

**Hook configuration**: Add to `~/.claude/settings.json` under `hooks.Stop`:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "/lode:capture"
          }
        ]
      }
    ]
  }
}
```

**Disable**: Set `auto_capture.enabled: false` in `~/.lode/config.yaml`.
Remove the hook entry from `~/.claude/settings.json` to fully deactivate.

The hook runs best-effort — if the vault is not configured or the helper is
unavailable, the skill falls back to Markdown output in the conversation.

## Step 1: Dispatch to Capture Subagent

The capture subagent (`agents/capture.md`) handles archetype classification,
report-worthy signal extraction, and raw entry generation. It runs in its own
context window so the main session stays clean.

### 1a: Compile Session Context

Gather from the conversation:

- What the session accomplished (shipped features, fixes, decisions)
- What approaches were tried and rejected (abandoned alternatives)
- What was decided and why (motivation, trade-offs)
- What files or artifacts changed (especially durable artifacts)
- What risks, blockers, or open questions remain
- Whether this is session-end or checkpoint mode

### 1b: Dispatch

Read `agents/capture.md` for the subagent's full instructions (focus areas,
output format, scope rules, anti-patterns).

Dispatch to the capture subagent via the Agent tool with:
- The subagent prompt from `agents/capture.md`
- The compiled session context
- Whether this is session-end or checkpoint mode

The subagent returns a JSON array of raw entries.

### 1c: Fallback (Subagent Unavailable)

If the Agent tool or subagent is unavailable, follow the instructions in
`agents/capture.md` inline. The output is the same JSON array — only the
execution location changes.

## Step 2: Write Entry JSON and Append

### Output Policy

Use quiet output by default whenever a vault write succeeds. This applies to
manual `/lode:capture`, checkpoint capture, and auto-capture. Return only a
short confirmation such as:

```text
已记录 {N} 条进展 -> {slug} ({week})
```

If the user requested verbose output, also include the Markdown recap after the
write confirmation.

Zero-config mode is always verbose because the conversation output is the only
deliverable. Helper failures must not be silent: report the specific failure
briefly, then provide the Markdown fallback recap.

### Helper Resilience

The `lode_raw.py` helper is the canonical write path, but capture must not fail
when the helper is unreachable:

1. **Helper timeout**: If `python lode_raw.py resolve-config` takes > 10 seconds,
   briefly report the timeout and fall back to Markdown output.
2. **Helper missing**: If the script file is not found (e.g., incomplete
   installation), briefly report the missing helper and fall back to Markdown
   output.
3. **Parse errors**: If the helper returns non-JSON, fall back to Markdown output
   and report the error to the user.
4. **Write errors**: If `append-entry` fails with a disk/permission error, fall
   back to Markdown output and report the specific error.

In all fallback cases, the Markdown output is the primary deliverable. The vault
write is a side effect that must not block the recap.

Resolve `{vault}` using the standard priority order:

| Priority | Location | Scope |
|---|---|---|
| 1 | `.lode/config.yaml` | Project-level override |
| 2 | `~/.lode/config.yaml` | Global default |
| 3 | `$WEEKLY_PPT_PATH` | Legacy fallback |
| 4 | `~/.weekly-ppt/` | Legacy fallback default |

Use the bundled helper when available. Each helper call requires the JSON to be
on disk as a file — the scripts read `--entry` / `--artifact` paths, not stdin.

### Step 2a: Resolve config and write entry JSON to a temp file

```bash
python <this-skill>/scripts/lode_raw.py resolve-config --cwd "$PWD"
```

Then use the **Write tool** (not bash heredoc, pipe, or redirect) to write the
entry JSON array to `{project}/.lode/tmp-entry.json`. The Write tool guarantees
the file content is flushed to disk before the helper reads it. Do NOT use
heredoc or `cat > file` — those can leave stale content from a previous session.

### Step 2b: Append the entry

```bash
python <this-skill>/scripts/lode_raw.py append-entry \
  --entry .lode/tmp-entry.json \
  --cwd "$PWD"
```

The helper resolves config, calculates the ISO week, resolves the project slug,
validates required fields, logs adaptive-depth warnings, and appends the entry
object or array.

### Step 2c: Clean up

```bash
rm .lode/tmp-entry.json
```

Delete the temp file only after Step 2b succeeds. If the helper fails, keep the
temp file for debugging and fall back to Markdown output.

### Artifact index entries

For each durable artifact index entry, follow the same Write -> call -> cleanup
pattern:

1. Use the **Write tool** to write the artifact JSON to
   `{project}/.lode/tmp-artifact.json`.
2. Call the helper:
   ```bash
   python <this-skill>/scripts/lode_raw.py upsert-artifact \
     --artifact .lode/tmp-artifact.json \
     --cwd "$PWD"
   ```
3. On success, delete `rm .lode/tmp-artifact.json`.

If any helper call fails, fall back to Markdown output instead of blocking the
recap.

### Auto-registration

After successfully appending entries, ensure the project is registered in the
knowledge vault:

```bash
python <this-skill>/scripts/lode_raw.py register-project --cwd "$PWD"
```

This is a best-effort side effect that keeps `{vault}/raw/projects.json` current
for weekly and daily multi-project discovery. If the helper is unavailable or the
call fails, do not block the recap.

## Markdown Output Template

Use this template in zero-config mode or helper-failure fallback:

```markdown
## Session Recap — {project-dir-name} ({date})

### {type}: {summary}

{context}

**Archetype**: {archetype}

{if motivation present:
**动机**: {motivation}
}

{if impact present:
**影响**: {impact}
}

{if root_cause present:
**根因**: {root_cause}
}

{if exploration_paths present:
**探索路径**:
- {path}
}

{if abandoned_alternatives present:
**放弃的方案**:
- {alternative}
}

{if artifact_context present:
**Artifact context**:
- {artifact_path}: {delta}
}

{if open_questions present:
**开放问题**:
- {question}
}

{if sync_suggestions present:
**需要同步检查**:
- {suggestion}
}
```

After the final entry, append:

```text
配置 knowledge_vault 可以持久保存这些记录，并在周报、月报中自动复用。
运行 `/lode:cold-start-interview` 可在约 2 分钟内完成设置。
```

## Confirmation

Vault mode:

```text
已记录 {N} 条进展 -> {slug} ({week})
```

Use the fuller confirmation only when the user requested verbose output or when
debugging a write issue:

```text
记录了 {N} 条变更 -> {slug} ({week})
  写入: {vault}/raw/weeks/{week}/{slug}.json
  - [{archetype}/{type}] {summary}
```

Zero-config mode needs no extra confirmation because the Markdown recap is the
deliverable.

## Capture Receipt

After the vault-mode confirmation, append a 2-3 line receipt that gives the
user immediate signal from what was just captured. Zero-config mode does not
need a receipt because the full Markdown output already serves this purpose.

**Receipt template:**

```text
📋 {最关键的 summary}
   ⚠️ {N} 个风险 · ❓ {N} 个开放问题 · 🔄 {N} 个放弃方案
```

**Selection rules for the top summary:**

1. If any entry has `archetype: decision`, use its `summary`.
2. Otherwise, if any entry has an `impact` field, use that entry's `summary`.
3. Otherwise, use the first entry's `summary`.
4. If there is only one entry, use its `summary` directly.

**Signal counts** — count across all entries written in this capture:

- Risks: count of entries with `status: "risk"` plus entries whose
  `open_questions` contain risk-related phrasing.
- Open questions: total count of all `open_questions` items across entries.
- Abandoned alternatives: total count of all `abandoned_alternatives` items
  across entries.

**Omission rules:**

- When a count is 0, omit that segment entirely rather than showing "0 个".
- When all entries are `archetype: "maintenance"`, omit the 📋 prefix and use
  plain wording (e.g., the summary text without the emoji).

**Checkpoint receipt** is shorter — show only the top summary and open questions
(if any). Skip the full signal-count line.

**Example receipts:**

```
已记录 3 条进展 -> lode (2026-W23)
📋 选择了 SQLite 而非 LevelDB 做本地缓存
   ⚠️ 1 个风险 · ❓ 2 个开放问题 · 🔄 1 个放弃方案
```

```
已记录 1 条进展 -> my-app (2026-W23)
📋 完成了用户认证模块的 API 端点
```

```
已记录 2 条进展 -> tools (2026-W23)
更新了依赖版本并清理了无用导入
```
