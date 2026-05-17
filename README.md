<p align="center">
  <img src="assets/mark.svg" alt="Lode" width="132" />
</p>

<h1 align="center">Lode</h1>

<p align="center"><strong>Decision replay for agentic coding: capture the why, then compound it into reports, reviews, and roadmaps.</strong></p>

<p align="center">
  <a href="https://kkenny0.github.io/Lode/">Documentation</a> · <a href="README.cn.md">中文</a>
</p>

## Why

AI makes software exploration cheap. It also makes continuity expensive.

In one coding session, you can compare multiple designs, reject plausible paths, discover hidden constraints, update prompts, change schemas, and make decisions that only make sense because of everything you tried along the way. Git records the final diff. Issue trackers record planned work. Neither keeps the reasoning that made the work possible.

When the session ends, that context usually disappears.

Lode is a local-first, dependency-light habit toolbox for agentic coding's persistent memory. Its public wedge is decision replay: capture decisions, risks, abandoned paths, open questions, and durable artifacts, then replay the reasoning later with cited evidence. Weekly outlines, monthly reviews, and roadmaps are compounding views over the same raw record.

## Habit Loop

Lode is organized around the loop you want to repeat until it becomes automatic:

```text
开工 -> 实现探索 -> 收工 -> 周期复盘
```

Weekly, monthly, and roadmap outputs are compounding layers on top of that loop. Adaptive-depth recap, lightweight sync suggestions, hard-stuff signals, and candidate rules are absorbed into the surviving skills instead of living as separate triggers.

## Skills

Each skill maps to a habit you already have. In plugin form, activate it with a
namespaced command.

| Skill | When | What it does |
| :--- | :--- | :--- |
| `/lode:cold-start-interview` | First run | Creates `~/.lode/config.yaml` with vault path, project identity, language, and report preferences |
| `/lode:capture` | Every session wrap-up | Classifies the session archetype, captures decision/build/repair depth, and indexes durable artifacts when relevant |
| `/lode:recall` | Session start | Recalls recent decisions, risks, open questions, abandoned alternatives, relevant docs, and possible stale intent artifacts |
| `/lode:query` | Targeted follow-up | Answers "why did we choose this?" with cited decision replay evidence |
| `/lode:daily` | Daily, on demand | Updates Obsidian daily notes from raw entries and git history |
| `/lode:weekly` | Weekly, on demand | Builds a weekly outline from raw entries, with a conditional hard-stuff section when evidence exists |
| `/lode:monthly` | Monthly, on demand | Generates a monthly review and candidate rules from repeated evidence |
| `/lode:roadmap` | On demand | Generates a narrative decision roadmap, including accumulating risks and recurring open questions |

Skills are independent. Lode is not a strict pipeline — each skill works on its own, but they share one local storage convention so downstream reports can reuse earlier context.

## Decision Replay

Lode turns "why did we choose this?" into a first-class workflow. Raw entries
remain the source of truth, while `{vault}/raw/decisions/{slug}.json` gives
coding agents a compact, cited evidence pack for targeted decision questions.
See
[`examples/decision-replay-proof.md`](examples/decision-replay-proof.md) for a
real Lode-on-Lode dogfood run, including a negative query that correctly
returns no answer when the decision history is missing.

## Install

### Claude Code

```bash
# GitHub marketplace (recommended)
claude plugin marketplace add KKenny0/Lode

# Or local development
claude plugin marketplace add ./path/to/Lode
```

After installation the namespaced commands (`/lode:capture`, `/lode:recall`, etc.) are available in every Claude Code session.

CLI verification is also available:

```bash
npx @lode/cli doctor
```

### Codex

```bash
# Codex Git-backed marketplace
codex plugin marketplace add KKenny0/Lode

# Or local development marketplace
codex plugin marketplace add ./path/to/Lode
```

Then run `/lode:cold-start-interview` once. Work in any git repo as usual:
say `开工` or `/lode:recall` at the start of a session, `收工` or
`/lode:capture` at the end, `/lode:query` when an agent needs a cited answer
about a past choice, and `/lode:roadmap` when you want to see how your project's
decisions evolved.

No vault? No problem — `收工` outputs structured Markdown directly in the conversation.

For configuration details see [docs/configuration.md](docs/configuration.md). For the data model see [docs/data-model.md](docs/data-model.md). Artifact ownership and roadmap storage rules are documented in [docs/artifact-governance.md](docs/artifact-governance.md). Synthetic examples live in [`examples/`](examples/).

## Background

The name comes from **lode**: a vein of ore where valuable mineral is concentrated. Commits, sessions, diffs, code changes — that is the ore. Lode refines it into work knowledge worth keeping. The word shares its root with *load* and with the Chinese character 载 (zài, to carry, to record). The original tagline, "the knowledge vein in your codebase", still describes the metaphor; the product promise is persistent memory for agentic coding that humans can read, review, and share.

Lode writes local Markdown and JSON only. Code-adjacent artifacts such as architecture docs stay in the project repo by default; shared memory, indexes, and reports live in your knowledge vault. No remote services, accounts, sync backends, or hosted databases. If your knowledge vault is a git repo, you control where it gets pushed.

<details>
<summary>Development</summary>

```bash
npm --prefix cli run build
npm --prefix cli run copy-skills
npm --prefix cli run check-skills
npm --prefix cli run test:regression
```

Design principles:

- **Self-contained skills**: each skill carries its own references so it can be installed individually.
- **Decision replay first**: `/lode:query` and `/lode:roadmap` turn captured rationale into cited answers and narrative decision history.
- **Raw-first reporting**: weekly reports use raw entries as the primary semantic source; git is fallback and coverage evidence.
- **Adaptive-depth recap**: session wrap-up entries carry archetype-specific fields so reports can explain decisions, repairs, investigations, and builds without a second write skill.
- **Artifact governance**: full repo-local docs stay near the code, while capture-owned vault indexes make them discoverable for recall and reports.
- **Graceful side effects**: when a raw write is only a side effect, failures do not block the primary deliverable.
- **Deterministic helpers**: scripts handle path resolution, date calculation, parsing, and aggregation where consistency matters.
- **Local evals, public protocols**: local fixtures stay ignored; public benchmark guidance lives under [`benchmarks/`](benchmarks/).

</details>

<details>
<summary>Benchmarks</summary>

Public benchmark protocols document the quality bar without publishing local fixtures:

- [`benchmarks/README.md`](benchmarks/README.md)
- [`benchmarks/weekly-outline.md`](benchmarks/weekly-outline.md)

</details>

## License

MIT
