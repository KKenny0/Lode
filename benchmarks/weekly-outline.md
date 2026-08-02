# Weekly Brief Benchmark

## Goal

Verify that Weekly produces a scoped, objective-anchored management judgment
from raw evidence: intended direction, actual change, material variance,
current decision, and next commitment. It must keep every meaningful stream
visible without inventing a retrospective Why. When slides are explicit, it
must resolve the communication job, reopen supporting sources, and turn the
analysis into an audience-facing PPT-ready Markdown Deck rather than paginate
the Brief. When an editable PPTX and template are explicit, it must preserve the
template and support a real revision round trip.

## Goal-Loop Scenarios

1. **Same actions, different goals**: competitor analysis, three content items,
   and two customer follow-ups must produce different ranking and management
   meaning for “win next week's proposal” versus “reduce delivery risk.”
2. **No reliable goal source**: label the goal unknown, ask at most one question
   in brief/slides mode, continue when skipped, and never invent a confirmed Why.
3. **Prior commitments**: account for every prior confirmed commitment and
   proposal as `met`, `advanced`, `blocked`, `replanned`, or `not_started`.
4. **Evidence-led replan**: preserve the old direction, evidence trigger,
   reason, and new direction; do not report a justified replan as simple failure.
5. **Unplanned critical repair**: expose both the repair's material value and
   the original goal it displaced.
6. **Exploration**: allow closing uncertainty or ruling out a path to be the
   objective; do not manufacture a delivery.
7. **Multiple work projects**: keep separate goal lanes when projects share a
   reporting group but no objective.
8. **Work scope with mixed vault**: personal projects must not appear anywhere
   in output, including paths and evidence refs.
9. **All scope**: work and personal receive separate judgments, goal lanes,
   portfolios, next commitments, and evidence sections.
10. **Raw entries sufficient**: raw fields drive state, meaning, and risk; matching
   git commits remain coverage/evidence.
11. **Git-only fallback**: meaningful activity remains `limited`; chore noise is
   filtered and no motivation or verified impact is invented.
12. **Artifact context**: source-of-truth references can support a bounded claim;
   general dossier context remains navigation.
13. **Dense week**: select every change needed to explain goal progress,
   variance, or a management decision; every other meaningful stream remains in
   portfolio coverage. Do not force a headline count.
14. **Conflict**: later or conflicting raw states remain visible and lower
   confidence.
15. **Explicit PPT request**: produce one PPT-ready Markdown Deck with 1-8
    necessary main slides per group and no preset target count. Zero admitted
    pages return an empty state. Default Weekly remains a Brief.
16. **Quantified algorithm result**: recommend a result chart only when metric,
   unit, baseline, current value, delta, sample scope, method, and comparability
   support it.
17. **Missing effect data**: show mechanism or Before/After plus a measurement
    plan and closure criterion; never invent a result chart.
18. **Conflicting metrics**: expose invalid ordering, incompatible samples, or
    unit conflicts, lower confidence, and withhold the chart.
19. **Core runtime mechanism**: use mechanism evidence only when it materially
    advances the audience's understanding; a diagram explains causality rather
    than enumerate actors or steps.
20. **Cognitive decomposition**: identify necessary problem reframe, design
    rationale, mechanism, validation, and decision tasks internally; tasks are
    candidates, not pages.
21. **Maintenance-only work**: retain parameter tuning, cleanup, and
    non-mechanism configuration work in the portfolio without decorative
    architecture diagrams or implementation narratives.
22. **Audience and occasion**: resolve one primary audience, prior knowledge,
    occasion or duration, deck job, and required audience outcome before page
    selection. A reporting group alone is not an audience definition.
23. **Story formation**: keep Story Why/Goal and cognitive roles internal; the
    public deck begins with audience-facing claims rather than authoring fields.
24. **Content materialization**: reopen raw sources, keep source packets
    internal, and turn facts, relations, comparisons, mechanisms, numbers,
    boundaries, and gates into presentation content itself.
25. **Contract rejection probes**: reject missing audience outcome, topic-only
    titles, unsupported title claims, production guidelines in public content,
    unsafe main-deck references, false complex-result merges, mechanical
    simple-result splits, and appendix-only meaning.
26. **Qualified commit source**: when a technical claim points to a commit,
    resolve its repository, inspect the delta, and use only an immutable captured
    snapshot within the report cutoff for the resulting committed tree. An
    unresolvable commit or snapshot cannot support a current-topology visual.
27. **Truth-state separation**: distinguish recorded intent, implemented
    structure, tested behavior, observed effect, and target design. Never use a
    code or design diagram as effect evidence.
