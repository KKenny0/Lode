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
  "slide_projection": null,
  "evidence_index": []
}
```

`slide_projection` is `null` in brief-only analysis. Populate it only for an
explicit PPT, slide, or presentation request after the weekly streams and
headline arcs are stable.

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
  "closure_criterion": "",
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
  "id": "stable-result-id",
  "headline": "observable state-change claim",
  "supporting_stream_ids": [],
  "closure_type": "delivery | decision | risk | learning",
  "starting_constraint": "",
  "decisive_move": "",
  "end_state": "",
  "management_meaning": "",
  "remaining_gate": "",
  "closure_criterion": "",
  "evidence_grade": "verified | recorded | limited",
  "evidence_refs": [],
  "metric_evidence": [],
  "state_transition": null,
  "solution_logic": null,
  "result_maturity": {
    "mechanism_complete": "yes | partial | no | not_applicable",
    "effect_validated": "yes | partial | no | not_applicable",
    "production_accepted": "yes | partial | no | not_applicable"
  },
  "department_value": "delivery_speed | quality | production_risk | cost | collaboration | iteration_capacity | null"
}
```

An outcome must pass the Fruit Check: a deliverable, observable state, recorded
effect, or demonstrably removed risk exists. Expected impact stays prospective.

## Metric Evidence

Use metric evidence only when the sources provide a stable measurement:

```json
{
  "metric_name": "",
  "baseline": null,
  "current": null,
  "delta": null,
  "unit": "",
  "sample_scope": "",
  "evaluation_method": "",
  "data_points": [{"label": "", "value": 0}],
  "impact_boundary": "observed | recorded | expected",
  "evidence_grade": "verified | recorded | limited",
  "source_refs": []
}
```

Before recommending a comparison chart, confirm that baseline and current use
the same metric, unit, sample scope, and compatible evaluation conditions.
Recompute stated ordering and deltas. If values conflict, units differ, or the
sample is not comparable, preserve the conflict, lower confidence, and do not
recommend a result chart. One reliable value may support a number card, not a
trend. Never infer a missing baseline or numeric target.

## State Transition

Use for a material change in architecture, process, responsibility, state, or
failure handling:

```json
{
  "before": "",
  "intervention": "",
  "after": "",
  "remaining_gate": "",
  "evidence_refs": []
}
```

This supports Before/After. It does not explain the new solution's internal
operation and does not prove its effect.

## Solution Logic

For slide mode, classify every headline result. Populate the full object when a
solution changes a runtime mechanism; otherwise use `significance: none` and
leave the remaining fields empty.

```json
{
  "significance": "none | supporting | core",
  "trigger": "",
  "actors": [],
  "main_flow": [],
  "branches": [],
  "fallbacks": [],
  "output": "",
  "invariants": [],
  "remaining_boundary": "",
  "recommended_diagram": "sequence | swimlane | data_flow | decision_tree | failure_path | state_machine | architecture",
  "evidence_refs": []
}
```

Use `core` only when the mechanism is essential to understanding a main result
and changes at least one of: data flow, control flow, concurrency or execution
timing, state generation, component responsibility, provider or policy
dispatch, or failure handling and fallback. Use `supporting` for a material
mechanism that can remain in the technical appendix. Parameter changes, small
refactors, cleanup, and configuration edits with no runtime-mechanism change use
`none`.

Diagram routing:

- concurrency, asynchronous stages, stage collaboration -> `sequence` or `swimlane`;
- data processing, aggregation, materialized rebuild -> `data_flow`;
- provider, model, policy, or strategy dispatch -> `decision_tree`;
- failure handling and fallback -> `failure_path`;
- lifecycle or state transition -> `state_machine`;
- component responsibility -> `architecture`.

A logic diagram is incomplete when it lists only actors and arrows. Preserve
the material trigger, branches, fallbacks, output, invariants, remaining
boundary, and evidence references. It explains why the design can address the
original problem; it is not effectiveness evidence.

## Slide Projection

For slide mode, return this after headline selection. `results` contains the
selected headline result objects, preserves their stable `id`, evidence,
transition, logic, maturity, and closure fields, and adds the presentation
fields shown below. Do not create a second result identity namespace.

```json
{
  "audience": "department_ic | technical_review",
  "main_deck_slide_count": 0,
  "main_deck_slide_titles": [],
  "stage_judgment": "",
  "key_result_cards": [],
  "core_result_ids": [],
  "main_deck_logic_diagram_ids": [],
  "results": [
    {
      "id": "stable-result-id",
      "title": "conclusion-led slide title",
      "title_style": "conclusion",
      "visual_kind": "number_card | comparison_chart | distribution_chart | trend_chart | timeline_chart | waterfall_chart | validation_summary | before_after | sequence | swimlane | data_flow | decision_tree | failure_path | state_machine | architecture | status_cards",
      "effect_data_available": true,
      "effect_evidence_kind": "test | smoke_test | benchmark | observed | recorded",
      "validation_result": "",
      "measurement_plan": "",
      "closure_criterion": ""
    }
  ],
  "portfolio": [],
  "risks_and_closure": [],
  "next_acceptance_targets": [],
  "support_needed": []
}
```

Use `department_ic` unless the user explicitly requests a technical or
architecture review. `results` must match the selected headline ids exactly;
`core_result_ids` and `main_deck_logic_diagram_ids` must reference those same
ids. Select at most two to three `solution_logic` objects for
the main deck. A normal result covers at least two of: State Transition,
Solution Logic, and Metric Evidence or other direct validation. A result with
`solution_logic.significance=core` must cover all three; when effect metrics are
not yet available, the third part is an explicit validation result plus the
measurement gap and closure criterion, never invented data.

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

Every target includes a pass/fail closure criterion. Include an owner or target
date only when the evidence explicitly identifies it.

## Evidence

- Raw entries establish recorded intent and status.
- `source_entry_refs` establish provenance.
- Commits, tests, evals, issue states, and explicit source-of-truth files may
  independently verify a bounded claim.
- General artifact dossiers are navigation or recorded context unless the
  evidence boundary is direct.
- Conflicts must remain visible and lower confidence.
