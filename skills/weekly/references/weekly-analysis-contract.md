# Weekly Analysis Contract

Use this contract after scope partition and evidence gathering for **brief** and
**slides** modes only. Do not use this file for **quick** mode.

Analysis runs in the main dialog; it does not require a subagent.

**Mode split**

- `brief`: fill goal lanes, prior-commitment accounting, material changes,
  variance, portfolio, next commitments, decisions, and evidence index. Keep
  `slide_projection` null. Do not require
  solution-logic diagram briefs, implementation narratives, or chart routing.
- `slides`: complete the same goal-loop analysis first, then populate `slide_projection`
  and the slide-only fields below (solution logic, implementation narrative,
  visual candidates, metric chart routing).

Return one JSON object per reporting group:

```json
{
  "reporting_group": "work",
  "goal_lanes": [],
  "period_judgment": {
    "original_direction": "",
    "actual_change": "",
    "variance": "",
    "current_decision": "",
    "statement": ""
  },
  "prior_commitment_accounting": [],
  "material_changes": [],
  "unplanned_material": [],
  "portfolio": [],
  "next_commitments": [],
  "decisions_or_support_needed": [],
  "slide_projection": null,
  "evidence_index": []
}
```

`slide_projection` is `null` in brief-only analysis. Populate it only for an
explicit PPT, slide, or presentation request after the goal lanes and material
changes are stable.

## Goal Resolution

Resolve goals before selecting report-worthy changes. Use this source order:

1. explicit current-request goal;
2. confirmed prior-Weekly commitment;
3. explicit milestone, plan, or project-goal artifact;
4. inference from raw motivation, decision, or carry-forward;
5. unknown.

```json
{
  "id": "goal-1",
  "statement": "",
  "source": {
    "kind": "current_request | previous_weekly | goal_artifact | raw_inference | unknown",
    "reference": ""
  },
  "confidence": "confirmed | inferred | unknown",
  "closure_criterion": "",
  "status": "met | advanced | blocked | replanned | not_started",
  "commitment_state": "confirmed | proposed"
}
```

An empty source is `unknown`, not permission to invent a Why. A goal inferred
after the work happened must remain `inferred`. When a previous Weekly item was
an agent recommendation rather than user-confirmed direction, use
`commitment_state: proposed` and describe it as the prior report's proposal.

One reporting group may contain several unrelated goal lanes. Do not synthesize
a shared objective merely because projects share an audience.

## Prior Commitment Accounting

Account for every prior-period item:

```json
{
  "statement": "",
  "commitment_state": "confirmed | proposed",
  "status": "met | advanced | blocked | replanned | not_started",
  "goal_id": "goal-1",
  "reason": "",
  "evidence_refs": []
}
```

No prior commitment may disappear. For replanned work, retain the former
direction, evidence trigger, reason, and replacement direction.

## Work Stream Shape

First group related entries into independent work streams:

