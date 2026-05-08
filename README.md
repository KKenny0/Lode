<p align="center">
  <img src="assets/logo.png" alt="Lode" width="180" />
</p>

<h1 align="center">Lode</h1>

<p align="center"><strong>The knowledge vein in your codebase.</strong></p>

<p align="center">
  <a href="README.cn.md">中文</a>
</p>

## Why

You build software with an AI assistant. During a session, you explore multiple paths — what you tried, what you abandoned, why you abandoned it, which risks surfaced, which design choices were made after weighing trade-offs. This knowledge is the most valuable part of the project.

When the session ends, it vanishes.

Git records **what changed**. Issue trackers record **planned work**. But **what you learned along the way** — nobody records that.

Lode is the third layer. At the end of each session it captures motivations, exploration paths, abandoned alternatives, and open questions — then reuses that memory for daily notes, weekly outlines, monthly reviews, and architecture documentation.

## See it

<img src="assets/lode-demo.gif" alt="Lode demo: session recap to weekly report" width="800" />

A single `收工` is enough to see the value — no configuration, no waiting for data to accumulate.

## Habit Loop

Lode is organized around a high-frequency agentic coding loop:

```text
开工 -> 实现探索 -> 同步意图 -> 收工 -> 周期复盘 -> 沉淀经验
```

Daily, weekly, monthly, and roadmap outputs are compounding layers on top of
that loop, not the main product story.

## Skills

Each skill maps to a habit you already have. Activate it with a trigger phrase.

| Skill | When | What it does |
| :--- | :--- | :--- |
| `lode-session-recap` | Every session wrap-up | Extracts decision signals: motivation, exploration paths, abandoned alternatives, open questions |
| `lode-arch-doc` | After architecture work | Generates Stage implementation docs or Pipeline architecture evolution docs |
| `lode-session-start-recall` | Session start | Recalls recent decisions, risks, open questions, abandoned alternatives, and relevant repo-local docs |
| `lode-intent-sync` | After implementation learning | Proposes updates so DESIGN / PLAN / AGENTS / README stay aligned with what was learned |
| `lode-hard-stuff-radar` | On demand | Surfaces recurring open questions, architecture risks, stale threads, and problems needing judgment |
| `lode-experience-distillation` | On demand | Turns repeated lessons into AGENTS rules, checklists, playbooks, or skill ideas |
| `lode-decision-roadmap` | On demand | Generates a narrative decision roadmap from accumulated entries — shows how project decisions evolved, reassesses abandoned alternatives |
| `lode-git-daily-note` | Daily, on demand | Updates Obsidian daily notes from raw entries and git history |
| `lode-weekly-outline` | Weekly, on demand | Builds a multi-project weekly outline from accumulated raw entries |
| `lode-monthly-review` | Monthly, on demand | Generates a monthly work review from daily notes |

Skills are independent. Lode is not a strict pipeline — each skill works on its own, but they share one local storage convention so downstream reports can reuse earlier context.

## Install

```bash
# 1. Install all skills
npx skills add KKenny0/Lode -g --all

# 2. Configure vault path
mkdir -p ~/.lode
cat > ~/.lode/config.yaml <<EOF
knowledge_vault: /path/to/your/knowledge-vault
EOF

# 3. Verify
npx @lode/cli doctor
```

Then work in any git repo as usual. Say `开工` at the start of a session, `同步意图` when implementation learning should update specs, `收工` at the end of a session, and `决策路线图` when you want to see how your project's decisions evolved.

No vault? No problem — `收工` outputs structured Markdown directly in the conversation.

For configuration details see [docs/configuration.md](docs/configuration.md). For the data model see [docs/data-model.md](docs/data-model.md). Artifact ownership and roadmap storage rules are documented in [docs/artifact-governance.md](docs/artifact-governance.md). Synthetic examples live in [`examples/`](examples/).

## Background

The name comes from **lode**: a vein of ore where valuable mineral is concentrated. Commits, sessions, diffs, code changes — that is the ore. Lode refines it into work knowledge worth keeping. The word shares its root with *load* and with the Chinese character 载 (zài, to carry, to record).

Lode writes local Markdown and JSON only. Code-adjacent artifacts such as architecture docs stay in the project repo by default; shared memory, indexes, and reports live in your knowledge vault. No remote services, accounts, sync backends, or hosted databases. If your knowledge vault is a git repo, you control where it gets pushed.

<details>
<summary>Development</summary>

```bash
npm --prefix cli run build
npm --prefix cli run copy-skills
npm --prefix cli run check-skills
```

Design principles:

- **Self-contained skills**: each skill carries its own references so it can be installed individually.
- **Raw-first reporting**: weekly reports use raw entries as the primary semantic source; git is fallback and coverage evidence.
- **Artifact governance**: full repo-local docs stay near the code, while vault indexes make them discoverable for recall and reports.
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
