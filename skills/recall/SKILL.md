---
name: recall
description: >
  Recall recent project memory at the start of an agentic coding session. Use
  this skill for "/lode:recall", when the user says "开工", "session start",
  "start session", "recall context", "继续上次", "接着做", or asks what to
  remember before implementing in the current repo. Intra-project only; does
  not do cross-project retrieval.
---

# Session Start Recall

This skill turns Lode from write-only memory into a read/write habit loop. It
prepares a bounded project context at the start of a session so the developer and
AI do not restart from zero.

## Scope

- Intra-project only.
- Raw entries are the semantic source of truth.
- Artifact index entries are optional source navigation.
- Decision context entries are optional synthesized decision-replay hints from
  `{vault}/raw/decisions/{project-slug}.json`.
- If the saved decision index is missing, invalid, empty, or older than the raw
  entries, the helper refreshes the derived decision index from raw entries as a
  best-effort side effect, then uses that fresh Decision Context.
- Do not use git commits as fallback in v1.
- Do not invent history when no vault data exists.

## Workflow

### Pre-Check: Vault Health

Before running the recall helper, do a quick health check:

1. Resolve vault path from config
2. Check if `{vault}/raw/weeks/` has any `{slug}.json` files
3. If no raw entries exist at all: suggest `/lode:capture` and stop
4. If raw entries exist but are older than 14 days: note staleness in output
5. If `recall_context.py` is missing: warn and suggest re-install
6. Check for pending captures (see Pending Capture Check below)

If the pre-check passes, continue to the main workflow:

1. Resolve the current project context.
2. Run the helper:

```bash
python <this-skill>/scripts/recall_context.py --cwd "$PWD" --limit 12
```

If the user explicitly names a project slug, pass `--slug <slug>`. If the user
or config provides a vault path, pass `--vault <path>`.

3. Read `references/recall-output-template.md`.
4. Produce Markdown in the conversation.

## Pending Capture Check

When a session experiences context compaction (manual or auto), the PreCompact
hook writes a pending marker to `{vault}/raw/pending/{session_id}.json`. This
check surfaces those markers so the context that was about to be lost can still
be captured.

### Check

```bash
python <this-skill>/scripts/lode_raw.py list-pending --cwd "$PWD"
```

If the helper is unavailable or returns an error, skip this check silently. It
is a best-effort enhancement, not a blocker.

### When Pending Captures Exist

Include a "Pending Captures" section at the end of the recall output:

```text
⚠️ 上次 session 经历了上下文压缩，有 {N} 条待处理的 capture：
  - {timestamp} ({trigger}) — transcript: {transcript_path or "unavailable"}
```

Then ask the user whether they want to process the pending capture(s) now. If
the user agrees:

1. For each pending file, dispatch the capture subagent
   (`skills/capture/agents/capture.md`) with:
   - The transcript path from the pending file (if available)
   - The project slug and cwd from the pending file
   - A note that this is a delayed capture from a compacted session
2. The subagent returns raw entries JSON.
3. Write the entries via `lode_raw.py append-entry` (same as manual capture).
4. Mark the pending as consumed:

```bash
python <this-skill>/scripts/lode_raw.py consume-pending \
  --pending-file "{pending_file_path}"
```

5. Confirm to the user: "已补充记录 {N} 条进展 from compacted session."

If the user declines, leave the pending markers in place. They will be surfaced
again on the next recall.

### When No Pending Captures Exist

Do not mention pending captures in the output. The check is invisible.

## Output Contract

The response must include:

- Recent progress
- Relevant decisions
- Decision Context, when `{vault}/raw/decisions/{project-slug}.json` exists
  or can be rebuilt in memory from raw entries
- Abandoned alternatives that may affect the current task
- Open questions
- Risks to check before implementation
- Repo-local docs worth reading
- Potentially stale intent artifacts
- Pending captures from compacted sessions, when any exist
- Suggested entry point for the current session

If there is no vault or no raw data, say that Lode has no durable memory for the
current project yet, suggest using `/lode:capture` after this session, and
suggest `/lode:cold-start-interview` if no config exists. Do not fill the gap
with git history or assumptions.

## Evidence Rules

- Cite raw entry timestamps for decisions, risks, abandoned alternatives, and
  open questions.
- Cite artifact ids for docs worth reading.
- Cite decision context `source_entry_refs` when using `decision_context`;
  preserve `confidence` and `inference_notes` instead of presenting inferred
  nodes as fact.
- Include `decision_context_source` when present, especially if `rebuilt=true`,
  so the user can see whether the section came from a saved index or an
  in-memory freshness rebuild.
- Treat `intent_artifact_flags` as read-only staleness hints. Phrase them as
  "may need review" rather than facts. Do not write or propose diffs from this
  skill.
- Use "Inferred" wording when the helper returns weak or old-schema entries.
- Missing artifact index is acceptable and must not block output.

## Storage

This skill reads:

- `{vault}/raw/weeks/{YYYY-WNN}/{project-slug}.json`
- `{vault}/raw/artifacts/{project-slug}.json` when present
- `{vault}/raw/decisions/{project-slug}.json` when present
- `{vault}/raw/pending/*.json` for pending captures from compacted sessions

This skill writes `{vault}/raw/decisions/{project-slug}.json` only when the
derived decision index is missing, invalid, empty, or older than raw entries.
Raw entries remain the source of truth.

## Artifact Discovery

The artifact index at `{vault}/raw/artifacts/{slug}.json` is a structured
catalog of durable project documents. When present, use it to enrich the recall
output:

1. **Find related docs**: When raw entries mention `related_docs` or
   `artifact_context`, cross-reference the artifact index for topic tags and
   decision threads to find adjacent documents.
2. **Detect stale documents**: Artifacts with `status: superseded` or a
   `superseded_by` field indicate documents that have been replaced — flag these
   so the next session doesn't rely on outdated references.
3. **Navigate by topic**: Artifact `topics` and `decision_threads` fields provide
   stable retrieval terms for finding documents relevant to the current session.

In the "Docs worth reading" section, include for each artifact:
- Why the artifact matters (from its `scope` or `topics`)
- Whether it is still active (from `status`)

Missing artifact index is acceptable — the recall output must not depend on it.
When absent, derive doc references from raw entry fields alone.

## Absorbed Intent-Artifact Flagging

The old standalone intent-sync behavior is now a lightweight recall section.
When recent raw entries include `sync_suggestions`, or mention intent artifacts
and contract-like terms such as design, plan, architecture, prompt, schema,
contract, migration, or config, include a "Potentially stale intent artifacts"
section.

This section is read-only. Its job is to tell the next session what to inspect,
not to decide that a document is stale and not to modify the document.
