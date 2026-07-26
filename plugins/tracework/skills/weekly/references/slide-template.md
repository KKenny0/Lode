# Weekly PPT-ready Markdown Deck Template

Use only for explicit **slides** mode. Complete Weekly Analysis, Story
Formation, Cognitive Task Decomposition, source grounding, and Content
Materialization first.

The Markdown is the presentation content itself. It must be independently
readable and complete enough that a PPT maker only chooses visual style and
layout. Do not emit a Storyboard or Production Brief beside it.

## Deck

```markdown
# {YYYY-WNN} Weekly Review

{Why this weekly review is worth presenting and the management question it
must support.}

---

# Story 1｜{story subject}

## Why

{The supported problem, constraint, opportunity, or uncertainty.}

## Goal

{What this group of slides must resolve or make understandable.}

---

## Slide 1｜{question, object, mechanism, comparison, or decision gate}

{Presentation content: grounded prose, Mermaid, table, quote block, numbers,
relationships, risks, or concise lists.}

---

## Slide 2｜{next cognitive step}

{Presentation content that depends on the prior page when split.}

---

# Story 2｜{story subject}

## Why
...

## Goal
...

---

## Evidence Appendix

| Claim | Source | Boundary |
|---|---|---|
| {compact claim} | {raw entry or direct artifact locator} | {what it does not prove} |
```

## Content Rules

- State Why and Goal once per Story, not once per slide.
- Let slide titles name the current question, object, mechanism, comparison, or
  decision gate. Do not copy the hidden intended takeaway into the title.
- Put the actual facts, conflicts, alternatives, relationships, numbers,
  branches, fallbacks, invariants, risks, and gates in the slide body.
- Use Mermaid, Markdown tables, quote blocks, number comparisons, concise prose,
  and short lists when they are the content—not as production instructions.
- Keep a complex design-to-mechanism result in one Story and use two pages only
  when the mechanism depends on the facts and trade-offs established first.
- Keep a simple result on one page when one Before/After, relation, or flow
  explains root cause, choice, and operation.
- Keep full source packets and unsupported-claim analysis internal. The
  Evidence Appendix is compact and does not repeat the deck.

## Forbidden Public Sections

Do not emit:

- `Audience takeaway`
- `Recommended visual form`
- `Page composition`
- `On-slide copy`
- `Production constraints`
- page-level `Source Grounding Packet`
- cognitive role labels
- `intended_takeaway`
- layout, typography, color, card, or drawing instructions

## Preflight

1. Read the Markdown without imagining a PPT; every Story must be understandable.
2. Hide internal intended takeaways and ask a fresh reader to infer them.
3. Remove each page in turn; if its Story Goal remains complete, merge or delete
   the page.
4. Give only the Markdown to a fresh maker; they may choose visual translation
   but may not research, invent semantics, or re-decide the split.
