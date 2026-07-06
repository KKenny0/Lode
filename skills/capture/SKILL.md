---
name: capture
description: >
  Adaptive-depth session recap and low-friction checkpoint capture for weekly
  reporting, daily/monthly review inputs, artifact dossiers, and decision
  replay. Use this skill for "/tracework:capture" or when the user signals end
  of a work session — e.g. "收工", "今天到这", "done", "wrap up", "that's it for
  today", "好了", "先这样".
  Also trigger on explicit requests like "记录变更", "log changes",
  "记一下今天做了什么", "记一下当前进展", or "checkpoint". Do NOT trigger when
  the user is simply saying goodbye or switching topics.
---

# Adaptive-Depth Session Recap

Session-end and checkpoint signal extraction. When the developer wraps up work
or explicitly asks to checkpoint the current progress, read the conversation
context and produce raw entries rich enough for weekly outlines, monthly
reviews, decision roadmaps, and session-start recall.

The goal is not a chronological diary. Capture the durable engineering signal:
why the work happened, what was decided, what was tried, what changed, and what
future sessions need to remember.

## Zero-Config Mode

This skill works with or without a configured knowledge vault:

- **With vault**: entries are written to
  `{vault}/raw/weeks/{ISO-week}/{project-slug}.json`; durable artifact dossiers
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

Default mode is a session-end recap. It is triggered by `/tracework:capture`, "收工",
"done", and similar wrap-up signals.

Checkpoint mode is a mid-session progress record. Trigger it when the user says
"checkpoint", "记一下当前进展", `/tracework:capture checkpoint`, or clearly asks to
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

## Operational References

Keep this file focused on signal extraction. Read
`references/capture-operations.md` when you need any of these mechanics:

- Enabling, disabling, or troubleshooting auto-capture hooks
- Writing raw entries or artifact dossier entries through `tracework_raw.py`
- Handling helper failures and zero-config fallback
- Formatting vault-mode confirmations and capture receipts

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
- Reporting boundary: whether this is an outcome, progress, or activity; what
  impact and evidence boundary should survive into daily/weekly/monthly reports
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

### Downstream 3+1 Mapping

Capture does not assign report-local `O#`, `W#`, `D#`, or `E#` identifiers.
Weekly and monthly reports assign those labels after they have gathered the full
period's raw entries and can compare claims across streams.

Instead, make each raw entry easy for downstream reports to map:

- `reporting.outcome_candidate`, `status`, `impact`, `impact_boundary`, and
  `evidence_boundary` provide candidate `O#` material, bounded by the Fruit
  Check.
- `reporting.work_stream` or top-level `work_stream` provides an optional `W#`
  grouping hint when the narrative group is obvious from the session. Leave it
  absent rather than guessing.
- `decision_threads`, `exploration_paths`, `abandoned_alternatives`, and
  `lifecycle_transition` provide candidate `D#` material.
- `evidence_refs`, `source_refs`, and `artifact_context.source_of_truth` provide
  candidate `E#` material.

## Step 3: Generate Raw Entries

Follow `references/tracework-storage-convention.md`. The change entry JSON shape is:

```json
{
  "timestamp": "ISO 8601 (set by helper; LLM-provided value is overwritten with server clock)",
  "archetype": "decision | build | investigation | repair | maintenance",
  "type": "feature | fix | refactor | decision | risk",
  "summary": "1 sentence, engineering-level abstraction",
  "context": "1-2 sentences explaining why and impact",
  "source": "session-recap",
  "status": "done | ongoing | risk | decision",
  "work_stream": "optional report grouping hint when obvious",
  "reporting": {
    "outcome_candidate": {
      "kind": "outcome | progress | activity",
      "statement": "bounded report claim"
    },
    "impact_boundary": "observed | expected | unknown",
    "evidence_boundary": "verified | recorded | limited",
    "evidence_gap": "missing evidence before strengthening the claim",
    "module_scope": ["module-or-area"],
    "work_stream": "optional report grouping hint",
    "carry_forward": {
      "daily": ["human-facing follow-up"],
      "weekly": ["report carry-forward"],
      "monthly": ["review carry-forward"]
    },
    "hard_signals": [
      {
        "kind": "risk | open_question | abandoned_alternative | candidate_rule_signal",
        "statement": "reusable hard signal"
      }
    ]
  },
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

### Reporting Metadata

Add `reporting` only when the report boundary is clear from the session. It is
for human daily/weekly/monthly outputs, not for agent handoff. Use
`outcome_candidate.kind` conservatively:

- `outcome`: a recorded state change or deliverable exists.
- `progress`: bounded advancement exists, but the outcome is not complete or
  not independently verified.
- `activity`: work happened and should remain visible, but it is not a
  defensible outcome.

Use `impact_boundary` and `evidence_boundary` to prevent later reports from
overstating the claim. Name `evidence_gap` when verification is missing. Do not
copy report-local `O#`, `W#`, `D#`, or `E#` labels into raw JSON.

