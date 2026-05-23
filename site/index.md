---
layout: home

hero:
  name: Lode
  text: Git tells you what changed. Lode tells your next coding agent why.
  tagline: Install, run the demo, capture one session, then query one decision with cited local evidence.
  actions:
    - theme: brand
      text: See It in Action
      link: /showcase
    - theme: alt
      text: Get Started
      link: /quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/KKenny0/Lode

features:
  - title: Decision Replay
    details: Ask why a path was chosen and get cited evidence from local entries and derived decision indexes.
    icon: 🔍
  - title: Persistent Memory
    details: Capture decisions, abandoned paths, risks, and open questions at wrap-up. Recall them after history exists.
    icon: 💎
  - title: Compounding Outputs
    details: The same raw entries later compound into recall context, roadmaps, weekly outlines, and monthly reviews.
    icon: 📈
  - title: Zero-Config Start
    details: One command captures your first session. No vault required. Structured Markdown appears right in the conversation.
    icon: ⚡
---

## Skills

Each skill maps to a habit you already have. Activate it with a namespaced command.

| Skill | When | What it does |
| :--- | :--- | :--- |
| `/lode:cold-start-interview` | First run | Creates `~/.lode/config.yaml` with vault path, project identity, and report preferences |
| `/lode:capture` | Every wrap-up | Classifies session archetype, captures decision/repair depth, indexes artifacts |
| `/lode:query` | Targeted follow-up | Answers "why did we choose this?" with cited decision replay evidence |
| `/lode:recall` | Session start, after history exists | Recalls recent decisions, risks, open questions, and relevant docs |
| `/lode:roadmap` | After multiple decisions | Generates narrative decision roadmap with accumulating risks |
| `/lode:daily` | Daily, on demand | Updates Obsidian daily notes from raw entries and git history |
| `/lode:weekly` | Weekly, on demand | Builds weekly outline from raw entries with conditional hard-stuff section |
| `/lode:monthly` | Monthly, on demand | Generates monthly review and candidate rules from repeated evidence |

## The Replay Loop

```text
install → demo → capture one session → query one decision
```

This is the first value path. Weekly, monthly, recall, and roadmap outputs are
compounding layers on top of the same local record. Skills are independent, but
they share one storage convention so downstream views reuse earlier evidence.

## Decision Replay

Lode dogfoods a derived decision replay index for its own project history. Raw entries remain the source of truth; `{vault}/raw/decisions/{slug}.json` gives coding agents compact evidence packs for targeted "why did we choose this?" queries.

See the [dogfood proof on GitHub](https://github.com/KKenny0/Lode/blob/main/examples/decision-replay-proof.md).

## Install

```bash
codex plugin marketplace add KKenny0/Lode
npx @lode/cli install-codex-plugin
```

Then run the demo, run `/lode:cold-start-interview` once, capture one real
session with `收工`, and query one decision with `/lode:query`.

No vault? No problem. `收工` outputs structured Markdown directly in the conversation.
