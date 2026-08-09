# Weekly Audience-facing PPT Mode Markdown Template

Use only for explicit **slides** mode. Resolve shared weekly facts and goals,
then branch into Audience and Occasion Framing, Result Selection,
Selected-source Reopen, and Final Deck writing. Use Cognitive Task Decomposition
only when a complex result still needs merge/split diagnosis.

The Markdown is the audience-facing semantic presentation. It must read like
candidate slide content, not an analysis form, Storyboard, or Production Brief.
A PPT maker may choose visual translation but may not research the vault,
invent semantics, or re-decide the argument.

Keep internal semantic groups, cognitive roles, source packets, and template
mapping out of the public document.

## Deck

```markdown
# {YYYY-WNN} Weekly Review

**汇报场景：** {primary audience · occasion; duration only when supplied}
**需要形成的理解或行动：** {one audience understanding, action, or decision}

---

## Slide 1｜{evidence-bounded conclusion the audience should retain}

{The minimum grounded facts, comparison, relationship, number, risk, or gate
that visibly proves the title. Use plain audience-facing wording.}

---

## Slide 2｜{next supported claim in the cumulative argument}

{Presentation content that answers the question raised by the prior page or
creates the need for the next decision.}

---

## Slide N｜{decision, action, or closure claim}

{The bounded implication and a pass/fail next gate.}

---

## Slide N+1｜下周计划围绕{goal or remaining gate}收口

{Confirmed commitments and proposed items, each with owner or dependency when
known and a pass/fail closure criterion. Required for the default
same-department weekly-meeting deck; adapt only when explicit framing changes
the communication job.}

---

## Evidence Appendix

| Claim | Source | Boundary |
|---|---|---|
| {compact claim} | {raw entry or direct artifact locator} | {what it does not prove} |
```

For a single selected goal, use the sequence above directly and do not add an
overview. For multiple independent selected goals, replace Slide 1 with a
grounded weekly goal map:

```markdown
## Slide 1｜{evidence-bounded weekly judgment across independent lanes}

| 工作主线 | 为什么做 | 本周结果 | 当前状态与剩余边界 |
|---|---|---|---|
| {lane A} | {source-grounded Why} | {result or choice} | {state and gate} |
| {lane B} | {source-grounded Why} | {result or choice} | {state and gate} |
```

This is not an agenda. Keep each lane's following pages contiguous, and group
the final next-week plan by lane.

The example shows a claim sequence, not a required page count. A produced deck
contains only pages that survive Result Selection and deletion review. Unusual
length triggers compression review rather than a numeric failure. When no
candidate survives, return an evidence-insufficient empty state instead of an
empty deck.

## Content Rules

- Use one primary audience and one communication job.
- Do not confuse one communication job with one business goal. Preserve
  independent selected goal lanes when no source supports a common objective.
- When framing is absent, write for same-department colleagues who know the
  project background but not this week's implementation and validation. Do not
  silently substitute a manager decision brief or invent a duration.
- Make the work goal visible before asking the audience to interpret actions:
  why this work exists, what this week changed, and why the final choice serves
  that goal.
- For one selected goal, start directly with its result narrative. For multiple
  independent goals, use Slide 1 as a weekly goal map containing each lane's
  Why, result, status, and remaining boundary. Do not reduce it to names,
  activities, or an agenda.
- Write each slide title as a supported claim a presenter could naturally say
  aloud. Do not use a topic, question, process, object, or cognitive-role label
  when the evidence supports a conclusion.
- Make the body visibly prove the title. Keep limited, conflicting, or
  expected-only boundaries beside the claim they qualify.
- Keep each slide to one narrative job and one primary claim. Prefer less copy
  and higher-value evidence over comprehensive implementation detail.
- Put the actual facts, conflicts, relationships, numbers, branches, fallbacks,
  invariants, risks, and gates in the slide body. Show alternatives only when
  the audience must compare or choose them now; otherwise give the final choice
  and its shortest necessary rationale.
- Allow complementary text, diagrams, numbers, tests, and traces on one page
  when they perform one cognitive job. State what each proves; proximity must
  not imply unsupported causality.
- For technical explanation, state the concept in plain audience language
  before any diagram; the diagram must not be the first body block. Use one
  minimal example when it reduces ambiguity.
  Make `current implementation`, `tested behavior`, `observed effect`, and
  `target design / not implemented` visibly distinct in ordinary slide copy.
- Use Mermaid, Markdown tables, quote blocks, number comparisons, concise prose,
  and short lists only when they are audience content—not production
  instructions.
- Choose a visual from the grounded relationship rather than a preset: structure
  or flow for architecture/data, timeline or state for change, loop for
  feedback, aligned trace for one evolving example, a small matrix for repeated
  old/new comparison, and a chart only for comparable quantitative evidence.
  Use text when it already carries the idea with lower reading cost.
- Keep a complex design-to-mechanism result in one semantic composition and use
  two pages only when both claims have independent evidence and the mechanism
  depends on the design premise established first.
- Keep a simple result on one page when one Before/After, relation, or flow
  explains root cause, choice, and operation.
- Move implementation inventory, complete work-stream accounting, and
  provenance to notes or appendix unless they change the audience decision.
- For the default same-department weekly meeting, end with a next-week plan page
  that separates confirmed commitments from proposals and gives each a closure
  criterion. Group a multi-goal plan by lane; no lane may first appear there.
- Keep full source packets and unsupported-claim analysis internal. The
  Evidence Appendix is compact and does not repeat the deck.

## Forbidden Public Sections

Do not emit:

- public `Story`, cognitive-role, or analysis-field scaffolding
- `Audience takeaway`
- `Recommended visual form`
- `Page composition`
- `On-slide copy`
- `Production constraints`
- page-level `Source Grounding Packet`
- cognitive role labels
- `intended_takeaway` or `supported_claim` field names
- layout, typography, color, card, template-map, or drawing instructions

## Template-native Production

When the user explicitly asks for an editable PPTX using a supplied template,
keep the public Markdown unchanged and perform template mapping internally.
Map every output page to a real source slide, duplicate it, edit inherited
elements, preserve native typography and structure, and write a versioned copy.
Shorten, remap, or split copy that does not fit; never shrink or flatten it.

## Preflight

1. Give only the Markdown to a fresh member of the target audience. They must
   state the work goal, thesis, confidence boundary, and requested understanding
   or action without additional project research.
2. Check every title against its body. Unsupported certainty, topic-only titles,
   or evidence that does not prove the title fail.
3. Remove each page in turn. If the audience decision, understanding, and
   confidence remain unchanged, merge, move, or delete the page.
4. Remove each diagram in turn. If it only reformats prose, contains an
   ungrounded node or edge, hides its evidence boundary, or does not reduce the
   target audience's understanding cost, delete it.
5. Give only the Markdown to a fresh maker. They may choose visual translation
   but may not research, invent semantics, or re-decide the split.
6. When an editable template-native PPTX is requested, render every page,
   inspect template fidelity and overflow, confirm native editability, preserve
   the prior version, and apply one scoped revision before acceptance.

After at most one bounded repair, do not emit a deck that still misses a
material goal lane, exposes implementation inventory or internal coverage
bookkeeping, or leaves the maker to invent core objects and relationships.
Return a non-slide `PPT Mode 未通过` result with the failure type, recoverable
facts and boundaries, and the options to provide grounding, confirm goal lanes,
choose a more capable model, or explicitly request Brief.
