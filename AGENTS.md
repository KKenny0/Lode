# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What This Is

**Tracework** is a cross-runtime plugin and skill monorepo for evidence-backed work memory from agent sessions. It ships a Codex plugin, a Claude Code plugin, and eight Markdown-first skills for capture, recall, query, daily notes, weekly briefs, monthly reviews, decision roadmaps, and cold-start setup.

Tracework is not a generic memory layer. Capture/retrieval is the input; recall, decision query, brief/review, and roadmap surfaces are the product.

The strongest use case is coding work: architecture choices, repairs, schemas, prompts, tests, and delivery risk. The product boundary is wider than coding only: any agent session with goals, choices, evidence, outcomes, risks, or next-step value can be recorded. Tracework is not a meeting workflow, approval system, generic office suite, performance packaging tool, or employee-monitoring surface.

Public product and command namespace:

- Product name: `Tracework`
- Plugin namespace: `tracework`
- Commands: `/tracework:*`
- Native install target: `tracework@tracework`
- Raw helper filename: `tracework_raw.py`

Storage namespace:

- Config lives at `~/.tracework/config.yaml` and `{project}/.tracework/config.yaml`
- JSON schema strings use `tracework.*`, such as `tracework.decision_replay.v1`
- No legacy storage fallback is supported

## Configuration

All skills share a unified configuration system:

```yaml
# ~/.tracework/config.yaml (global) or {project}/.tracework/config.yaml (project-level)
knowledge_vault: /path/to/your/knowledge-vault
project_slug: my-project

profile:
  project_name: My Project
  report_language: mixed
  weekly_mode: tech
  team_context: solo
```

Resolution order:

1. Project `.tracework/config.yaml`
2. `~/.tracework/config.yaml`

## Repository Structure

```text
references/
  tracework-storage-convention.md             # Shared schema and storage rules
  decision_replay.py                    # Canonical decision replay graph/query helper
  tracework-config-template.yaml             # Config template
.codex-plugin/plugin.json               # Codex plugin manifest
.claude-plugin/plugin.json              # Claude Code plugin manifest
.claude-plugin/marketplace.json         # Claude-style marketplace metadata
.agents/plugins/marketplace.json        # Codex marketplace metadata
plugins/tracework/                      # Generated Codex installable plugin bundle
scripts/sync-convention.sh              # Sync convention to skill-local references
scripts/sync-decision-replay.sh         # Sync decision replay helper to skill-local copies
benchmarks/                             # Public benchmark protocols and fixtures
cli/                                    # Maintenance CLI and packaging checks
site/                                   # VitePress documentation site
skills/
  cold-start-interview/
  capture/
  recall/
  query/
  roadmap/
  daily/
  weekly/
  monthly/
```

Ignored local artifacts:

```text
skills/*/evals/
skills/*-workspace/
cli/dist/
cli/skills/
cli/assets/
site/.vitepress/dist/
```

## Skills Overview

| Skill | Purpose | Triggers |
|---|---|---|
| cold-start-interview | First-run setup for `~/.tracework/config.yaml` | `/tracework:cold-start-interview`, "configure Tracework" |
| capture | Adaptive-depth session recap plus artifact context and sync suggestions | `/tracework:capture`, "收工", "done", "今天到这" |
| recall | Session-start recall from raw entries and artifact index | `/tracework:recall`, "开工", "session start", "继续上次" |
| query | Targeted decision replay evidence pack | `/tracework:query`, "why did we choose this?", "为什么当时这么选" |
| daily | Obsidian daily notes from raw entries and git history | `/tracework:daily`, "更新日报", "日报", "daily note" |
| weekly | Raw-first weekly brief outline | `/tracework:weekly`, "周报", "weekly PPT" |
| monthly | Monthly review with candidate rules from repeated evidence | `/tracework:monthly`, "月度回顾", "月报", "monthly review" |
| roadmap | Narrative decision roadmap with accumulating risks and recurring questions | `/tracework:roadmap`, "决策路线图", "decision roadmap" |

