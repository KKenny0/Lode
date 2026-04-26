# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What This Is

**Lode** — a cross-runtime skill monorepo (Codex skills + Claude Code plugin) containing five declarative skills for development workflow recording: capturing context, generating docs, writing daily notes, producing weekly outlines, and generating monthly reviews.

The skills themselves are Markdown-first and dependency-light. The repository also includes a Node-based CLI installer under `cli/`, local-only eval fixtures, and public benchmark guidance.

The name comes from **lode**: a vein of ore where valuable mineral is concentrated. These skills extract lasting value from raw development activity. The word shares its root with "load" and the Chinese character 载 (zài, to carry, to record).

## Configuration

All skills share a unified configuration system:

```yaml
# ~/.lode/config.yaml (global) or {project}/.lode/config.yaml (project-level)
knowledge_vault: /path/to/your/knowledge-vault
```

Resolution: project `.lode/config.yaml` → `~/.lode/config.yaml` → `$WEEKLY_PPT_PATH` → `~/.weekly-ppt/`.

`$WEEKLY_PPT_PATH` and `~/.weekly-ppt/` are legacy fallbacks. New setups should use `knowledge_vault` in `.lode/config.yaml` or `~/.lode/config.yaml`.

See `references/lode-config-template.yaml` for full template including daily-note-specific settings.

## Repository Structure

```
references/
  weekly-ppt-convention.md             # Shared schema + storage rules (canonical source)
  lode-config-template.yaml             # Config file template
scripts/sync-convention.sh              # Sync convention to skill directories
benchmarks/
  weekly-outline.md                     # Public benchmark guidance (fixtures stay local)
cli/                                     # Installer CLI for Codex / Claude Code
  src/
  package.json
skills/
  lode-arch-doc/                        # Stage impl + Pipeline arch docs
    SKILL.md
    references/
      stage-implementation-spec.md
      pipeline-doc.md
      weekly-ppt-convention.md
  lode-session-recap/                   # Session-end change log extraction
    SKILL.md
    references/
      weekly-ppt-convention.md
  lode-git-daily-note/                  # Obsidian daily notes from git history
    SKILL.md
    scripts/git-stats.sh
    references/config-template.yaml
  lode-weekly-outline/                  # Raw-first multi-project weekly PPT outline
    SKILL.md
    agents/openai.yaml
    references/
      slide-template.md
      subagent-prompt.md
  lode-monthly-review/                  # Monthly work review from daily notes
    SKILL.md
    scripts/
      split_daily_note.py
      prepare_monthly_data.py
    references/
      daily-note-format.md
      worklog-summary-template.md
      project-tagging-guide.md
      weekly-ppt-convention.md
```

Local-only artifacts:

```
skills/*/evals/                         # Ignored local eval fixtures
skills/*-workspace/                     # Ignored benchmark workspaces/results
```

## Skills Overview

| Skill | Purpose | Triggers |
|-------|---------|----------|
| lode-arch-doc | Stage impl docs (13 sections) + Pipeline arch docs (14 sections) | "stage impl doc", "架构文档", "pipeline 架构演进" |
| lode-session-recap | Session-end change log extraction | "收工", "done", "今天到这" |
| lode-git-daily-note | Obsidian daily notes from git history | "更新日报", "日报", "daily note" |
| lode-weekly-outline | Raw-first multi-project PPT outline from weekly change entries, with git fallback | "周报", "weekly PPT" |
| lode-monthly-review | Monthly work review from daily notes | "月度回顾", "月报", "monthly review" |

## Reusable Data Map

Lode is not a strict pipeline. Skills are independently triggered, but they can reuse each other's artifacts when available.

```
开发过程中:
  lode-session-recap ──→ {vault}/raw/weeks/{week}/{slug}.json
  lode-arch-doc ───────→ {vault}/raw/weeks/{week}/{slug}.json

每天:
  lode-git-daily-note ← {vault}/raw/weeks/ JSON + git log → {vault}/Daily Note.md

每周:
  lode-weekly-outline ← {vault}/raw/weeks/ + fallback git coverage → 周报大纲

每月:
  lode-monthly-review ← Daily Note.md → {vault}/raw/months/{MM}/ (signals + skeleton)
                                          {vault}/Work Diary/ (archive + summary)
```

## Storage Convention

Data is organized in two layers within the knowledge vault:

- **Raw layer** (`{vault}/raw/`): immutable intermediate data (JSON entries, signals, skeletons)
- **Wiki layer** (`{vault}/Daily Note.md`, `{vault}/Work Diary/`): human-readable outputs

The knowledge vault is a git repo (typically an Obsidian vault), enabling cross-machine sync via git push/pull.

## Key Design Decisions

- **Self-contained skills**: each skill has its own copy of shared files in its `references/` directory, so skills work correctly when installed individually. Skills cannot reference files outside their directory via `../`
- **Convention sync**: the canonical version lives at `references/weekly-ppt-convention.md`; after editing it, run `scripts/sync-convention.sh` to copy to all skill directories that need it
- **Unified config**: all skills read vault path from `.lode/config.yaml`; project-level config overrides global
- **Explicit primary outputs, graceful side effects**: if a skill needs the vault for its main output, it asks for `knowledge_vault`; if a raw change entry is only a side effect, it can skip that write gracefully
- **Raw-first weekly reporting**: `lode-weekly-outline` consumes weekly raw change entries as the primary semantic source; git logs are fallback and coverage evidence only
- **Weekly-report-quality raw entries**: `lode-session-recap` and `lode-arch-doc` should write report-worthy signals, decisions, risks, contracts, and impact rather than process logs or "updated docs" entries
- **Local evals, public benchmarks**: `skills/*/evals/` and `*-workspace/` stay local; public benchmark guidance lives under `benchmarks/`
- **Scripts for deterministic work**: lode-monthly-review uses Python scripts for parsing and aggregation; the agent handles interpretation and writing

## Conventions

- Conventional commits (`feat:`, `docs:`, `init:`)
- Bilingual: English for technical spec, Chinese for user-facing triggers and slide content
- Each SKILL.md is self-contained — includes enough context to understand its workflow without reading other files