28. **Representation utility**: state the concept in plain language first, then
    add only the lightest diagram, table, trace, curve, formula, or text view
    that materially reduces the declared audience's understanding cost.

## PPT-ready Markdown Deck Scenarios

1. **P1 — One goal, several actions**: merge activities that prove one audience
   conclusion instead of allocating one page per activity.
2. **P2 — Complex mechanism**: allow more than one page only when the pages
   perform independent cognitive work.
3. **P3 — Quiet maintenance week**: produce a short deck without filler cover,
   agenda, status, or summary pages.
4. **P4 — No comparable metric**: use a relationship, process, state, or
   evidence-boundary visual instead of a chart.
5. **P5 — Comparable metric**: let the chart prove the conclusion without
   repeating the same values in adjacent text or a table.
6. **P6 — Management decision**: combine risk, variance, and support into one
   decision page when they serve one judgment.
7. **P7 — Non-code work**: support proposal, content, and customer progress
   without requiring technical diagrams.
8. **P8 — All scope**: create separate work and personal mini-decks with their
   own thesis and audience decision.
9. **P9 — Evidence conflict**: lower claim strength and keep the conflict
   visible.
10. **P10 — Deletion**: reject any page whose removal changes neither deck
    thesis nor audience decision.

### P2-A — Complex Story forms a natural progression

Input contains an old approach's failure, candidate trade-offs, a governing
design constraint, the new operating path, and an unchanged boundary.

Pass only when:

- one communication job and one primary audience govern both pages;
- page-one title states the supported design judgment and its body proves the
  constraints and trade-offs;
- page-two title states the operating claim and depends on page one's premise;
- pages use different grounded source material and cognitive tasks;
- no authoring field or production guideline appears in public content;
- a fresh target reader can state both conclusions and their dependency;
- deleting either page changes the audience's understanding or decision.

### P2-B — Simple result must merge

When one Before/After, relationship, or flow can fully express root cause,
choice, and operation, emit one claim-led content page.

Fail when:

- design and mechanism are split by convention;
- page two only expands page-one detail;
- deleting either page leaves the audience outcome intact.

### P2-C — Blind Content Handoff

Give only the final Markdown Deck to an independent maker who did not perform
Weekly Analysis.

The maker may choose layout, type, color, and visual translation. They may not
browse the vault, research trade-offs, invent nodes, relations, numbers, or
risks, or re-decide the split. Pass only when PPT and Markdown carry the same
argument and the maker performs visual translation only.

### P3-A — Audience Outcome Read

Give only the public deck to a fresh member of the declared primary audience.

Pass only when the reader can state, after a short read:

- the deck thesis;
- the confidence boundary;
- the decision, action, or understanding expected of them.

Fail when they mainly recall modules, commits, process steps, or raw facts while
missing the management conclusion.

### P3-B — Standalone Claim-led Markdown

Read the Markdown without making a PPT. Pass only when a reader can reconstruct
the cumulative claim sequence, material facts, relationships, numbers, risks,
and decision without production guidance or the Evidence Appendix as a
prerequisite.

### P3-C — Template-native Editable Delivery

When the user supplies a template and requests an actual PPTX, inspect every
source slide and map each output page to one source page. Pass only when:

- copied slides preserve source masters, layouts, typography, and spacing;
- narrative content edits inherited elements instead of overlaying a rebuild;
- all titles, numbers, charts, and key objects remain natively editable;
- copy fits at source type sizes without clipping or silent shrinkage;
- every rendered page passes overflow and template-fidelity review;
- no fixed Tracework style gallery or flattened slide image substitutes for the
  supplied template.

### P3-D — Revision Round Trip

Preserve the accepted PPTX, add later evidence or a precise user comment, and
write a new version. Pass only when affected claims, proof, and dependent
decision pages update together; unrelated page logic and template mapping do
not get re-decided; the previous version remains recoverable; and the revised
deck still passes audience, source, editability, and render checks. Preserve
stable page ids where the cognitive job survives, but allow a grounded revision
to add, remove, or reorder pages when the evidence changes the necessary claim
sequence. Whitespace-only or formatting-only differences do not count as a
revision.

### P3-E — Code-grounded Current Architecture

Input contains a raw entry whose typed commit source includes a repository
path, plus a later target-design document.

Pass only when:

- the commit diff supplies the weekly delta and an immutable captured repository
  snapshot at or before `as_of` supplies the resulting committed modules and
  relationships;
- the slide explains the concept in plain language before the diagram;
- every diagram node and edge is traceable to the source chain;
- tests are described only as exercised behavior, not quality or production
  proof;
