# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A **Claude Code skill monorepo** (plugin) containing three declarative skills that capture development context. No build system, no tests, no dependencies.

## Repository Structure

```
references/weekly-ppt-convention.md   # Shared schema + storage rules (single source of truth)
skills/
  stage-doc-generator/                 # 12-section Stage implementation docs
    SKILL.md
    references/stage-implementation-spec.md
  pipeline-doc-generator/              # 13-section Pipeline architecture docs
    SKILL.md
    references/pipeline-doc.md
  weekly-change-tracker/               # Session-end change log extraction
    SKILL.md
```

## Key Design Decisions

- **Shared schema** is defined once in `references/weekly-ppt-convention.md` — all three skills reference it
- **Storage convention**: `~/.weekly-ppt/weeks/{YYYY-WNN}/{slug}.json` — shared write location for all skills
- **Silent failure**: if `~/.weekly-ppt/` doesn't exist or project slug can't be determined, skip the side-effect gracefully
- **Consumer is external**: `weekly-multi-project-ppt-lite` reads the change logs but lives in a separate repo

## Conventions

- Conventional commits (`feat:`, `docs:`, `init:`)
- Bilingual: English for technical spec, Chinese for user-facing triggers and slide content
- Each SKILL.md is self-contained — includes enough context to understand its workflow without reading other files
