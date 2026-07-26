# Weekly Analysis Contract

Use after scope partition and evidence gathering for **brief** and **slides**.
Do not use for **quick**. Analysis runs in the main dialog.

- `brief`: complete the goal loop, then apply **Brief Projection**.
- `slides`: complete the same goal loop, then form Stories, apply **Cognitive
  Task Decomposition**, source grounding, and **Content Materialization**. Emit
  one PPT-ready Markdown Deck.

Return one analysis object per reporting group:

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
  "evidence_index": []
}
```

## Goal Resolution

Resolve goals before selecting changes:

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

An empty source is `unknown`, not permission to invent a Why. Goals inferred
after work remain `inferred`. An agent recommendation from the prior report
remains `proposed`. Keep unrelated goal lanes separate even when they share a
reporting group.

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

No prior item may disappear. For replanned work, retain the former direction,
evidence trigger, reason, and replacement direction.

## Work Streams and Material Changes

First merge entries that describe one state transition. Do not split by commit,
module, day, or archetype when the management meaning is shared.

```json
{
  "id": "temporary-analysis-id",
  "goal_ids": [],
  "project": "Project Name",
  "title": "",
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

Rank by observable end-state significance, audience relevance, evidence
strength, and effect on the next decision. Do not force a headline count.

Each selected material change keeps a stable id and includes:

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

An outcome requires a deliverable, observable state, recorded effect, or
demonstrably removed risk. Expected impact stays prospective. Every material
change has a goal or `variance.kind: unplanned`; otherwise keep it in portfolio.

## Brief Projection

**Brief only.** Do not create another analysis object. Keep in the body only
what is necessary to reconstruct:

```text
goal state
actual change
material variance
decision or support needed
next commitment
confidence boundary
```

For every candidate block, ask whether removing it changes judgment, action, or
confidence. Keep it only when yes.

Body admission:

- changes a goal status;
- explains a material block, replan, or displacement;
- changes a decision, support request, or resource implication;
- defines a next commitment and closure criterion;
- qualifies a claim as limited, conflicting, or expected-only.

Route complete prior-item accounting, remaining meaningful streams, compact
claim evidence, provenance, coverage, and scope boundaries to the appendix. Use
one fact in one expanded location. Do not use a fixed length or item count.

## Evidence Candidates

Use numeric evidence only when metric, unit, sample, method, and comparison
conditions are stable. Recompute ordering and deltas. If values conflict or
samples are incomparable, expose the conflict and do not recommend a chart.
Never infer a missing baseline or target.

A material state transition may use:

```json
{
  "before": "",
  "intervention": "",
  "after": "",
  "remaining_gate": "",
  "evidence_refs": []
}
```

When a mechanism visual is actually selected, `solution_logic` may preserve the
supported trigger, actors, main flow, material branches, fallbacks, output,
invariants, remaining boundary, diagram route, and evidence refs. It is an
optional visual payload, not a requirement for every result and never proof
that the solution worked.

## Story Formation

**Slides only.** Group selected results into the fewest Stories that give the
deck a coherent management argument. A Story is a shared objective across one
or more slides, not a slide type.

For every Story, publish once:

- `Why`: the problem, constraint, opportunity, or uncertainty that makes the
  Story necessary;
- `Goal`: the understanding or question this group of slides must resolve.

Do not repeat Why and Goal on every slide. Do not use a reporting group as proof
that unrelated results share one Story.

## Cognitive Task Decomposition

**Slides only.** This is a temporary reasoning step inside each Story. Do not
expose its role labels or create another public schema. A cognitive task is a
candidate, not a page.

First state the management conclusion each selected result must support. Then
identify only the necessary cognitive tasks:

- `problem_reframe`: replace the apparent problem with the real constraint;
- `design_rationale`: explain the trade-off and why the chosen direction wins;
- `mechanism`: explain how the chosen solution causally operates, including
  material branches, fallback, and unchanged boundary;
- `validation`: change confidence using comparable results, tests, or an
  explicit evidence gap;
- `decision`: make the required judgment, support, or next gate unavoidable.

For each temporary task, record an internal `intended_takeaway`, likely source
locators, the facts or relationship from which a reader should infer it, and
what prior understanding it needs. Discard tasks that do not advance the Story
Goal. Never copy `intended_takeaway` into public titles or prose.

## Source Grounding

Reopen the raw entries and direct artifacts behind every candidate task.
Existing Weekly prose may locate evidence but cannot substitute for it. Build
an internal Source Grounding Packet containing:

- source path or raw entry identifier;
- the exact claim it supports;
- extracted facts, values, labels, and relationships usable on the page;
- available text, relationship, screenshot, code structure, or table;
- the evidence boundary;
- unverified statements that must not be presented as fact.

Do not expose full packets per page. Preserve only compact claim-to-source
mapping in the final Evidence Appendix.

## Content Materialization

Convert the grounded packet into presentation content itself:

- facts and contradictions the audience must see;
- candidates, constraints, and rejection reasons;
- actual objects and relationships;
- observed numbers with sample and boundary;
- main path, material branch, fallback, input, output, and invariant;
- Before/After, Mermaid, Markdown tables, quote blocks, or concise prose;
- remaining risks, decisions, and pass/fail gates.

Do not specify layout, font, color, cards, regions, or drawing instructions.
Markdown is the presentation; PPT is its visual translation. If grounded
content cannot state the needed objects, relations, values, or risks directly,
supplement evidence, merge, or omit the candidate.

### Page independence and merge or split

A candidate becomes a page only when it is an independent cognitive step,
contains grounded presentation content, advances its Story Goal, and cannot be
deleted without breaking that Goal.

Prefer one page. Split `design_rationale` from `mechanism` only when both
pages serve the same Story Goal, use different source material and cognitive
tasks, and the mechanism depends on the facts, constraints, and trade-offs
presented first. The first page directly presents the design problem and
choice; the second directly presents operation, branch or fallback, and
unchanged boundary.

Otherwise merge them. One grounded Before/After, relationship, or flow view is
enough when it carries the root cause, choice, and operation. Add validation as
a third page only when it independently changes confidence or the decision and
has its own packet and visual.

Reject background pages, option inventories without a decision, module or step
lists, interchangeable pages, and detail pages whose deletion changes nothing.

## PPT-ready Markdown Deck

**Slides only.** Return one public Markdown document using `slide-template.md`.
It must remain complete and readable without a `.pptx`.

Use `department_ic` unless the user explicitly requests a technical or
architecture review. Keep only necessary main-deck slides, never more than
eight. A result may use zero, one, two, or—only when independent validation
changes the decision—three slides.

Public content consists of deck context, Story Why/Goal, slide content, optional
speaker notes, and a compact Evidence Appendix. Internal intended takeaways,
cognitive roles, source packets, visual feasibility, merge/split analysis,
unsupported-claim ledgers, and production guidance remain hidden.

Run three preflights:

1. standalone reading: a fresh reader can explain the Story order, Why, Goal,
   facts, relations, values, and risks without a PPT;
2. takeaway inference: the reader can infer the hidden intended takeaway in
   their own words, while no title or prose directly repeats it;
3. blind content handoff: a maker can visually translate the Markdown without
   vault research, semantic invention, or a new split decision.

## Portfolio, Judgment, and Commitments

Keep every meaningful non-headline stream visible:

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

Write the weekly judgment after selection. Synthesize the original goal or
missing-source boundary, actual change, material variance, current decision, and
largest remaining gate. Never combine work and personal judgments.

Return only justified next commitments; do not force a count. Each names an
uncertainty, acceptance gate, decision, or risk, with a pass/fail closure
criterion and `confirmed` or `proposed` commitment state.

## Evidence

- Raw entries establish recorded intent and status.
- Source refs establish provenance.
- Commits, tests, evals, issue states, and explicit source-of-truth files may
  verify bounded claims.
- General artifact dossiers are navigation or recorded context unless direct.
- Conflicts remain visible and lower confidence.