- current implementation and target design are visibly different claims with
  different sources;
- the Evidence Appendix preserves the qualified commit, captured snapshot, and
  design source without leaking paths or hashes into the spoken slide.

If the repo path, commit, or captured snapshot cannot be resolved, pass only by
falling back to a raw-supported conceptual view and stating that the current
code topology is unavailable. Inventing a plausible architecture fails.

### P3-F — Visual Utility and Text-only Restraint

For a complex mechanism, a fresh peer viewing only the visual must be able to
explain the supported objects, relationships, and evidence boundary without
claiming an unobserved effect. The concept must already be understandable in
plain language before the visual appears.

For a simple repair that two or three sentences explain completely, pass only
with text. A diagram fails when it merely turns those sentences into boxes and
arrows, adds no relationship the audience needs, or survives deletion without
changing understanding.

## Brief Compression Scenarios

Compression is semantic, not a character or item budget. The body is the
minimum information needed to reconstruct goal state, actual change, material
variance, decision or support, next commitment, and confidence boundary.

1. **C1 — Body sufficiency**: a fresh reader can reconstruct all six management
   fields without opening the appendix.
2. **C2 — Counterfactual deletion**: every body block uniquely changes at least
   one management field, action, or confidence boundary.
3. **C3 — Appendix migration**: a material block, replan, decision request, or
   evidence conflict fails validation when it exists only in the appendix.
4. **C4 — Maintenance noise invariance**: adding routine maintenance changes
   the appendix but leaves the body unchanged.
5. **C5 — Material risk sensitivity**: adding a decision-blocking risk changes
   the body and names the risk there.
6. **C6 — Evidence expansion invariance**: adding refs for an unchanged claim
   grows evidence mapping without expanding the body; a confidence change is
   the exception.
7. **C7 — Complete accountability**: every prior item and meaningful stream is
   present in the appendix even when absent from the body.
8. **C8 — One expanded home**: appendix ledgers do not repeat a body narrative.
9. **C9 — Dense-week justification**: a dense body may contain more blocks only
   when each represents an independent management change, not more activity or
   evidence volume.

## Pass Criteria

- Scope partition occurs before ranking.
- Every reporting group has exactly one repeatable weekly judgment.
- Every goal states its source, confidence, closure criterion, status, and
  confirmed/proposed commitment state.
- Inferred and unknown goals never use confirmed-goal language.
- Every material change is goal-linked, explicitly unplanned, or in the
  portfolio.
- Every prior commitment is accounted for and no proposal is silently promoted.
- Replans preserve the prior direction, trigger, reason, and new direction.
- Headline and next-commitment counts are not fixed.
- Every next commitment has a pass/fail closure criterion.
- Raw entries are semantic truth; git-only work stays limited.
- Activity volume never becomes an outcome by itself.
- Main prose is readable without report-local ids.
- Claim-level evidence remains available in the appendix.
- The brief body contains no tables, source paths, commit lists, or evidence
  index.
- Every body block survives the counterfactual deletion test.
- Full prior-item accounting and meaningful-stream coverage remain in compact
  appendix ledgers.
- Adding maintenance or extra evidence without changing management meaning does
  not expand the body.
- Adding a material decision-blocking risk does change the body.
- The appendix maps body claims to evidence without retelling body prose.
- Slides resolve one primary audience, prior knowledge, occasion or duration,
  deck job, audience outcome, central claim, and confidence boundary before
  selection. If skipped, use the manager-decision default.
- The Markdown Deck states a compact presentation context and one required
  audience judgment or action.
- A produced main deck has 1-8 necessary slides with no preset target count;
  zero admitted candidates return an empty state instead of an empty deck.
- Story Why/Goal and cognitive roles remain internal rather than public
  authoring scaffolding.
- Each title states an evidence-bounded audience-facing claim, and the page body
  visibly proves it.
- Each page directly presents supported facts, relationships, comparison,
  mechanism, numbers, boundaries, or risks; it contains no production fields.
- Full Source Grounding Packets and unsupported-claim ledgers remain internal;
  the public appendix contains only compact claim-to-source boundaries.
- Complex results split only when pages use different grounded material and
  cognitive tasks, serve one Story Goal, and form a prerequisite sequence.
- Simple results remain merged when one content block explains root cause,
  choice, and operation.
- Validation receives a separate page only when it changes confidence, risk, or
  the audience decision.
- Removing any slide changes the audience's decision, understanding, or
  confidence.
- The deck passes audience outcome reading, claim-to-proof review, standalone
  reading, and blind content handoff.
