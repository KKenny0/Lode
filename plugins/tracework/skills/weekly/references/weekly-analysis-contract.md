# Weekly Analysis Contract

Use after scope partition and evidence gathering for **brief** and **slides**.
Do not use for **quick**. Analysis runs in the main dialog.

- `brief`: complete the goal loop, then apply **Brief Projection**.
- `slides`: share scope, goal lanes, prior commitments, coverage, work-stream
  state transitions, and truth boundaries with Brief, then branch before
  audience-specific ranking. Use **Result Selection**, reopen only selected
  sources, and write one audience-facing PPT-ready Markdown Deck. Run
  **Cognitive Task Decomposition** only when a complex merge/split decision
  requires it. Emit an editable template-native PPTX only when explicitly
  requested and supported.

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
4. a raw entry's recorded local objective or constraint;
5. bounded inference from raw motivation;
6. unknown.

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
reporting group. Actions, commits, modules, and effort volume are evidence of
work, not goal sources. If an unknown goal would change selection, grouping,
the period judgment, or next priority, ask once; otherwise continue with the
unknown boundary and do not claim goal progress.

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

For Brief, rank by observable end-state significance, management relevance,
evidence strength, and effect on the next decision. For Slides, preserve the
same state transitions and truth boundaries but postpone audience-specific
ranking to Result Selection; do not first produce the Brief ranking. Do not
force a headline count.

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

## Audience and Occasion Framing

**Slides only.** Resolve the communication job before selecting presentation
content. Keep this as internal analysis rather than another public page schema:

```json
{
  "primary_audience": "one role, not managers plus peers plus reviewers",
  "prior_knowledge": "what this audience can safely be assumed to know",
  "occasion": "live_brief | async_read | technical_review",
  "duration": "optional user-supplied constraint",
  "deck_job": "inform | recommend | decide | request_support | technical_review",
  "audience_outcome": "the judgment, action, or understanding required",
  "central_claim": "one evidence-bounded conclusion",
  "confidence_boundary": "what the evidence does not establish"
}
```

Express the communication job in one sentence:

> By the end, **[primary audience]** should **[audience outcome]** because
> **[central claim within its confidence boundary]**.

When framing is absent, use this product default:

- primary audience: same-department colleagues;
- prior knowledge: they know the project's basic context but not this week's
  latest implementation and validation;
- occasion: department weekly meeting;
- duration: unspecified;
- deck job: inform;
- audience outcome: understand this week's progress and implementation state,
  know material boundaries or collaboration needs, and see the next-week plan.

Explicit manager, leadership, async-read, or technical-review wording overrides
the default. Ask at most one combined question only when unresolved ambiguity
would materially change result selection, grouping, or the requested action.
Never use `reporting_group` alone as the audience definition, and do not mix
distinct audience roles in one deck.

## Result Selection and Goal Narratives

**Slides only.** Select a result only when removing it would change the primary
audience's understanding, action, or confidence. Implementation inventory,
secondary work streams, provenance, and details useful only for technical
follow-up go to speaker notes or appendix.

Do not admit a result merely because it is effortful, complete, technically
interesting, or present in Weekly Analysis. The main deck answers the
communication job; the appendix preserves accountability.

For one selected goal lane, build one local thesis before page writing:

```text
work goal
→ weekly result or final choice
→ shortest necessary rationale
→ evidence and current boundary
→ next closure
```

The work goal answers why the work exists; it must not be reconstructed from
actions, commits, modules, or effort. Group claims into the fewest semantic
compositions that preserve this local thesis. Do not add an overview page.

When two or more independent goal lanes survive Result Selection, keep one
communication job but do not force one business thesis. Treat lanes as
independent when no source supports a common objective and they have different
problems, results or choices, evidence, and remaining gates. Sharing a project,
reporting group, audience, week, technology, or generic wording such as
“improve quality” is not common-goal evidence.

Start a multi-goal deck with one weekly goal map. For every selected lane, the
map states its Why, weekly result, current status, and most important remaining
boundary. It must contain judgment, not merely names or an agenda. Then keep
each lane's local narrative contiguous and use only that lane's goal source and
result evidence. A lane that does not change audience understanding, action, or
confidence stays in portfolio or appendix. These groups remain internal
authoring logic rather than public Story/Why/Goal fields.

## Cognitive Task Decomposition

**Slides only and on demand.** Use this temporary reasoning step only when a
complex selected result still has an uncertain merge/split decision. Do not run
it for every result, expose its role labels, or create another public schema. A
cognitive task is a diagnostic unit, not a page.

First state the audience-facing conclusion the selected result must support.
Then identify only the roles needed to test independence:

- `problem_reframe`: replace the apparent problem with the real constraint;
- `design_rationale`: explain the trade-off and why the chosen direction wins;
- `mechanism`: explain how the chosen solution causally operates, including
  material branches, fallback, and unchanged boundary;
- `validation`: change confidence using comparable results, tests, or an
  explicit evidence gap;
- `decision`: make the required judgment, support, or next gate unavoidable.

