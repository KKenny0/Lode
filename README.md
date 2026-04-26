<p align="center">
  <img src="logo.png" alt="Lode" width="180" />
</p>

<h1 align="center">Lode</h1>

<p align="center">从开发活动中，开采值得留下的东西。</p>

A lode is a vein of ore: the place where valuable mineral is concentrated underground, waiting to be discovered and refined. The word shares its root with **load** (to carry, to bear) — and with the Chinese character **载 (zài)**, meaning to carry, to record, to preserve across time.

These skills share one purpose: **extracting lasting value from raw development activity**. Commits, sessions, diffs, and code changes are the ore — abundant but unrefined. Lode is the vein that concentrates them into something worth keeping: daily notes, architecture docs, changelogs, weekly outlines, monthly reviews.

## Skills

| Skill | Purpose | Trigger timing |
|---|---|---|
| `lode-session-recap` | Session-end change log extraction | Per session, at wrap-up |
| `lode-arch-doc` | Stage impl docs + Pipeline arch docs | After architectural work |
| `lode-git-daily-note` | Obsidian daily notes from git history | Per day, on demand |
| `lode-weekly-outline` | Raw-first multi-project weekly PPT outline | Per week, on demand |
| `lode-monthly-review` | Monthly work review from daily notes | Per month, on demand |

All skills carry the `lode-` prefix to avoid collision with user-installed skills from other sources.

## What Lode is NOT

Lode is **not** a pipeline. These skills are independent — each triggered at its own time, for its own purpose. There is no sequential dependency between them. The shared identity is thematic, not procedural.

## Reusable Data Map

The skills can reuse each other's outputs when those files exist, but none of these steps is mandatory. The raw layer stores structured intermediate data; the wiki layer stores human-readable notes and summaries.

```
开发过程中:
  lode-session-recap ──→ {vault}/raw/weeks/{week}/{slug}.json
  lode-arch-doc ────────→ {vault}/raw/weeks/{week}/{slug}.json

每天:
  lode-git-daily-note ← {vault}/raw/weeks/ JSON + git log → {vault}/Daily Note.md

每周:
  lode-weekly-outline ← {vault}/raw/weeks/ + fallback git coverage → 周报大纲

每月:
  lode-monthly-review ← Daily Note.md
                       → {vault}/raw/months/{MM}/ (signals + skeleton)
                       → {vault}/Work Diary/ (archive + summary)
```

## Configuration

All skills share a unified configuration system:

```yaml
# ~/.lode/config.yaml (global)
knowledge_vault: /path/to/your/knowledge-vault
```

Resolution: project `.lode/config.yaml` → `~/.lode/config.yaml` → `$WEEKLY_PPT_PATH` → `~/.weekly-ppt/`.

`$WEEKLY_PPT_PATH` and `~/.weekly-ppt/` are legacy fallbacks. New setups should use `knowledge_vault` in `.lode/config.yaml` or `~/.lode/config.yaml`.

The knowledge vault is a git repo (typically an Obsidian vault) for cross-machine sync.

## Design Principles

**Self-contained skills** — Each skill has its own copy of shared files in its `references/` directory. Skills work correctly when installed individually.

**Explicit primary outputs, graceful side effects** — If a skill needs the vault for its main output, it asks for `knowledge_vault`. If a raw change entry is only a side effect, it can skip that write gracefully.

**Convention sync** — The canonical convention lives at `references/weekly-ppt-convention.md`. After editing it, run `scripts/sync-convention.sh` to copy to all skill directories.

**Scripts for deterministic work** — Python scripts handle parsing and aggregation; the agent handles interpretation and writing.

**Raw-first weekly reporting** — `lode-weekly-outline` uses weekly raw change entries as its primary semantic source. Git logs are fallback and coverage evidence only.

**Local evals, public benchmarks** — `skills/*/evals/` and `*-workspace/` are local-only. Public benchmark guidance lives under `benchmarks/`.

## Installation

### Via CLI From Source

```bash
npm --prefix cli install
npm --prefix cli run build
npm --prefix cli run copy-skills
node cli/dist/index.js setup
```

The interactive wizard will guide you through:
1. Selecting target platform (Claude Code / Codex / Both)
2. Setting knowledge vault path
3. Installing skills automatically

### Via npm

```bash
npx @lode/cli
```

This command works after `@lode/cli` has been published to the npm registry. Until then, use the source install above.

After installation, verify that the five official skills are present:

- `lode-session-recap`
- `lode-arch-doc`
- `lode-git-daily-note`
- `lode-weekly-outline`
- `lode-monthly-review`

Evaluation workspaces such as `lode-*-workspace/` and `evals/` are repository artifacts only; they are not installed as skills.

## Benchmarks

Benchmark guidance documents the quality bar without publishing local fixtures:

- `benchmarks/weekly-outline.md` — raw-first weekly outline benchmark covering sufficient raw entries, git fallback, and related architecture docs.

### Local Development

From this repository:

```bash
cd cli
npm install
npm run build
npm run copy-skills
node dist/index.js setup
```

### Manual

**Codex:** copy the five official skill directories into your Codex skills directory, typically `~/.agents/skills/` for this installer setup.

**Claude Code:** copy the five official skill directories into a Claude Code plugin marketplace directory and include `.claude-plugin/plugin.json`, or register the plugin with `claude plugin add`. See the [Claude Code Skills documentation](https://docs.anthropic.com/en/docs/claude-code/skills).

## License

MIT
