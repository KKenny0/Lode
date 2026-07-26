# Weekly Brief Benchmark

## Goal

Verify that Weekly produces a scoped, objective-anchored management judgment
from raw evidence: intended direction, actual change, material variance,
current decision, and next commitment. It must keep every meaningful stream
visible without inventing a retrospective Why. When slides are explicit, it
must reopen the supporting sources and turn that analysis into a standalone,
PPT-ready Markdown Deck rather than paginate the Brief or emit production
instructions.

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
15. **Explicit PPT request**: produce one PPT-ready Markdown Deck with no
    minimum and at most eight necessary main slides per group. Default Weekly
    remains a Brief.
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
22. **Story formation**: publish one Why and Goal at the start of each Story;
    do not repeat them per slide.
23. **Content materialization**: reopen raw sources, keep source packets
    internal, and turn facts, relations, comparisons, mechanisms, numbers,
    boundaries, and gates into presentation content itself.
24. **Contract rejection probes**: reject missing Story Why/Goal, production
    guidelines in public content, intended-takeaway leakage, unsafe main-deck
    references, false complex-result merges, mechanical simple-result splits,
    and appendix-only meaning.

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

- the Story publishes Why and Goal first;
- page one directly presents the design problem, constraints, and trade-offs;
- page two directly presents the mechanism and depends on page one's premise;
- pages use different grounded source material and cognitive tasks;
- no production guideline or intended takeaway appears in public content;
- a fresh reader can infer the expected understanding;
- deleting either page prevents the Story Goal from being completed.

### P2-B — Simple result must merge

When one Before/After, relationship, or flow can fully express root cause,
choice, and operation, emit one content page under one Story Why/Goal.

Fail when:

- design and mechanism are split by convention;
- page two only expands page-one detail;
- deleting either page leaves the Story Goal intact.

### P2-C — Blind Content Handoff

Give only the final Markdown Deck to an independent maker who did not perform
Weekly Analysis.

The maker may choose layout, type, color, and visual translation. They may not
browse the vault, add Story Why/Goal, research trade-offs, invent nodes,
relations, numbers, or risks, or re-decide the split. Pass only when PPT and
Markdown carry the same argument and the maker performs visual translation
only.

### P2-D — Takeaway Inference

Keep hidden `intended_takeaway` values separate from the public Markdown. Give
only the public deck to a fresh reader.

Pass only when the public deck does not directly repeat the takeaway, the title
does not leak it, and the reader can express a materially similar understanding
in their own words.

### P2-E — Standalone Markdown Reading

Read the Markdown without making a PPT. Pass only when a reader can reconstruct
the Story order, every Why and Goal, the material facts, relationships, numbers,
risks, and decisions without production guidance or the Evidence Appendix as a
prerequisite.

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
- Plain slide wording defaults to an IC department update; a technical-review
  deck requires explicit wording.
- The Markdown Deck states its context and management question.
- The main deck has no minimum and no more than eight necessary slides.
- Every Story states Why and Goal once before its slides.
- Each title names a question, object, mechanism, comparison, or decision gate
  without directly leaking the hidden intended takeaway.
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
- Removing any slide breaks its Story Goal or the deck's management question.
- The deck passes standalone reading, takeaway inference, and blind content
  handoff.
- Mechanism completion, effect validation, and production acceptance are
  reported separately.
- Every open risk and next-week acceptance target has a pass/fail closure
  criterion.
- Expected effects never appear as observed outcomes, and missing numeric
  evidence never becomes a guessed baseline, target, or trend.
- Default department slides keep source paths, commit hashes, raw evidence ids,
  and internal links in the appendix; only explicit technical-review decks may
  show sanitized compact references.

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
| Comparable algorithm or outcome data | `comparison_chart`, `distribution_chart`, `trend_chart`, `timeline_chart`, or `waterfall_chart` |
| One reliable number | `number_card` |
| Missing or conflicting outcome data | mechanism/validation summary plus measurement plan |

## Real-Output Check

Use current real vault data to regenerate `2026-W28` in slides mode without
overwriting the source report or raw entries. Save the candidate under the
ignored weekly eval directory.

The W28 candidate must be regenerated from raw sources rather than expand the
existing Weekly summary, Storyboard, or Production Brief. It must contain a DAG
Story with public Why/Goal and a two-page `design judgment -> mechanism`
progression, plus a scene-reuse Story that stays on one content page. Source
Grounding stays internal and the public Evidence Appendix remains compact.

The candidate fails when the pair appears only after hand editing, when either
page is background or inventory, when the intended takeaway is exposed, or when
the Markdown requires production guidance to be understood. Complete P2-D and
P2-E before P2-C; then give only the Markdown to an independent maker, render
and review the PPT. Green checks and fresh-context validation do not replace
explicit user acceptance.
