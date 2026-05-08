---
name: lode-experience-distillation
description: >
  Distill repeated Lode memory into reusable rules, checklists, playbooks, or
  skill ideas. Use when the user says "沉淀经验", "distill experience", "turn this
  into AGENTS rules", "write a checklist from what we learned", or asks how to
  make repeated agentic coding lessons automatic.
---

# Experience Distillation

This skill turns repeated project judgment into reusable working rules. It is
proposal-first and must not write repo files without approval.

## Inputs

- Recent raw entries.
- Hard stuff radar findings.
- Lifecycle derivation.
- Artifact index entries.
- Existing `AGENTS.md`, skill files, or checklist files when present.

Use the deterministic candidate helper when a vault path and slug are available:

```bash
python <this-skill>/scripts/distill_candidates.py --vault <vault> --slug <project-slug>
```

## Output Contract

Separate:

- Facts supported by raw entries.
- Inferred patterns.
- Proposed reusable artifacts.

Possible proposed artifacts:

- AGENTS.md rule additions.
- Checklist items.
- Design review rubric updates.
- Debugging playbook entries.
- Prompt/schema contract reminders.
- Candidate new skill or existing skill update.

## Safeguards

- Do not propose a hard rule from a single weak entry.
- Do not propose updating global skills when the pattern is repo-specific.
- Do not propose a broad AGENTS rule when a checklist item is enough.
- Flag privacy-sensitive or project-specific details before copying them into
  reusable skills.
- Ask for approval before modifying any repo file.