```json
{
  "id": "temporary-analysis-id",
  "goal_ids": [],
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

## Material Change Selection

Rank streams by:

1. significance of the observable end state;
2. relevance to the intended reporting group and reader;
3. evidence strength;
4. effect on next week's decisions or resource allocation.

Do not force a headline count. Select every change needed to explain goal
progress, material variance, a management decision, or an unplanned change that
displaced intended work. Multiple activities may support one change. Keep
lower-value but meaningful work in the portfolio. Do not let personal work
compete with work projects.

For each selected change, include:

```json
{
  "id": "stable-result-id",
  "goal_ids": [],
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
  "department_value": "delivery_speed | quality | production_risk | cost | collaboration | iteration_capacity | null",
  "variance": {
    "kind": "none | blocked | replanned | unplanned",
    "prior_direction": "",
    "trigger": "",
    "reason": "",
    "new_direction": ""
  }
}
```

An outcome must pass the Fruit Check: a deliverable, observable state, recorded
effect, or demonstrably removed risk exists. Expected impact stays prospective.
Every material change has at least one `goal_id` or
`variance.kind: unplanned`. Otherwise it belongs in the portfolio.

## Brief Projection

**Brief only.** Do not create another analysis object. Render a layered brief
from the complete analysis above.

The body must be the minimum information needed to reconstruct:

```text
goal state
actual change
material variance
decision or support needed
next commitment
confidence boundary
```

For every candidate body block, ask whether removing it would materially change
the reader's judgment, action, or confidence. Keep it only when the answer is
yes. Otherwise route it to the appendix when it is needed for accountability,
coverage, or verification; omit it when it serves none of those functions.

Body admission:

- changes a goal's status;
- explains a material block, replan, or unplanned displacement;
- changes a decision, support request, or resource implication;
- defines a next commitment and its closure criterion;
- qualifies a body claim as `limited`, conflicting, or expected-only.

Appendix routing:

- complete prior-item accounting;
- meaningful streams that do not change the management model;
- compact claim evidence and provenance;
- coverage and scope boundaries.

Use one fact in one expanded location. The body may state a supported conclusion
while the appendix maps that conclusion to compact evidence, but the appendix
must not retell the narrative. Do not use a fixed length or item count. A dense
week earns more body only through additional independent management changes,
not through more entries, commits, or evidence refs.

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

**Slides only.** Skip this section for brief mode, or leave
`solution_logic: null` / `significance: none` without diagram work.

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
original problem; it is not effectiveness evidence. Keep presentation lists
bounded: at most 12 actors or main-flow steps, 8 branches, fallbacks, or
invariants, and 24 evidence references. Summarize overflow in the technical
appendix instead of expanding the main-deck logic object.

## Implementation Narrative

**Slides only.** Skip entirely for brief mode.

`implementation_narrative` exists only inside a slide-projection result. It is
not a second technical-fact object. Rewrite the same result's `solution_logic`
into three short, reader-facing blocks:

```json
{
  "implementation_narrative": {
    "normal_path": "",
    "branch_and_fallback": "",
    "outcome_and_invariant": ""
  }
}
```

- `normal_path`: start from the trigger, describe at least two ordered actions,
  and state what waiting, coupling, or error-propagation problem they address.
- `branch_and_fallback`: state the condition that dispatches, degrades, or
  falls back, the resulting path, and the concrete risk that path avoids.
- `outcome_and_invariant`: state the produced result or state and at least one
  input, interface, call-count, compatibility, or safety constraint that stays
  unchanged.

When `solution_logic.significance=core`, all three blocks are required. Derive
them only from that result's solution logic and evidence; do not add mechanisms
or effects that those sources do not support. A `supporting` result may use the
narrative in the technical appendix. A `none` result does not generate it.
Keep each main-deck block to one or two sentences. Diagram node names, serialized
field lists, and repeated slide titles are not implementation narrative. For a
default `department_ic` deck, never copy source paths, URLs, commit hashes, raw
evidence ids, internal links, or active Markdown/HTML from the evidence into
these blocks. Each block must stay within 600 Unicode characters.

## Slide Projection

**Slides only.** Keep `slide_projection: null` for brief mode and do not fill
this object.

For slide mode, return this after material-change selection. `results` contains
the selected result objects, preserves their stable `id`, evidence,
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
      "closure_criterion": "",
      "implementation_narrative": null
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
measurement gap and closure criterion, never invented data. A core result also
requires all three `implementation_narrative` fields. This is result-level
coverage across associated slides, not a requirement to place Before/After,
logic, narrative, and validation on one page.

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
than list projects. State the original goal or its missing-source boundary, the
actual change, the material variance, the current decision, and the largest
remaining gate in one paragraph.

Never create a combined judgment across `work` and `personal`.

## Next Commitments

Return only the commitments justified by the analysis; do not force a count.
Each commitment names an uncertainty, acceptance gate, decision, or risk to
close—not a task list.

Every commitment includes a pass/fail closure criterion and a
`commitment_state` of `confirmed` or `proposed`. Include an owner or target date
only when the evidence explicitly identifies it.

## Evidence

- Raw entries establish recorded intent and status.
- `source_entry_refs` establish provenance.
- Commits, tests, evals, issue states, and explicit source-of-truth files may
  independently verify a bounded claim.
- General artifact dossiers are navigation or recorded context unless the
  evidence boundary is direct.
- Conflicts must remain visible and lower confidence.
