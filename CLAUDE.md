# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Lode** — a Claude Code skill monorepo (plugin) containing five declarative skills for development workflow recording — capturing context, generating docs, writing daily notes, producing weekly outlines, and generating monthly reviews. No build system, no tests, no dependencies.

The name comes from **lode**: a vein of ore where valuable mineral is concentrated. These skills extract lasting value from raw development activity. The word shares its root with "load" and the Chinese character 载 (zài, to carry, to record).

## Configuration

All skills share a unified configuration system:

```yaml
# ~/.lode/config.yaml (global) or {project}/.lode/config.yaml (project-level)
knowledge_vault: /path/to/your/knowledge-vault
```

Resolution: project `.lode/config.yaml` → `~/.lode/config.yaml` → `$WEEKLY_PPT_PATH` → `~/.weekly-ppt/` (legacy fallback).

See `references/lode-config-template.yaml` for full template including daily-note-specific settings.

## Repository Structure

```
references/
  weekly-ppt-convention.md             # Shared schema + storage rules (canonical source)
  lode-config-template.yaml             # Config file template
scripts/sync-convention.sh              # Sync convention to skill directories
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
    evals/evals.json
    references/config-template.yaml
  lode-weekly-outline/                  # Multi-project weekly PPT outline
    SKILL.md
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

## Skills Overview

| Skill | Purpose | Triggers |
|-------|---------|----------|
| lode-arch-doc | Stage impl docs (13 sections) + Pipeline arch docs (14 sections) | "stage impl doc", "架构文档", "pipeline 架构演进" |
| lode-session-recap | Session-end change log extraction | "收工", "done", "今天到这" |
| lode-git-daily-note | Obsidian daily notes from git history | "更新日报", "日报", "daily note" |
| lode-weekly-outline | Multi-project PPT outline from git | "周报", "weekly PPT" |
| lode-monthly-review | Monthly work review from daily notes | "月度回顾", "月报", "monthly review" |

## Information Flow

```
开发过程中:
  lode-session-recap ──→ {vault}/raw/weeks/{week}/{slug}.json
  lode-arch-doc ───────→ {vault}/raw/weeks/{week}/{slug}.json

每天:
  lode-git-daily-note ← {vault}/raw/weeks/ JSON + git log → {vault}/Daily Note.md

每周:
  lode-weekly-outline ← git commits → 周报大纲

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
- **Silent failure**: if config doesn't exist or project slug can't be determined, skip the side-effect gracefully (with legacy fallback to `~/.weekly-ppt/`)
- **Scripts for deterministic work**: lode-monthly-review uses Python scripts for parsing and aggregation; Claude only handles interpretation and writing

## Conventions

- Conventional commits (`feat:`, `docs:`, `init:`)
- Bilingual: English for technical spec, Chinese for user-facing triggers and slide content
- Each SKILL.md is self-contained — includes enough context to understand its workflow without reading other files
