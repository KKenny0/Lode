# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Lode** — a Claude Code skill monorepo (plugin) containing five declarative skills for development workflow recording — capturing context, generating docs, writing daily notes, and producing weekly outlines. No build system, no tests, no dependencies.

The name comes from **lode**: a vein of ore where valuable mineral is concentrated. These skills extract lasting value from raw development activity. The word shares its root with "load" and the Chinese character 载 (zài, to carry, to record).

## Repository Structure

```
references/weekly-ppt-convention.md   # Shared schema + storage rules (canonical source)
scripts/sync-convention.sh            # Sync convention to skill directories
skills/
  lode-stage-doc/                      # 12-section Stage implementation docs
    SKILL.md
    references/
      stage-implementation-spec.md
      weekly-ppt-convention.md         # Copy of canonical convention
  lode-pipeline-doc/                   # 13-section Pipeline architecture docs
    SKILL.md
    references/
      pipeline-doc.md
      weekly-ppt-convention.md         # Copy of canonical convention
  lode-session-recap/                  # Session-end change log extraction
    SKILL.md
    references/
      weekly-ppt-convention.md         # Copy of canonical convention
  lode-git-daily-note/                 # Obsidian daily notes from git history
    SKILL.md
    scripts/git-stats.sh
    evals/evals.json
    references/config-template.yaml
  lode-weekly-outline/                 # Multi-project weekly PPT outline
    SKILL.md
    references/
      slide-template.md
      subagent-prompt.md
```

## Skills Overview

| Skill | Purpose | Triggers |
|-------|---------|----------|
| lode-stage-doc | 12-section Stage implementation docs | "为 X stage 写文档", "stage impl doc" |
| lode-pipeline-doc | 13-section Pipeline architecture docs | "写架构文档", "pipeline 架构演进" |
| lode-session-recap | Session-end change log extraction | "收工", "done", "今天到这" |
| lode-git-daily-note | Obsidian daily notes from git history | "更新日报", "日报", "daily note" |
| lode-weekly-outline | Multi-project PPT outline from git | "周报", "weekly PPT" |

## Information Flow

```
开发过程中:
  lode-session-recap (session-end) ──→ ~/.weekly-ppt/weeks/{week}/{slug}.json
  lode-stage-doc (doc 生成后) ───────→ ~/.weekly-ppt/weeks/{week}/{slug}.json
  lode-pipeline-doc (doc 生成后) ────→ ~/.weekly-ppt/weeks/{week}/{slug}.json

每天:
  lode-git-daily-note ← git commit history → Obsidian 日报

每周:
  lode-weekly-outline ← git commits + ~/.weekly-ppt/ → 周报大纲
```

## Key Design Decisions

- **Self-contained skills**: each skill has its own copy of shared files in its `references/` directory, so skills work correctly when installed individually. Skills cannot reference files outside their directory via `../`.
- **Convention sync**: the canonical version lives at `references/weekly-ppt-convention.md`; after editing it, run `scripts/sync-convention.sh` to copy to all three skill directories that need it
- **Storage convention**: `~/.weekly-ppt/weeks/{YYYY-WNN}/{slug}.json` — shared write location for lode-session-recap, lode-stage-doc, and lode-pipeline-doc
- **Silent failure**: if `~/.weekly-ppt/` doesn't exist or project slug can't be determined, skip the side-effect gracefully
- **Consumer is co-located**: lode-weekly-outline reads the change logs and now lives in the same repo

## Conventions

- Conventional commits (`feat:`, `docs:`, `init:`)
- Bilingual: English for technical spec, Chinese for user-facing triggers and slide content
- Each SKILL.md is self-contained — includes enough context to understand its workflow without reading other files
