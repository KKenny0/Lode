---
layout: home

hero:
  name: Lode
  text: Agentic coding's persistent memory
  tagline: Capture the why. Compound it into reports, reviews, and decision roadmaps.
  image:
    src: /mark.svg
    alt: Lode
  actions:
    - theme: brand
      text: Get Started
      link: /quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/KKenny0/Lode

features:
  - title: Persistent Memory
    details: Capture decisions, abandoned paths, risks, and open questions at every session wrap-up. Recall them automatically at session start.
    icon: 🧠
  - title: Decision Replay
    details: Go beyond git diffs. Reconstruct the reasoning that made the code possible with narrative decision roadmaps.
    icon: 🗺️
  - title: Compounding Reports
    details: Raw entries compound into weekly outlines, monthly reviews, and candidate rules. Each layer builds on the last.
    icon: 📊
  - title: Zero-Config Start
    details: One command captures your first session. No vault required — structured Markdown appears right in the conversation.
    icon: ⚡
---

## Skills

Each skill maps to a habit you already have. Activate it with a namespaced command.

| Skill | When | What it does |
| :--- | :--- | :--- |
| `/lode:cold-start-interview` | First run | Creates `~/.lode/config.yaml` with vault path, project identity, and report preferences |
| `/lode:recall` | Session start | Recalls recent decisions, risks, open questions, and relevant docs |
| `/lode:capture` | Every wrap-up | Classifies session archetype, captures decision/repair depth, indexes artifacts |
| `/lode:daily` | Daily, on demand | Updates Obsidian daily notes from raw entries and git history |
| `/lode:weekly` | Weekly, on demand | Builds weekly outline from raw entries with conditional hard-stuff section |
| `/lode:monthly` | Monthly, on demand | Generates monthly review and candidate rules from repeated evidence |
| `/lode:roadmap` | On demand | Generates narrative decision roadmap with accumulating risks |

## The Habit Loop

```text
开工 (recall) → 实现探索 (work) → 收工 (capture) → 周期复盘 (review)
```

Weekly, monthly, and roadmap outputs are compounding layers on top of that loop. Skills are independent — each works on its own, but they share one local storage convention so downstream reports reuse earlier context.

## Install

```bash
# Codex Git-backed marketplace
codex plugin marketplace add KKenny0/Lode

# CLI verification
npx @lode/cli doctor
```

Then run `/lode:cold-start-interview` once. Say `开工` at the start of a session, `收工` at the end.

No vault? No problem — `收工` outputs structured Markdown directly in the conversation.
