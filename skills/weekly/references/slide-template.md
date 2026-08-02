# Weekly Audience-facing PPT Mode Markdown Template

Use only for explicit **slides** mode. Complete Weekly Analysis, Audience and
Occasion Framing, Main-deck Admission, internal Story Formation, Cognitive Task
Decomposition, source grounding, and Content Materialization first.

The Markdown is the audience-facing semantic presentation. It must read like
candidate slide content, not an analysis form, Storyboard, or Production Brief.
A PPT maker may choose visual translation but may not research the vault,
invent semantics, or re-decide the argument.

Keep the internal communication job, Story Why/Goal, cognitive roles, source
packets, and template mapping out of the public document.

## Deck

```markdown
# {YYYY-WNN} Weekly Review

**汇报场景：** {primary audience · occasion or duration}
**需要形成的判断：** {one audience decision, action, or understanding}

---

## Slide 1｜{evidence-bounded conclusion the audience should retain}

{The minimum grounded facts, comparison, relationship, number, risk, or gate
that visibly proves the title. Use plain audience-facing wording.}

---

## Slide 2｜{next supported claim in the cumulative argument}

{Presentation content that answers the question raised by the prior page or
creates the need for the next decision.}

---

## Slide 3｜{decision, action, or closure claim}

{The bounded implication and a pass/fail next gate.}

---

## Evidence Appendix

| Claim | Source | Boundary |
|---|---|---|
| {compact claim} | {raw entry or direct artifact locator} | {what it does not prove} |
```

The example has three slides because many decision briefs need thesis,
evidence, and action. It is not a required page count. A produced deck contains
1-8 pages that survive Main-deck Admission, with no preset target count. When no
candidate survives, return an evidence-insufficient empty state instead of an
empty deck.

## Content Rules

- Use one primary audience and one communication job.
- Write each slide title as a supported claim a presenter could naturally say
  aloud. Do not use a topic, question, process, object, or cognitive-role label
  when the evidence supports a conclusion.
- Make the body visibly prove the title. Keep limited, conflicting, or
  expected-only boundaries beside the claim they qualify.
- Keep each slide to one narrative job and one primary claim. Prefer less copy
  and higher-value evidence over comprehensive implementation detail.
- Put the actual facts, conflicts, alternatives, relationships, numbers,
  branches, fallbacks, invariants, risks, and gates in the slide body.
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
- Keep a complex design-to-mechanism result in one internal Story and use two
  pages only when both claims have independent evidence and the mechanism
  depends on the design premise established first.
- Keep a simple result on one page when one Before/After, relation, or flow
  explains root cause, choice, and operation.
- Move implementation inventory, complete work-stream accounting, and
  provenance to notes or appendix unless they change the audience decision.
- Keep full source packets and unsupported-claim analysis internal. The
  Evidence Appendix is compact and does not repeat the deck.

## Forbidden Public Sections

Do not emit:

- public `Story`, `Why`, or `Goal` authoring scaffolding
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

1. Give only the Markdown to a fresh member of the target audience. Within a
   short read they must state the thesis, confidence boundary, and requested
   decision or action.
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
