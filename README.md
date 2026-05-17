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

Lode is a local-first, dependency-light habit toolbox for agentic coding's persistent memory. Its primary value path is decision replay: capture decisions, risks, abandoned paths, open questions, and durable artifacts, then replay the reasoning later with cited evidence. Weekly outlines, monthly reviews, and roadmaps are compounding views over the same raw record.

## Decision Replay Loop

Lode is packaged around one primary value path:

```text
install -> demo -> capture one session -> query one decision
```

That loop proves the product: a coding agent can ask why a choice was made and
get cited local evidence instead of a vague recap. `recall`, `roadmap`, daily,
weekly, and monthly outputs come later as compounding views over the same raw
record.

## Skills

Each skill maps to a habit you already have. In plugin form, activate it with a
namespaced command.

| Skill | When | What it does |
| :--- | :--- | :--- |
| `/lode:cold-start-interview` | First run | Creates `~/.lode/config.yaml` with vault path, project identity, language, and report preferences |
| `/lode:capture` | Every session wrap-up | Classifies the session archetype, captures decision/build/repair depth, and indexes durable artifacts when relevant |
| `/lode:query` | Targeted follow-up | Answers "why did we choose this?" with cited decision replay evidence |
| `/lode:recall` | Session start, after history exists | Recalls recent decisions, risks, open questions, abandoned alternatives, relevant docs, and possible stale intent artifacts |
| `/lode:roadmap` | On demand, after multiple decisions | Generates a narrative decision roadmap, including accumulating risks and recurring open questions |
| `/lode:daily` | Daily, on demand | Updates Obsidian daily notes from raw entries and git history |
| `/lode:weekly` | Weekly, on demand | Builds a weekly outline from raw entries, with a conditional hard-stuff section when evidence exists |
| `/lode:monthly` | Monthly, on demand | Generates a monthly review and candidate rules from repeated evidence |

Skills are independent. Lode is not a strict pipeline — each skill works on its own, but they share one local storage convention so downstream reports can reuse earlier context.

## Decision Replay

Lode turns "why did we choose this?" into a first-class workflow. Raw entries
remain the source of truth, while `{vault}/raw/decisions/{slug}.json` gives
coding agents a compact, cited evidence pack for targeted decision questions.
See
[`examples/decision-replay-proof.md`](examples/decision-replay-proof.md) for a
real Lode-on-Lode dogfood run, including a negative query that correctly
returns no answer when the decision history is missing.

### First useful path

1. Install Lode.
2. Run the deterministic fixture:

```bash
node examples/decision-replay-demo.mjs
```

It prints the same compact evidence shape `/lode:query` is meant to give a
coding agent: answerability metadata, the top decision node, raw
`source_entry_refs`, matched terms, and rejected alternatives.

3. Run `/lode:cold-start-interview` once.
4. At the end of one real coding session, say `收工` or run `/lode:capture`.
5. Ask `/lode:query why did we choose <the decision>?`.

The useful result is not a summary. It is a cited answer with matched decision
nodes, `source_entry_refs`, rejected alternatives when recorded, and an explicit
"not enough evidence" response when the vault does not contain that history.
After that loop works, use `/lode:recall`, `/lode:roadmap`, `/lode:daily`,
`/lode:weekly`, and `/lode:monthly` to compound the same record.

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

Codex can register a plugin marketplace, but it does not currently expose a
native command that installs and enables a marketplace plugin from the CLI.
Lode ships a small bridge command for that gap: it copies the bundled plugin to
Codex's plugin cache and enables `lode@lode-marketplace` in
`~/.codex/config.toml`.

```bash
codex plugin marketplace add KKenny0/Lode
npx @lode/cli install-codex-plugin
```

Restart Codex if it is open, then start a new thread. You should see the Lode
plugin skills as available commands such as `/lode:capture`, `/lode:recall`,
and `/lode:query`.

For local development, build the CLI and install from this checkout:

```bash
npm --prefix cli run build
node cli/dist/index.js install-codex-plugin
```

Then prove the replay loop: run the demo, run `/lode:cold-start-interview`
once, capture one real session with `收工` or `/lode:capture`, and query one
decision with `/lode:query`. After that, use `开工` or `/lode:recall` at session
start, `/lode:roadmap` for decision evolution, and reports when the raw record
has enough history.

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
- [`docs/release-artifact-inventory.md`](docs/release-artifact-inventory.md)

</details>

## License

MIT