### Fruit Check

Before accepting an entry, make sure its report-level claim has a real
"fruit": a changed user, product, system, reliability, migration, or workflow
state. Activity counts, commits, files touched, tokens, logs, and documents are
evidence or inputs; they are not outcomes by themselves.

- `work_stream` groups related work for later reporting. It does not prove that
  the grouped work produced an outcome.
- `summary` states the factual change or decision at the boundary actually
  reached. Do not promote an experiment, partial implementation, or plan into
  shipped work.
- `impact` states an observed downstream effect when one is known. If it is
  prospective, label it explicitly with wording such as "expected to", "can",
  or "intended to"; never rewrite the expectation as an achieved result.
- `status` bounds every claim: `done` means the described scope completed,
  `ongoing` means progress only, `risk` is unresolved exposure, and `decision`
  records a choice rather than implementation.
- `evidence_refs`, `source_refs`, and `artifact_context.source_of_truth` support
  verification. Their existence does not by itself prove the `impact` claim.

If no fruit can be stated honestly, preserve a narrower decision,
investigation, maintenance, or risk signal instead of manufacturing an
outcome.

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
artifact dossier entry with `<this-skill>/scripts/tracework_raw.py upsert-artifact`.
Use `source: "capture"`. If `artifact_index.enabled` is `false`, config
cannot be resolved, or the helper fails, skip the artifact-index side effect and
continue.

The dossier should include enough `artifact_summary`, `source_entry_refs`,
`last_seen`, `source_availability`, and `deletion_behavior` for a future agent
to understand the artifact boundary even if the source file moves. Do not paste
the full artifact content into the dossier.

### Sync Suggestions

Add `sync_suggestions` when the entry mentions decisions, contract changes,
prompt/schema changes, orchestration rules, or intent artifacts that may need
human review.

Keep suggestions conservative. A suggestion means "this file may need review",
not "this file is stale" and not "apply this diff".

## Step 4: Output Or Write

Read `references/capture-operations.md` before writing to the vault, upserting
artifact dossiers, registering the project, or handling helper failures.

Default behavior:

- Vault write succeeds: return a short confirmation plus the capture receipt.
- User requested verbose output: include the Markdown recap after confirmation.
- No vault or helper failure: return the Markdown recap directly and include the
  setup hint.

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

{if reporting present:
**汇报边界**: {outcome_candidate.kind}; impact={impact_boundary}; evidence={evidence_boundary}
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
运行 `/tracework:cold-start-interview` 可在约 2 分钟内完成设置。
```

## Confirmation

Use the quiet confirmation and receipt rules in
`references/capture-operations.md`. Zero-config mode needs no extra confirmation
because the Markdown recap is the deliverable.

## Quality Gate

Before finalizing each entry, check:

- Does it explain why, not just what?
- Is `archetype` accurate from the conversation evidence?
- Are archetype-specific fields filled when available?
- Would this help a weekly report or future decision roadmap?
- Is the summary a report-level outcome, not a file-level description?
- Does the Fruit Check distinguish actual state change from activity or an
  expected effect?
- If `reporting` is present, is `outcome_candidate.kind` no stronger than the
  evidence supports?
- Does `status` limit the claim correctly, especially for ongoing work, risks,
  and decisions?
- If `work_stream` is present, is it an obvious grouping hint rather than a
  report-local `W#` label or invented narrative?
- Do evidence references support the claim rather than merely exist beside it?
- Are durable artifacts represented through `artifact_context`, not vague prose?
- For checkpoint mode, is this a durable stage signal rather than a progress log?

## Anti-Patterns

- Do not fabricate fields to satisfy the schema.
- Do not ask confirmation questions just to enrich optional fields.
- Do not preserve process noise that would never appear in a weekly review.
- Do not use checkpoint mode to record command-by-command progress.
- Do not split one coherent feature across many entries.
- Do not assign `O#`, `W#`, `D#`, or `E#` labels in capture output or raw JSON.
  Those labels belong to weekly and monthly reports only.
- Do not write new entries with `source: "arch-doc"`; that source is legacy-only.
- Do not generate formal Stage/Pipeline architecture documents from this skill.
