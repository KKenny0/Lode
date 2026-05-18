---
name: capture
description: >
  Adaptive-depth session-end recap for weekly reporting and decision replay.
  Use this skill for "/lode:capture" or when the user signals end of a work
  session — e.g. "收工", "今天到这", "done", "wrap up", "that's it for
  today", "好了", "先这样".
  Also trigger on explicit requests like "记录变更", "log changes",
  "记一下今天做了什么". Do NOT trigger when the user is simply saying goodbye
  or switching topics.
---

# Adaptive-Depth Session Recap

Session-end signal extraction. When the developer wraps up work, read the
conversation context and produce raw entries rich enough for weekly outlines,
monthly reviews, decision roadmaps, and session-start recall.

The goal is not a chronological diary. Capture the durable engineering signal:
why the work happened, what was decided, what was tried, what changed, and what
future sessions need to remember.

## Zero-Config Mode

This skill works with or without a configured knowledge vault:

- **With vault**: entries are written to
  `{vault}/raw/weeks/{ISO-week}/{project-slug}.json`; durable artifact indexes
  are written to `{vault}/raw/artifacts/{project-slug}.json` when applicable.
- **Without vault**: entries are rendered as structured Markdown directly in the
  conversation. No files written, no directories created. A one-line setup hint
  follows the output.

Zero-config mode is best-effort. Fill every field that can be inferred from the
conversation, but do not interrogate the user only to satisfy a schema field.
Depth enforcement is warning-based in the helper, not a hard block.

## Step 1: Classify The Session Archetype

Read the full conversation context and choose one primary archetype. Apply these
rules in priority order:

1. If the session chose between approaches or design trade-offs → `decision`
2. If the session fixed a bug, regression, or reliability issue → `repair`
3. If the session explored a problem without shipping a fix or feature →
   `investigation`
4. If the session shipped a working feature or capability → `build`
5. Otherwise → `maintenance`

If multiple archetypes apply, choose the one with the strongest signal. A fix
after exploration is usually `repair`; a feature that mainly records a design
choice is usually `decision`. If uncertain, use `build` and fill the optional
fields supported by evidence.

## Step 2: Extract Report-Worthy Signals

Start with the decision landscape, then use files, commits, and commands as
evidence. Extract in this order:

- Motivation: the problem, goal, or constraint that made the work necessary
- Exploration paths: approaches tried, outcomes observed, and trade-offs
- Abandoned alternatives: options rejected and why
- What changed: shipped capability, fix, refactor, decision, or risk
- Impact: what the work enables, prevents, simplifies, or changes downstream
- Open questions: unresolved decisions, risks, or next-session entry points
- Artifact context: durable artifacts created or materially changed

Prioritize signals that can appear in a weekly report:

- Shipped or meaningfully advanced capabilities
- Technical decisions, trade-offs, and rejected alternatives
- Risks, blockers, regressions, and follow-up work
- Prompt, schema, orchestration, migration, or contract changes
- Reliability, performance, validation, or developer-workflow improvements

Skip process-only noise unless it explains a larger report-worthy signal:
formatting, import cleanup, file moves, generated files, local setup, or
intermediate experiments that were fully replaced.

Group related work into logical units. A session that touched many files for one
feature should usually produce one entry. Maximum 5 entries; 1-3 is the normal
range.

## Step 3: Generate Raw Entries

Follow `references/weekly-ppt-convention.md`. The change entry JSON shape is:

```json
{
  "timestamp": "ISO 8601",
  "archetype": "decision | build | investigation | repair | maintenance",
  "type": "feature | fix | refactor | decision | risk",
  "summary": "1 sentence, engineering-level abstraction",
  "context": "1-2 sentences explaining why and impact",
  "source": "session-recap",
  "status": "done | ongoing | risk | decision",
  "related_docs": ["/absolute/path/to/doc"],
  "impact": "report-ready user, system, reliability, or workflow impact",
  "evidence_refs": ["commit SHA, issue ID, eval ID, or doc path"],
  "decision_threads": ["stable-decision-thread"],
  "lifecycle_transition": {
    "subject": "decision:stable-decision-thread",
    "from": "proposed",
    "to": "chosen",
    "reason": "Why this session changed the lifecycle state"
  },
  "source_refs": [
    {
      "type": "commit | issue | eval | doc | conversation | other",
      "ref": "stable source id",
      "path": "/absolute/path/when-local",
      "url": "https://example.com/when-remote",
      "note": "short evidence note"
    }
  ],
  "motivation": "why this work was needed now",
  "exploration_paths": ["approach tried -> observed outcome"],
  "abandoned_alternatives": ["approach rejected -> reason"],
  "open_questions": ["unresolved question or next-session entry point"],
  "root_cause": "repair-only: 1-2 sentence cause of the bug or reliability issue",
  "artifact_context": [
    {
      "artifact_path": "/absolute/path/to/artifact",
      "scope": "What this artifact governs",
      "delta": "What changed in this session",
      "open_questions": ["unresolved artifact question"],
      "source_of_truth": ["path/to/implementation", "path/to/tests"]
    }
  ],
  "sync_suggestions": ["Review DESIGN.md because the session changed a contract."]
}
```

