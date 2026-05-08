---
name: lode-intent-sync
description: >
  Keep project intent artifacts synchronized with implementation learning. Use
  when the user says "同步意图", "sync intent", "spec sync", "update design with
  what we learned", "让文档跟实现对齐", or asks whether DESIGN/PLAN/AGENTS/README
  are stale after a coding session.
---

# Intent Sync

Intent sync keeps agentic coding specs alive. It compares what was learned in a
session against repo-local intent artifacts, then proposes the smallest safe
updates before writing anything.

## Scope

- Repo-local intent artifacts only.
- User approval is required before file writes unless the user explicitly asks
  for automatic updates.
- Facts, inferences, and recommendations must be labeled separately.
- Lifecycle updates are recorded as new raw entries; old entries are not mutated.

## Inputs

- Current conversation or session summary.
- Relevant raw entries and recall context when a vault exists.
- Candidate intent artifacts from:

```bash
python <this-skill>/scripts/intent_targets.py --cwd "$PWD"
```

## Output Before Writes

Return a concise proposal:

```markdown
## Intent Sync Proposal

### Mismatches
- **Fact**: ...
- **Inference**: ...
- **Recommendation**: ...

### Proposed File Updates
- `DESIGN.md`: ...
- `AGENTS.md`: ...

### Minimal Diff Draft
```diff
...
```

### Lifecycle Signals
- Open question -> answered/promoted_to_decision
- Risk -> mitigated/accepted
- Decision -> revised/superseded
```

Do not rewrite files outside the requested scope. If there is not enough
evidence to update a doc, say so and leave the doc unchanged.

## Approved Write Mode

When the user approves a specific update:

1. Edit only the approved target files.
2. Append a raw `decision` or `risk` entry when vault is available and the
   change carries future roadmap value.
3. If a durable artifact was updated and artifact index exists, update or add an
   artifact index entry.

## Evidence Rules

- Facts must cite raw entries, current files, or user-provided session context.
- Inferences must use hedging language.
- Recommendations must be framed as proposed changes, not established facts.
- Missing vault data is acceptable; use only the conversation and repo files in
  that case.
