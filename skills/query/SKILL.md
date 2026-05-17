---
name: query
description: Query Lode's decision replay index for why a project chose a path, what alternatives were rejected, what should be revisited, or what impact a decision had. Use this skill for "/lode:query", "why did we choose this?", "为什么当时这么选", "有没有被拒绝过的方案", "revisit this decision", or when a coding agent needs cited decision evidence before changing architecture, contracts, prompts, schemas, or product direction.
---

# Decision Replay Query

This skill answers targeted project-history questions from Lode's local decision
memory. It is a thin wrapper around the deterministic decision replay helper:
the script narrows evidence, and the host agent writes the final answer.

Use `query` when the current task touches an existing decision, architecture
boundary, rejected option, long-running risk, or product tradeoff. Use `recall`
for session-start orientation; use `query` for a specific follow-up question.

## Scope

- Intra-project by default.
- Raw entries remain the source of truth.
- `{vault}/raw/decisions/{project-slug}.json` is a derived retrieval index.
- The helper may rebuild an in-memory index from raw entries when no saved index
  exists, but this skill does not write new memory.
- Do not use git history, external docs, or model assumptions to fill missing
  decision evidence.

## Workflow

1. Identify the user's decision question.
2. Pick the mode:

| Mode | Use when the user asks |
|------|------------------------|
| `why` | why a path was chosen, why something works this way |
| `alternatives` | what was rejected, abandoned, deferred, or not chosen |
| `revisit` | what open questions or deferred choices should be reconsidered |
| `impact` | what downstream effects a decision had |

3. Run the helper:

```bash
python <this-skill>/scripts/decision_graph.py query "<question>" --cwd "$PWD" --mode why --limit 5
```

Use `--mode alternatives`, `--mode revisit`, or `--mode impact` when the
question is better served by another mode. If the user names a project slug,
pass `--slug <slug>`. If the user or config provides a vault path, pass
`--vault <path>`.

4. Read the JSON evidence pack.
5. Answer from the evidence pack only.

## Output Contract

Return a concise answer with:

- A direct answer when `answerable=true`.
- The matched decision node ids and source timestamps.
- `source_entry_refs` for every cited decision.
- Rejected alternatives when relevant.
- Open questions when relevant.
- `confidence` and `inference_notes` when a node is inferred.
- Suggested repo-local docs from `suggested_docs`, if any.

If `answerable=false`, say the current Lode records do not contain enough
evidence. Include `missing_evidence` and suggest capturing the decision with
`/lode:capture` after the user clarifies it. Do not invent an answer.

## Evidence Rules

- Treat `confidence=explicit` as directly recorded raw-entry evidence.
- Treat `confidence=inferred` as useful navigation, not a proven fact.
- Preserve uncertainty in the wording when `inference_notes` are present.
- Do not quote or cite a decision without its `source_entry_refs`.
- Edges and supporting nodes are context expansion, not standalone proof.

## Storage

This skill reads:

- `{vault}/raw/decisions/{project-slug}.json` when present
- `{vault}/raw/weeks/{YYYY-WNN}/{project-slug}.json` as rebuild fallback
- `{vault}/raw/artifacts/{project-slug}.json` as optional navigation metadata

This skill writes no files.
