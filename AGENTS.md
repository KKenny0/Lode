# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What This Is

**Lode** — a cross-runtime plugin and skill monorepo (Codex plugin + Claude Code plugin) for agentic coding's persistent memory. It contains six workflow skills for session-start recall, adaptive-depth context capture, decision roadmaps, daily notes, weekly outlines, and monthly reviews, one targeted decision-query skill, plus one cold-start setup skill.

Lode is positioned as a reporting and decision-replay engine, not a generic memory layer. Capture/retrieval is the input; structured weekly outlines, monthly reviews, and decision roadmaps are the product.

The skills themselves are Markdown-first and dependency-light. The repository also includes a Node-based CLI installer under `cli/`, local-only eval fixtures, and public benchmark guidance.

The name comes from **lode**: a vein of ore where valuable mineral is concentrated. These skills extract lasting value from raw development activity. The word shares its root with "load" and the Chinese character 载 (zài, to carry, to record).

## Configuration

All skills share a unified configuration system:

```yaml
# ~/.lode/config.yaml (global) or {project}/.lode/config.yaml (project-level)
knowledge_vault: /path/to/your/knowledge-vault
project_slug: my-project

profile:
  project_name: My Project
  report_language: mixed
  weekly_mode: tech
  team_context: solo
```

Resolution: project `.lode/config.yaml` → `~/.lode/config.yaml` → `$WEEKLY_PPT_PATH` → `~/.weekly-ppt/`.

`$WEEKLY_PPT_PATH` and `~/.weekly-ppt/` are legacy fallbacks. New setups should use `knowledge_vault` in `.lode/config.yaml` or `~/.lode/config.yaml`.

See `references/lode-config-template.yaml` for full template including daily-note-specific settings.

Artifact governance options:

```yaml
artifact_index:
  enabled: true
```

## Repository Structure

```
references/
  weekly-ppt-convention.md             # Shared schema + storage rules (canonical source)
  lode-config-template.yaml             # Config file template
.codex-plugin/plugin.json               # Codex plugin manifest
.claude-plugin/plugin.json              # Claude Code plugin manifest
.claude-plugin/marketplace.json         # Claude-style marketplace metadata
.agents/plugins/marketplace.json        # Codex repo marketplace metadata
scripts/sync-convention.sh              # Sync convention to skill directories
benchmarks/
  weekly-outline.md                     # Public benchmark guidance (fixtures stay local)
cli/                                     # Installer CLI for Codex / Claude Code
  src/
  package.json
skills/
  cold-start-interview/       # First-run config setup
    SKILL.md
    references/
      lode-config-template.yaml
  capture/                   # Session-end change log extraction
    SKILL.md
    scripts/lode_raw.py
    references/
      weekly-ppt-convention.md
  recall/            # Session-start project memory recall
    SKILL.md
    scripts/recall_context.py
    references/
      recall-output-template.md
      weekly-ppt-convention.md
  query/             # Targeted decision replay queries
    SKILL.md
    scripts/decision_graph.py
  roadmap/                # Narrative decision history
    SKILL.md
    scripts/decision_graph.py
    references/
      weekly-ppt-convention.md
  daily/                  # Obsidian daily notes from git history
    SKILL.md
    scripts/git-stats.sh
    references/config-template.yaml
  weekly/                  # Raw-first multi-project weekly PPT outline
    SKILL.md
    agents/openai.yaml
    references/
      slide-template.md
      subagent-prompt.md
  monthly/                  # Monthly work review from daily notes
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
| cold-start-interview | First-run setup for `~/.lode/config.yaml` | `/lode:cold-start-interview`, "configure Lode" |
| capture | Adaptive-depth session recap plus artifact context and sync suggestions | `/lode:capture`, "收工", "done", "今天到这" |
| recall | Session-start recall from raw entries + artifact index | `/lode:recall`, "开工", "session start", "继续上次" |
| query | Targeted decision replay evidence pack | `/lode:query`, "why did we choose this?", "为什么当时这么选" |
| daily | Obsidian daily notes from git history | `/lode:daily`, "更新日报", "日报", "daily note" |
| weekly | Raw-first weekly PPT outline with conditional hard-stuff section | `/lode:weekly`, "周报", "weekly PPT" |
| monthly | Monthly work review with candidate rules from repeated evidence | `/lode:monthly`, "月度回顾", "月报", "monthly review" |
| roadmap | Narrative decision roadmap with risk accumulation and recurring open questions | `/lode:roadmap`, "决策路线图", "decision roadmap" |

## Reusable Data Map

Lode is not a strict pipeline. Skills are independently triggered, but they can reuse each other's artifacts when available.

```
首次配置:
  cold-start-interview → ~/.lode/config.yaml (vault path + project/report profile)