### Archetype Field Expectations

| Archetype | Required when known | Purpose |
|---|---|---|
| `decision` | `motivation`, `exploration_paths` | Preserve why one approach won |
| `build` | `motivation`, `impact` | Explain what shipped and why it matters |
| `investigation` | `exploration_paths`, `open_questions` | Preserve findings without pretending work shipped |
| `repair` | `motivation`, `root_cause` | Keep the concrete failure path reusable |
| `maintenance` | core fields only | Avoid over-documenting low-risk cleanup |

These are adaptive-depth expectations. In vault mode the helper logs warnings
for missing archetype fields; it does not reject the entry.

### Decision Tracking Fields

Add `decision_threads` when the entry belongs to a durable decision topic. Use
stable slug-like terms; decision replay treats these as stronger than artifact
hints or keyword-derived topics when assigning `thread_id`.

Add `lifecycle_transition` only when the session explicitly changes the state of
an open question, risk, decision, or artifact. Use `subject`, `from`, `to`, and
`reason` when known; leave the field absent instead of guessing.

Add `source_refs` when evidence needs typed structure. Each object must include
`type` and `ref`; optional fields are `path`, `url`, `note`, and `timestamp`.

### Artifact Context

Add `artifact_context` only when the session created or materially changed a
durable artifact, such as `DESIGN.md`, `PLAN.md`, `AGENTS.md`, README,
architecture docs, prompt contracts, schema contracts, migration notes, or
checklists.

Each artifact context must include:

- `artifact_path`: absolute path to the artifact
- `scope`: what the artifact governs
- `delta`: what changed in this session
- `source_of_truth`: implementation, tests, prompts, schemas, or docs that make
  the artifact checkable
- `open_questions`: unresolved artifact-level questions, when present

When `artifact_context` is present and a vault is configured, also upsert an
artifact index entry with `scripts/lode_raw.py upsert-artifact`. Use
`source: "capture"`. If `artifact_index.enabled` is `false`, config
cannot be resolved, or the helper fails, skip the artifact-index side effect and
continue.

### Sync Suggestions

Add `sync_suggestions` when the entry mentions decisions, contract changes,
prompt/schema changes, orchestration rules, or intent artifacts that may need
human review.

Keep suggestions conservative. A suggestion means "this file may need review",
not "this file is stale" and not "apply this diff".

## Step 4: Output Or Write

Resolve `{vault}` using the standard priority order:

| Priority | Location | Scope |
|---|---|---|
| 1 | `.lode/config.yaml` | Project-level override |
| 2 | `~/.lode/config.yaml` | Global default |
| 3 | `$WEEKLY_PPT_PATH` | Legacy fallback |
| 4 | `~/.weekly-ppt/` | Legacy fallback default |

Use the bundled helper when available. Each helper call requires the JSON to be
on disk as a file — the scripts read `--entry` / `--artifact` paths, not stdin.

### Step 4a: Resolve config and write entry JSON to a temp file

```bash
python <this-skill>/scripts/lode_raw.py resolve-config --cwd "$PWD"
```

Then use the **Write tool** (not bash heredoc, pipe, or redirect) to write the
entry JSON array to `{project}/.lode/tmp-entry.json`. The Write tool guarantees
the file content is flushed to disk before the helper reads it. Do NOT use
heredoc or `cat > file` — those can leave stale content from a previous session.

### Step 4b: Append the entry

```bash
python <this-skill>/scripts/lode_raw.py append-entry \
  --entry .lode/tmp-entry.json \
  --cwd "$PWD"
```

The helper resolves config, calculates the ISO week, resolves the project slug,
validates required fields, logs adaptive-depth warnings, and appends the entry
object or array.

### Step 4c: Clean up

```bash
rm .lode/tmp-entry.json
```

Delete the temp file only after Step 4b succeeds. If the helper fails, keep the
temp file for debugging and fall back to Markdown output.

### Artifact index entries

For each durable artifact index entry, follow the same Write → call → cleanup
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
记录了 {N} 条变更 -> {slug} ({week})
  写入: {vault}/raw/weeks/{week}/{slug}.json
  - [{archetype}/{type}] {summary}
```

Zero-config mode needs no extra confirmation because the Markdown recap is the
deliverable.

## Quality Gate

Before finalizing each entry, check:

- Does it explain why, not just what?
- Is `archetype` accurate from the conversation evidence?
- Are archetype-specific fields filled when available?
- Would this help a weekly report or future decision roadmap?
- Is the summary a report-level outcome, not a file-level description?
- Are durable artifacts represented through `artifact_context`, not vague prose?

## Anti-Patterns

- Do not fabricate fields to satisfy the schema.
- Do not ask confirmation questions just to enrich optional fields.
- Do not preserve process noise that would never appear in a weekly review.
- Do not split one coherent feature across many entries.
- Do not write new entries with `source: "arch-doc"`; that source is legacy-only.
- Do not generate formal Stage/Pipeline architecture documents from this skill.
