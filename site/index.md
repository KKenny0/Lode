---
layout: home

hero:
  name: Tracework
  text: Close agent work into evidence-backed reports.
  tagline: Daily, weekly, and monthly management narratives first; decision replay when the work is questioned later.
  actions:
    - theme: brand
      text: Install
      link: /quick-start
    - theme: alt
      text: See the Loop
      link: /workflow

features:
  - title: Close the day
    details: Explain what changed, why it matters, what remains gated, and what happens next.
  - title: Form the weekly judgment
    details: Select a few result arcs without dropping the rest of the work from portfolio coverage.
  - title: Review the phase
    details: Build raw-first monthly outcomes, recurring risks, and next-month closure targets.
  - title: Drill into the evidence
    details: Capture local facts and replay the why only when a report or future session needs it.
---

<section class="tw-command-panel">

```bash
codex plugin marketplace add KKenny0/Tracework
codex plugin add tracework@tracework
```

<p>Public namespace: <code>tracework</code>. Records stay in your own local vault.</p>

</section>

## Reporting-First Loop

```text
agent work -> capture durable facts -> Daily -> Weekly -> Monthly
                                   \-> Query / Recall when needed
```

Projects declare a reporting group such as `work` or `personal`. Reports filter
scope before selecting headlines, so personal projects never displace or leak
into workplace output. A private `all` view keeps each group in a separate lane.

Tracework is decision-replay-backed, but Query and Recall do not need to be
daily habits. They are the trust and recovery surfaces behind reports.

## Boundary

Tracework is not a meeting-notes tool, approval workflow, performance packaging
layer, generic office suite, or employee-monitoring surface. Activity volume is
coverage metadata, not proof of outcomes.