开发过程中:
  recall ← {vault}/raw/weeks/ + {vault}/raw/artifacts/ → 开工上下文
  query ← {vault}/raw/decisions/ + {vault}/raw/weeks/ → 定向决策证据包
  capture ──→ {vault}/raw/weeks/{week}/{slug}.json
                     ├─→ artifact_context embedded in raw entries
                     ├─→ {vault}/raw/artifacts/{slug}.json when durable artifacts change
                     └─→ lightweight sync suggestions for DESIGN/PLAN/AGENTS/README review
  roadmap ← raw entries + artifact index → decisions + accumulating risks + recurring questions
          └─→ {vault}/raw/decisions/{slug}.json derived decision replay index

每天:
  daily ← {vault}/raw/weeks/ JSON + git log → {vault}/Daily Note.md

每周:
  weekly ← {vault}/raw/weeks/ + fallback git coverage → 周报大纲 + hard stuff when supported

每月:
  monthly ← Daily Note.md → {vault}/raw/months/{MM}/ (signals + skeleton)
                                          {vault}/Work Diary/ (archive + summary)
                                     └─→ candidate rules (proposal-only)
```

## Storage Convention

Data is organized in two layers within the knowledge vault:

- **Raw layer** (`{vault}/raw/`): immutable intermediate data (JSON entries, artifact indexes, signals, skeletons)
- **Wiki layer** (`{vault}/Daily Note.md`, `{vault}/Work Diary/`): human-readable outputs

The knowledge vault is a git repo (typically an Obsidian vault), enabling cross-machine sync via git push/pull.

Lode uses four storage surfaces:

- **Project repo**: code-adjacent artifacts that evolve with implementation, such as arch docs, `DESIGN.md`, `PLAN.md`, `AGENTS.md`, prompt contracts, and schema contracts
- **Vault raw layer**: machine-readable memory and indexes, including weekly raw entries and `{vault}/raw/artifacts/{slug}.json`
- **Vault wiki layer**: human-readable synthesis outputs such as Daily Note, weekly outline, monthly review, and decision roadmap
- **Conversation fallback**: zero-config immediate value when durable storage is unavailable

## Key Design Decisions

- **Self-contained skills**: each skill has its own copy of shared files in its `references/` directory, so skills work correctly when installed individually. Skills cannot reference files outside their directory via `../`
- **Convention sync**: the canonical version lives at `references/weekly-ppt-convention.md`; after editing it, run `scripts/sync-convention.sh` to copy to all skill directories that need it
- **Unified config**: all skills read vault path from `.lode/config.yaml`; project-level config overrides global
- **Explicit primary outputs, graceful side effects**: if a skill needs the vault for its main output, it asks for `knowledge_vault`; if a raw change entry is only a side effect, it can skip that write gracefully
- **Artifact governance**: full repo-local artifacts stay near code by default; vault artifact indexes make them discoverable without turning weekly raw entries into a document catalog
- **Decision replay query boundary**: `recall` surfaces session-start context; `query` handles targeted "why/alternatives/revisit/impact" questions with cited evidence packs
- **Raw-first weekly reporting**: `weekly` consumes weekly raw change entries as the primary semantic source; git logs are fallback and coverage evidence only
- **Adaptive-depth recap**: `capture` classifies sessions as decision/build/investigation/repair/maintenance and writes archetype-specific signals for downstream reports
- **Legacy arch-doc compatibility**: historical `source: arch-doc` raw entries remain readable, but new write output uses `source: session-recap`
- **Weekly-report-quality raw entries**: `capture` should write report-worthy signals, decisions, risks, contracts, and impact rather than process logs or "updated docs" entries
- **Local evals, public benchmarks**: `skills/*/evals/` and `*-workspace/` stay local; public benchmark guidance lives under `benchmarks/`
- **Scripts for deterministic work**: monthly uses Python scripts for parsing and aggregation; the agent handles interpretation and writing

## Conventions

- Conventional commits (`feat:`, `docs:`, `init:`)
- Bilingual: English for technical spec, Chinese for user-facing triggers and slide content
- Each SKILL.md is self-contained — includes enough context to understand its workflow without reading other files
