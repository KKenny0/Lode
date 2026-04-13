# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A **Claude Code skill monorepo** (plugin) containing three declarative skills that capture development context. No build system, no tests, no dependencies.

## Repository Structure

```
references/weekly-ppt-convention.md   # Shared schema + storage rules (canonical source)
skills/
  stage-doc-generator/                 # 12-section Stage implementation docs
    SKILL.md
    references/
      stage-implementation-spec.md
      weekly-ppt-convention.md         # Copy of canonical convention
  pipeline-doc-generator/              # 13-section Pipeline architecture docs
    SKILL.md
    references/
      pipeline-doc.md
      weekly-ppt-convention.md         # Copy of canonical convention
  weekly-change-tracker/               # Session-end change log extraction
    SKILL.md
    references/
      weekly-ppt-convention.md         # Copy of canonical convention
```

## Key Design Decisions

- **Self-contained skills**: each skill has its own copy of `weekly-ppt-convention.md` in its `references/` directory, so skills work correctly when installed individually
- **Convention sync**: the canonical version lives at `references/weekly-ppt-convention.md`; after editing it, copy to all three skill directories
- **Storage convention**: `~/.weekly-ppt/weeks/{YYYY-WNN}/{slug}.json` — shared write location for all skills
- **Silent failure**: if `~/.weekly-ppt/` doesn't exist or project slug can't be determined, skip the side-effect gracefully
- **Consumer is external**: `weekly-multi-project-ppt-lite` reads the change logs but lives in a separate repo

## Conventions

- Conventional commits (`feat:`, `docs:`, `init:`)
- Bilingual: English for technical spec, Chinese for user-facing triggers and slide content
- Each SKILL.md is self-contained — includes enough context to understand its workflow without reading other files