## Reusable Data Map

Tracework is not a strict pipeline. Skills are independently triggered, but they reuse artifacts when available.

```text
首次配置:
  cold-start-interview -> ~/.tracework/config.yaml + {project}/.tracework/config.yaml

开发过程中:
  recall <- {vault}/raw/weeks/ + {vault}/raw/artifacts/ + {vault}/raw/decisions/
  query  <- {vault}/raw/decisions/ + {vault}/raw/weeks/
  capture -> {vault}/raw/weeks/{week}/{slug}.json
          -> {vault}/raw/artifacts/{slug}.json when durable artifacts change
  roadmap <- raw entries + decision index + artifact index

每天:
  daily <- raw entries + git log -> {vault}/Daily Note.md

每周:
  weekly <- raw entries + fallback git coverage -> weekly outline

每月:
  monthly <- Daily Note.md + matching raw entries -> monthly review
```

## Storage Surfaces

- **Project repo**: code-adjacent artifacts that evolve with implementation, such as architecture docs, `DESIGN.md`, `PLAN.md`, `AGENTS.md`, prompt contracts, and schema contracts
- **Vault raw layer**: machine-readable memory and indexes, including weekly raw entries, decision indexes, artifact indexes, and monthly signals
- **Vault wiki layer**: human-readable synthesis outputs such as Daily Note, weekly outline, monthly review, and decision roadmap
- **Conversation fallback**: zero-config immediate value when durable storage is unavailable

## Key Design Decisions

- **Self-contained skills**: each skill has local copies of needed references, so installed skills do not read `../` paths outside their own directory.
- **Public namespace migration**: user-facing names, plugin metadata, docs, site, and command examples use Tracework and `/tracework:*`.
- **Tracework storage namespace**: `.tracework` paths and `tracework.*` schema strings are canonical. Legacy fallback paths and schema strings are not supported.
- **Codex plugin bundle sync**: `.agents/plugins/marketplace.json` points at `plugins/tracework`; after editing `.codex-plugin/`, `skills/`, or `assets/`, run `npm --prefix cli run copy-skills` and `npm --prefix cli run check-skills`.
- **Plugin release versioning**: user-visible plugin updates must bump the same semver in `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`, and `.claude-plugin/marketplace.json`; then run `npm --prefix cli run copy-skills`, `npm --prefix cli run check-skills`, `npm --prefix cli run test`, `claude plugin validate .claude-plugin/plugin.json`, `claude plugin validate .claude-plugin/marketplace.json`, and `claude plugin tag --dry-run .` from a clean worktree before tagging.
- **Convention sync**: canonical storage rules live in `references/tracework-storage-convention.md`; after editing it, run `scripts/sync-convention.sh`.
- **Decision replay helper sync**: canonical implementation lives at `references/decision_replay.py`; after editing it, run `scripts/sync-decision-replay.sh`.
- **Raw-first reporting**: weekly and monthly reports use raw entries as the semantic source; git logs are fallback and coverage evidence only.
- **Progressive-closure reporting**: reports may derive local `O# -> W# -> D# -> E#` chains from raw truth, but activity metrics and provenance alone are not outcomes.
- **Local evals, public benchmarks**: private evals and workspaces stay ignored; public benchmark guidance lives under `benchmarks/`.
- **No legacy CLI install surface**: the CLI is for maintenance diagnostics and packaging checks, not user-facing installation. Public install docs should use native plugin marketplace commands.

## Conventions

- Conventional commits (`feat:`, `docs:`, `chore:`)
- Bilingual docs are acceptable: English for technical specs, Chinese for user-facing triggers and report content
- Keep public docs current-only. Do not keep stale historical positioning docs in public navigation or tracked docs.
- Keep the repository clean: no generated caches, dead files, stale examples, or local planning artifacts in the tracked tree.
