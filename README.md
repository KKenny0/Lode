<p align="center">
  <img src="logo.png" alt="Lode" width="180" />
</p>

<h1 align="center">Lode</h1>

<p align="center">从开发活动中，开采值得留下的东西。</p>

A lode is a vein of ore: the place where valuable mineral is concentrated underground, waiting to be discovered and refined. The word shares its root with **load** (to carry, to bear) — and with the Chinese character **载 (zài)**, meaning to carry, to record, to preserve across time.

These skills share one purpose: **extracting lasting value from raw development activity**. Commits, sessions, diffs, and code changes are the ore — abundant but unrefined. Lode is the vein that concentrates them into something worth keeping: daily notes, architecture docs, changelogs, weekly outlines.

## Skills

| Skill | Purpose | Trigger timing |
|---|---|---|
| `lode-git-daily-note` | Obsidian daily notes from git history | Per day, on demand |
| `lode-arch-doc` | Stage impl docs + Pipeline arch docs | After architectural work |
| `lode-session-recap` | Session-end change log extraction | Per session, at wrap-up |
| `lode-weekly-outline` | Multi-project weekly PPT outline | Per week, on demand |

All skills carry the `lode-` prefix to avoid collision with user-installed skills from other sources.

## What Lode is NOT

Lode is **not** a pipeline. These skills are independent — each triggered at its own time, for its own purpose. There is no sequential dependency between them. The shared identity is thematic, not procedural.

## Information Flow

```
开发过程中:
  lode-session-recap ──→ ~/.weekly-ppt/weeks/{week}/{slug}.json
  lode-arch-doc ────────→ ~/.weekly-ppt/weeks/{week}/{slug}.json

每天:
  lode-git-daily-note ← ~/.weekly-ppt/ JSON + git log 补漏 → Obsidian 日报

每周:
  lode-weekly-outline ← git commits + ~/.weekly-ppt/ → 周报大纲
```

## Design Principles

**Self-contained skills** — Each skill has its own copy of shared files in its `references/` directory. Skills work correctly when installed individually. Skills cannot reference files outside their directory via `../`.

**Silent failure** — If `~/.weekly-ppt/` doesn't exist or project slug can't be determined, skip the side-effect gracefully.

**Convention sync** — The canonical convention lives at `references/weekly-ppt-convention.md`. After editing it, run `scripts/sync-convention.sh` to copy to all skill directories that need it.

## Installation

将本仓库克隆到 Claude Code 的 skill 目录，或通过 `claude plugin add` 注册。详情参见 [Claude Code Skills 文档](https://docs.anthropic.com/en/docs/claude-code/skills)。

## License

MIT
