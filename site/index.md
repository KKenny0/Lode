---
layout: home

hero:
  name: Tracework
  text: Inspectable traces for agent work.
  tagline: Capture decisions, evidence, risks, artifacts, and next steps, then carry them into recall, query, briefs, reviews, and roadmaps.
  actions:
    - theme: brand
      text: Install
      link: /quick-start
    - theme: alt
      text: See the Loop
      link: /workflow

features:
  - title: Trace the work
    details: Preserve decisions, rejected paths, risks, artifacts, source refs, and next steps from agent sessions.
  - title: Question the record
    details: Ask why a path was chosen and get cited local evidence when the record supports it.
  - title: Carry it forward
    details: Turn raw records into recall context, briefs, reviews, and decision roadmaps without losing drill-down paths.
  - title: Keep it local
    details: Store Markdown and JSON in your own vault. No hosted service, account, or remote database.
---

<section class="tw-command-panel">

```bash
codex plugin marketplace add KKenny0/Lode
codex plugin add tracework@tracework
```

<p>Public namespace: <code>tracework</code>. Config lives under <code>.tracework</code>; records stay in your own vault.</p>

</section>

## Work Trace Loop

```text
agent session -> capture signals -> query decisions -> brief / review / roadmap
```

Tracework is built for agent work that needs a durable trace: choices made,
paths rejected, evidence cited, risks carried, and next steps preserved. Coding
sessions are the strongest fit, but the same record shape also fits research,
writing, and product narrative work when the session has decisions and evidence.

## Proof Chain

| Layer | Question | Tracework surface |
| :--- | :--- | :--- |
| Raw record | What happened in the session? | `/tracework:capture` |
| Decision evidence | Why this path, not another? | `/tracework:query` |
| Work context | What should the next session carry forward? | `/tracework:recall` |
| Brief or review | What changed, what is risky, what is next? | `/tracework:weekly`, `/tracework:monthly` |
| History | How did the decisions evolve? | `/tracework:roadmap` |

## Boundary

Tracework is not a meeting-notes tool, approval workflow, generic office suite,
performance packaging layer, or employee-monitoring surface. It does not turn
activity counts into outcomes. It preserves evidence so a later reader can
check the work.
