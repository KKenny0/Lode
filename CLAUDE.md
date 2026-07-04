# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Tracework** is a cross-runtime plugin and skill monorepo for evidence-backed work memory from agent sessions. It ships a Claude Code plugin, a Codex plugin, and eight Markdown-first skills for capture, recall, query, daily notes, weekly briefs, monthly reviews, decision roadmaps, and cold-start setup.

Tracework is not a generic memory layer. Capture/retrieval is the input; recall, decision query, brief/review, and roadmap surfaces are the product.

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
  tracework-storage-convention.md
  decision_replay.py
  tracework-config-template.yaml
.codex-plugin/plugin.json
.claude-plugin/plugin.json
.claude-plugin/marketplace.json
.agents/plugins/marketplace.json
plugins/tracework/
benchmarks/
cli/
site/
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

## Key Design Decisions

- **Self-contained skills**: each skill has local copies of needed references, so installed skills do not read `../` paths outside their own directory.
- **Public namespace migration**: user-facing names, plugin metadata, docs, site, and command examples use Tracework and `/tracework:*`.
- **Tracework storage namespace**: `.tracework` paths and `tracework.*` schema strings are canonical. Legacy fallback paths and schema strings are not supported.
- **Codex plugin bundle sync**: `.agents/plugins/marketplace.json` points at `plugins/tracework`; after editing `.codex-plugin/`, `skills/`, or `assets/`, run `npm --prefix cli run copy-skills` and `npm --prefix cli run check-skills`.
- **Convention sync**: canonical storage rules live in `references/tracework-storage-convention.md`; after editing it, run `scripts/sync-convention.sh`.
- **Decision replay helper sync**: canonical implementation lives at `references/decision_replay.py`; after editing it, run `scripts/sync-decision-replay.sh`.
- **No legacy CLI install surface**: the CLI is for maintenance diagnostics and packaging checks, not user-facing installation.

## Conventions

- Conventional commits (`feat:`, `docs:`, `chore:`)
- Bilingual docs are acceptable: English for technical specs, Chinese for user-facing triggers and report content
- Keep public docs current-only. Do not keep stale historical positioning docs in public navigation or tracked docs.
- Keep the repository clean: no generated caches, dead files, stale examples, or local planning artifacts in the tracked tree.
