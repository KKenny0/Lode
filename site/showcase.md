---
title: Showcase
description: Tracework output shapes and proof boundaries.
---

# Showcase

This page is intentionally conservative. Tracework should not present synthetic
examples as real proof.

## Output Shapes

| Surface | What it should show | Proof boundary |
| :--- | :--- | :--- |
| Capture | Routed depth, session goal, decision, rejected path, risk, evidence, next step | A record of what the agent captured, not independent proof by itself |
| Query | Answerability, top decision, why, alternatives, source refs | Must refuse when the local record does not support the question |
| Weekly | Outcomes or progress, work streams, and—when PPT is requested—state change, solution logic, implementation narrative, and validation | Logic explains how a solution works; data or independent checks establish whether it works. Git-only work stays limited |
| Monthly | Raw-first phase narrative, repeated risks, next closure targets | Counts stay in coverage appendix, not outcome claims |
| Roadmap | Decision thread, accumulating risks, recurring questions | Derived from raw entries and decision indexes |

## Example Claim Chain

```text
O1 outcome or progress
  W1 supporting work stream
    D1 decision or tradeoff
      E1 raw entry or evidence reference
```

The chain is report-local. It helps readers move from a brief back to evidence,
but it does not mutate raw data.

## Real-Output Gate

Before adding a public case here, confirm:

- the source is a real Tracework run or a clearly labeled fixture
- private paths and proprietary details are removed
- `source_entry_refs` are described as provenance, not automatic verification
- every outcome claim has either independent evidence or a visible limitation
- a core mechanism slide covers its main path, key branch or fallback, output,
  and invariant without treating diagram structure as effect evidence
- routine maintenance stays in portfolio coverage without receiving a
  decorative architecture diagram
- unsupported queries return an explicit evidence gap

## Commands

| Command | Use |
| :--- | :--- |
| `/tracework:capture` | Capture the session record |
| `/tracework:query` | Replay one decision with evidence |
| `/tracework:recall` | Start with recent work context |
| `/tracework:weekly` | Prepare a weekly brief or an explicit department-ready PPT outline |
| `/tracework:monthly` | Prepare a monthly review |
| `/tracework:roadmap` | Review decision evolution |
