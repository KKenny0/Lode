---
name: lode-hard-stuff-radar
description: >
  Identify high-leverage hard problems from accumulated Lode memory. Use when
  the user says "看看难点", "hard stuff radar", "what is actually hard here",
  "找真正的问题", "哪些风险在累积", or asks what needs design, testing, research,
  or human judgment instead of more code.
---

# Hard Stuff Radar

When code gets cheap, the valuable problems are design boundaries, risks,
maintenance debt, stale assumptions, and questions that cannot be solved by
generating more code. This skill surfaces those problems from Lode memory.

## Inputs

- Raw entries for the current project or selected project.
- Artifact index entries when present.
- Lifecycle derivation:

```bash
python <this-skill>/scripts/derive_lifecycle.py --vault <vault> --slug <project-slug>
```

## Output Contract

Group findings into:

- Recurring open questions
- Architecture or contract risks
- Abandoned alternatives worth revisiting
- Maintenance debt signals
- Problems needing tests, design, research, or human judgment

Every finding must cite raw entry timestamps or artifact ids. If evidence is
weak, label it as inferred.

## Rules

- Raw entries are the fact source.
- Artifact index entries are supporting source navigation.
- Do not invent hard problems from artifact titles alone.
- Missing artifact index must not block output.
- Prefer a short, actionable radar over a broad generic risk list.