For each temporary task, record an internal `supported_claim`, its evidence
boundary, likely source locators, the facts or relationship that prove it, and
the prior understanding it needs. Discard tasks that do not advance the Deck
Thesis. A retained `supported_claim` should become the public slide title or be
combined into another title; do not make the audience infer the conclusion from
a topic label.

## Selected-source Reopen

Reopen the raw entries and direct artifacts behind every selected result and
retained claim. Do not construct full packets for unselected results.
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

### Recover material grounding once, not source by source

Admission cards and artifact dossiers locate evidence; they are not substitutes
for a commit, code snapshot, eval, or design document when a retained page needs
exact structure or relationships. After the first reopen pass, identify only
missing sources that satisfy all of these conditions:

- the result is selected for the main deck;
- the missing material affects the central claim, objects, relationship, visual
  expression, or confidence boundary;
- raw and dossier summaries cannot support the required precision;
- deleting or degrading the page would remove necessary understanding.

Ask the user once for all such gaps. For each one, name the affected claim, the
missing grounding, the consequence of skipping it, and acceptable forms such as
a repository path plus commit id, local document, durable document URL, export,
or screenshot. Do not interrupt for appendix completeness or optional detail.

Treat supplied material by its actual responsibility: repository plus commit
and a qualified snapshot can establish committed structure; an accessible
design document can establish target design; a screenshot establishes only
visible content; and a user explanation establishes recorded intent or context,
not code topology, tested behavior, or observed effect.

If the user skips or the source remains inaccessible, merge or omit a
nonessential page. A dossier may still support an explicitly recorded,
conceptual design boundary. If exact mechanics are necessary and no source can
establish them, fail PPT Mode rather than manufacture the page. Weekly uses
user-supplied material for the current run only; durable capture remains an
explicit later action.

### Follow the source chain only as far as the claim requires

Raw entries remain semantic truth for intent, status, and management meaning.
For a technical explanation, follow their direct locators rather than treating
the raw summary as code structure:

- a commit diff establishes the implementation delta;
- an immutable repository snapshot captured within the report cutoff establishes
  the resulting committed structure;
- tests or a harness establish only the behavior they exercise;
- eval or production data establishes observed effect within its sample;
- a plan or design document establishes target design, not current state.

Resolve a commit repository from `source_refs.path`, then the matching project
registry entry, then the current repository when it is the same project. A
commit diff establishes the delta. For the resulting structure, select the
latest relevant `repository_snapshot` from scoped raw entries whose entry
timestamp is not later than `as_of`, whose absolute `path` identifies the same
repository, and whose full object id exists locally. Never derive a historical
tree from a branch name or substitute today's `HEAD`; branches move and are not
reproducible evidence.

When combining a commit delta with a later snapshot, use Git's ancestry check to
confirm that the referenced commit is an ancestor of the snapshot. If that
relationship cannot be established, keep the sources separate. A snapshot
represents committed content only; it does not establish staged, unstaged, or
untracked work.

If no qualified snapshot exists, the referenced commit tree may still support
wording such as "the structure after this commit", but not "the final structure
at the weekly cutoff". If the repository, commit, or snapshot cannot be
resolved, retain the raw-supported claim, mark the code view unavailable, and
do not manufacture module names, edges, or a current-architecture diagram.

Keep these truth types distinct in wording even when they share a page:
recorded intent, implemented structure, tested behavior, observed effect, and
target design. A commit or code diagram never proves quality improvement, and a
target-design diagram must be visibly described as not yet implemented.

## Evidence Responsibility and Final Deck Writing

Convert selected grounded material directly into presentation content:

- the work goal and why it matters now;
- the final choice and its shortest goal-serving rationale;
- facts and contradictions the audience must see;
- actual objects and relationships;
- observed numbers with sample and boundary;
- main path, material branch, fallback, input, output, and invariant;
- Before/After, Mermaid, Markdown tables, quote blocks, or concise prose;
- remaining risks, decisions, and pass/fail gates.

Do not expose full candidate, constraint, or rejected-alternative inventories by
default. Keep that evidence local unless the current audience must compare or
choose among those paths.

Assign every retained evidence item one responsibility: for example,
architecture establishes structure, a test establishes exercised behavior, an
eval establishes observed effect within its sample, and a design artifact
establishes target intent. One page may combine several proof objects when they
jointly support one claim. Spatial adjacency must not imply that one evidence
type proves another.

Do not specify layout, font, color, cards, regions, or drawing instructions in
the public Markdown. Markdown is the audience-facing semantic presentation,
not a Production Brief. If grounded content cannot state the needed objects,
relations, values, or risks directly, supplement evidence, merge, or omit the
candidate.

### Choose a representation from the evidence shape

First state the concept in plain audience language and, when it materially
helps, ground it with one minimal example. Then choose the lightest
representation that makes a supported relationship easier to see:

