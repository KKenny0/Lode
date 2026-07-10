# Weekly Analysis Contract

Use this contract after scope partition and evidence gathering. Analysis runs in
the main dialog; it does not require a subagent.

Return one JSON object per reporting group:

```json
{
  "reporting_group": "work",
  "period_judgment": {
    "starting_situation": "",
    "main_movement": "",
    "end_state": "",
    "remaining_gate": "",
    "statement": ""
  },
  "headline_arcs": [],
  "portfolio": [],
  "next_closure_targets": [],
  "decisions_or_support_needed": [],
  "evidence_index": []
}
```

## Work Stream Shape

First group related entries into independent work streams:

```json
{
  "id": "temporary-analysis-id",
  "project": "Project Name",
  "title": "short work-stream title",
  "status": "done | ongoing | risk | decision",
  "closure_type": "delivery | decision | risk | learning",
  "starting_constraint": "",
  "decisive_move": "",
  "end_state": "",
  "management_meaning": "",
  "remaining_gate": "",
  "management_relevance": "high | medium | low",
  "claim_kind": "outcome | progress | activity",
  "evidence_grade": "verified | recorded | limited",
  "decisions": [],
  "risks": [],
  "source_refs": []
}
```

Merge signals when they describe one state transition. A feature followed by a
repair and a release can be one arc. Do not split by commit, module, day, or
archetype when the management meaning is shared.

## Headline Selection

Rank streams by:

1. significance of the observable end state;
2. relevance to the intended reporting group and reader;
3. evidence strength;
4. effect on next week's decisions or resource allocation.

Select normally three headline arcs and no more than four. The budget is per
reporting group. Do not let personal work compete with work projects.

For each selected arc, include:

```json
{
  "headline": "observable state-change claim",
  "supporting_stream_ids": [],
  "closure_type": "delivery | decision | risk | learning",
  "starting_constraint": "",
  "decisive_move": "",
  "end_state": "",
  "management_meaning": "",
  "remaining_gate": "",
  "evidence_grade": "verified | recorded | limited",
  "evidence_refs": []
}
```

An outcome must pass the Fruit Check: a deliverable, observable state, recorded
effect, or demonstrably removed risk exists. Expected impact stays prospective.

## Portfolio

Every meaningful stream not selected as a headline remains visible:

```json
{
  "stream_id": "",
  "project": "",
  "status": "",
  "bounded_change": "",
  "relationship": "supporting | portfolio | exploration | maintenance",
  "attention": "remaining gate or none",
  "evidence_grade": ""
}
```

Filter chore-only and generated-bundle noise unless it represents a release
gate, risk, or otherwise material maintenance state.

## Weekly Judgment

Write the judgment only after selection. It must synthesize the group rather
than list projects. State the starting situation, the main shift, the current
state, and the largest remaining gate in one paragraph.

Never create a combined judgment across `work` and `personal`.

## Next Closure Targets

Return two to four targets, normally three. Each target names an uncertainty,
acceptance gate, decision, or risk to close—not a task list.

## Evidence

- Raw entries establish recorded intent and status.
- `source_entry_refs` establish provenance.
- Commits, tests, evals, issue states, and explicit source-of-truth files may
  independently verify a bounded claim.
- General artifact dossiers are navigation or recorded context unless the
  evidence boundary is direct.
- Conflicts must remain visible and lower confidence.
