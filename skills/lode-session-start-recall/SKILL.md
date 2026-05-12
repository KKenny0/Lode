---
name: lode-session-start-recall
description: >
  Recall recent project memory at the start of an agentic coding session. Use
  when the user says "开工", "session start", "start session", "recall context",
  "继续上次", "接着做", or asks what to remember before implementing in the
  current repo. Intra-project only; does not do cross-project retrieval.
---

# Session Start Recall

This skill turns Lode from write-only memory into a read/write habit loop. It
prepares a bounded project context at the start of a session so the developer and
AI do not restart from zero.

## Scope

- Intra-project only.
- Raw entries are the semantic source of truth.
- Artifact index entries are optional source navigation.
- Do not use git commits as fallback in v1.
- Do not invent history when no vault data exists.

## Workflow

1. Resolve the current project context.
2. Run the helper:

```bash
python <this-skill>/scripts/recall_context.py --cwd "$PWD" --limit 12
```

If the user explicitly names a project slug, pass `--slug <slug>`. If the user
or config provides a vault path, pass `--vault <path>`.

3. Read `references/recall-output-template.md`.
4. Produce Markdown in the conversation.

## Output Contract

The response must include:

- Recent progress
- Relevant decisions
- Abandoned alternatives that may affect the current task
- Open questions
- Risks to check before implementation
- Repo-local docs worth reading
- Potentially stale intent artifacts
- Suggested entry point for the current session

If there is no vault or no raw data, say that Lode has no durable memory for the
current project yet and suggest using `收工` after this session. Do not fill the
gap with git history or assumptions.

## Evidence Rules

- Cite raw entry timestamps for decisions, risks, abandoned alternatives, and
  open questions.
- Cite artifact ids for docs worth reading.
- Treat `intent_artifact_flags` as read-only staleness hints. Phrase them as
  "may need review" rather than facts. Do not write or propose diffs from this
  skill.
- Use "Inferred" wording when the helper returns weak or old-schema entries.
- Missing artifact index is acceptable and must not block output.

## Storage

This skill reads:

- `{vault}/raw/weeks/{YYYY-WNN}/{project-slug}.json`
- `{vault}/raw/artifacts/{project-slug}.json` when present

This skill writes no files.

## Absorbed Intent-Artifact Flagging

The old standalone intent-sync behavior is now a lightweight recall section.
When recent raw entries include `sync_suggestions`, or mention intent artifacts
and contract-like terms such as design, plan, architecture, prompt, schema,
contract, migration, or config, include a "Potentially stale intent artifacts"
section.

This section is read-only. Its job is to tell the next session what to inspect,
not to decide that a document is stale and not to modify the document.