| Grounded shape | Prefer |
|---|---|
| architecture, data flow, module relation | structure or flow diagram |
| causal chain, process, state change | causal diagram, timeline, or state view |
| feedback, retry, iterative update | loop diagram |
| distribution, scale, marginal change | compact ASCII curve only with comparable evidence |
| cost/quality or speed/accuracy tension | trade-off curve only with comparable axes; otherwise a table |
| repeated old/new comparison | small table or matrix |
| one case changing step by step | aligned example trace |
| formula as the irreducible relation | one minimal formula plus a plain-language translation |
| two or three sentences already suffice | text only |

In Markdown, use fenced `text` for ASCII and keep it within 80 characters.
Diagrams are optional and never appear as the first body block: state the
audience-facing concept before the fence. Every node, edge, value, and label
must be traceable to the grounded packet; put its evidence boundary immediately
after the visual.
A reader seeing only the visual should recover the relevant relationship and
boundary without inferring a stronger result. If the visual only reformats the
summary, remove it.

### Page independence and merge or split

A candidate becomes a page only when it carries an independent supported claim,
contains grounded presentation content, advances the communication job, and
cannot be deleted without changing the audience's decision, understanding, or
confidence.

Prefer one page. Split `design_rationale` from `mechanism` only when both
pages serve the same local goal narrative, use different source material and cognitive
tasks, and the mechanism depends on the facts, constraints, and trade-offs
presented first. The first page directly presents the design problem and
choice; the second directly presents operation, branch or fallback, and
unchanged boundary.

Otherwise merge them. One grounded Before/After, relationship, or flow view is
enough when it carries the root cause, choice, and operation. Add validation as
a third page only when it independently changes confidence or the decision and
has its own packet and visual.

When a user supplies a PPTX template, the page decision is not final until the
grounded claim is mapped to a real source slide. Preserve the claim and shorten
copy, choose another source layout, or split only when the native layout cannot
carry the proof at its original typography. Never shrink text to protect an
earlier page count, and never let a template create unsupported semantics.

Reject background pages, option inventories without a decision, module or step
lists, interchangeable pages, and detail pages whose deletion changes nothing.

## PPT-ready Markdown Deck

**Slides only.** Return one public Markdown document using `slide-template.md`.
It must remain complete and readable without a `.pptx`.

Use the resolved primary audience. When framing is skipped, use the
same-department weekly-meeting default above. Duration remains unspecified.
Keep only necessary main-deck slides; use no numeric page cap. An unusual length
triggers deletion and compression review. A result may use zero, one, two, or—
only when independent validation changes understanding or action—three slides.

Public content consists of a compact deck framing line, audience-facing slide
content, optional speaker notes, and a compact Evidence Appendix. Internal
semantic groups, cognitive roles, source packets, visual feasibility,
merge/split analysis, unsupported-claim ledgers, and production guidance remain
hidden.

For the default same-department weekly meeting, end with one next-week plan page
that distinguishes confirmed commitments from proposals and gives each item a
pass/fail closure criterion. Group items by selected goal lane when the deck is
multi-goal. Do not fabricate a plan; mark missing ownership or an unresolved
target explicitly. A goal lane must not appear for the first time on this page.

Run these preflights:

1. audience outcome: a fresh member of the primary audience can state every
   selected goal lane, its local conclusion and confidence boundary, and the
   required decision or action after a short read;
2. claim-to-proof: each title states a supported claim and its body visibly
   proves that wording without unsupported certainty;
3. standalone reading: a reader can explain the cumulative argument, facts,
   relations, values, risks, and next gate without a PPT;
4. blind content handoff: a maker can visually translate the Markdown without
   vault research, semantic invention, or a new split decision.

Run at most one bounded repair using the current admission view, reopened
sources, validator feedback, and draft. If material lanes remain missing or the
body still consists of implementation inventory instead of presentation
semantics, return a non-slide result headed `PPT Mode 未通过`. Name one of
`evidence insufficient`, `contract validation failed`, or `model capability
insufficient`, then preserve candidate lanes, usable facts, evidence boundaries,
and user options. Do not number failure content as slides or silently switch to
Brief or another model.

## Optional Template-native PPTX

**Slides only and only when explicitly requested.** Treat the user-supplied
PPTX as the visual source. Use an existing presentation capability when the
runtime provides one; otherwise stop at Markdown and state the capability
boundary.

- Inspect every source slide before mapping content.
- Map every output slide to a real source slide, duplicate it, and edit inherited
  elements rather than rebuilding its style.
- Preserve master, layout, typography, spacing, and native editability.
- If copy does not fit, shorten, remap, or split. Do not shrink or flatten it.
- Render and inspect every final page; verify template fidelity and overflow.
- Write a versioned copy and preserve its predecessor.
- Apply one evidence or user-comment revision to affected claims and dependent
  pages without re-deciding unrelated pages. Preserve stable page ids where the
  cognitive job survives; add, remove, or reorder pages only when changed
  evidence changes the necessary claim sequence. Formatting-only differences do
  not count as a revision.

Do not add a renderer, a closed style gallery, a persistent template registry,
or a custom history database to Tracework. A template path is an explicit run
input and versioned files provide rollback.

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