- Mechanism completion, effect validation, and production acceptance are
  reported separately.
- Every open risk and next-week acceptance target has a pass/fail closure
  criterion.
- Expected effects never appear as observed outcomes, and missing numeric
  evidence never becomes a guessed baseline, target, or trend.
- Default department slides keep source paths, commit hashes, raw evidence ids,
  and internal links in the appendix; only explicit technical-review decks may
  show sanitized compact references.
- A requested template-native PPTX maps every output page to a real source page,
  remains natively editable, preserves the prior version, and passes rendered
  fit, fidelity, and one revision round trip.

## Fresh-Context Brief Check

A reader without project background must be able to answer:

1. What was the original goal, or why is it unknown?
2. What actually changed?
3. What variance or replan occurred, and why?
4. What decision or support is needed now?
5. What is the next commitment and its pass/fail criterion?

Missing any answer fails Phase 1 even when the executable contract is green.

## Slide Visual Routing

| Mechanism or evidence | Expected route |
|---|---|
| Concurrency, asynchronous stages, stage collaboration | sequence or swimlane |
| Data processing, aggregation, materialized rebuild | data flow |
| Provider, model, policy, or strategy dispatch | decision tree |
| Failure handling and fallback | failure path |
| Lifecycle or state transition | state machine |
| Component responsibility change | architecture relationship |
| Feedback, retry, or iterative update | loop diagram |
| One case changing step by step | aligned example trace |
| Repeated old/new comparison | small table or matrix |
| Formula is the irreducible relationship | one minimal formula plus plain-language translation |
| Comparable algorithm or outcome data | `comparison_chart`, `distribution_chart`, `trend_chart`, `timeline_chart`, or `waterfall_chart` |
| One reliable number | `number_card` |
| Missing or conflicting outcome data | mechanism/validation summary plus measurement plan |
| Two or three sentences already explain the result | text only |

## Real-Output Check

Use the real `2026-W31` vault entries with an explicit
`as_of: 2026-07-30T23:59:59+08:00`. Do not overwrite the source report or raw
entries. Save candidates under the ignored weekly eval directory.

The frozen W31 run uses this communication job unless the user overrides it:

> By the end, the responsible manager or project owner should decide whether
> source-faithful routing is ready to merge because the implementation is
> complete but the 10-episode evidence does not establish a quality gain.

The expected main argument is three necessary claims, not a reusable page
formula:

1. source-faithful routing is code-complete, but 10-episode evidence does not
   support merging it;
2. `117 -> 115` is not a demonstrated quality gain because five episodes
   improved and five regressed under a small, high-variance sample;
3. expand to at least 30 episodes or a second series, then apply a stated
   go/no-go gate.

Duration-route history, module topology, test and branch inventory, and the
agent-native v3.1 mechanism stay in appendix or a separate explicit technical
review unless the audience outcome requires them. Terms such as `B0/B1`,
`CP1-CP4`, `mode_id`, `TaskSkillSnapshot`, and commit or branch inventories must
not dominate the manager deck.

The frozen candidate fails when it expands the existing W31 Markdown instead of
reopening raw sources, mixes routing and agent-native architecture into one
thesis, exceeds eight pages, hides the conclusion in topic titles, or requires
technical prior knowledge not declared in the audience contract.

For the user-selected same-department weekly meeting, change the communication
job to progress synchronization. A real technical architecture page is
admissible when it helps peers continue development or review and survives the
deletion test. It must follow a qualified commit into a captured W31 snapshot,
present actual modules and relationships, and remain separate from the
Agent-native target design. The current W31 raw commit refs omit repository
paths, contain no repository snapshot, and the project registry does not resolve
the storyboard repository, so
the local candidate must visibly degrade to a raw-supported conceptual relation
rather than fabricate the S1-S5 code topology. This degraded result verifies
failure safety but does not satisfy the code-grounded happy path in P3-E.

Then extend the same W31 run to
`as_of: 2026-07-31T23:59:59+08:00` as a revision test. The new evidence says the
cleanup v2 signal is about 13% lower errors but entirely from
`too_many_actions`; `wrong_shot_size` remains 35; attribution remains incomplete.
Write a new version, update every affected claim and decision, keep the prior
version recoverable, and preserve template mapping unless the revised claim no
longer fits honestly.

Finally use a real user-selected editable template, complete P3-C and P3-D, and
give the Markdown, versioned PPTX, and renders to the user. If the user judges
the audience, argument, clarity, template use, or editability inadequate, the
Weekly PPT Mode correction does not pass. Automated checks and independent
reader/maker validation do not replace explicit user acceptance.
