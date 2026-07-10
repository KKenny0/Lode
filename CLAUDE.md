# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Tracework** is a cross-runtime plugin and skill monorepo for evidence-backed work reports and memory from agent sessions. It ships a Claude Code plugin, a Codex plugin, and eight Markdown-first skills for capture, recall, query, workplace daily reports, weekly briefs, monthly reviews, decision roadmaps, and cold-start setup.

Tracework is reporting-first and decision-replay-backed. Daily, weekly, and monthly are the high-frequency product surfaces; capture is the evidence multiplier; query, recall, and roadmap are lower-frequency trust and recovery surfaces.

The strongest use case is coding work: architecture choices, repairs, schemas,
prompts, tests, and delivery risk. The product boundary is wider than coding
only: any agent session with goals, choices, evidence, outcomes, risks, or
next-step value can be recorded. Tracework is not a meeting workflow, approval
system, generic office suite, performance packaging tool, or employee-monitoring
surface.

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
  reporting_group: work
  default_reporting_group: work
```

Resolution order:

1. Project `.tracework/config.yaml`
2. `~/.tracework/config.yaml`

## Repository Structure

```text
references/
  tracework-storage-convention.md
  reporting-narrative-contract.md
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
| capture | Dynamically routed lite/standard/deep session recap plus artifact context and sync suggestions | `/tracework:capture`, "收工", "done", "今天到这" |
| recall | Session-start recall from raw entries and artifact index | `/tracework:recall`, "开工", "session start", "继续上次" |
| query | Targeted decision replay evidence pack | `/tracework:query`, "why did we choose this?", "为什么当时这么选" |
| daily | Scoped daily management closure from raw entries, with git fallback | `/tracework:daily`, "更新日报", "日报", "daily note" |
| weekly | Scoped weekly management brief; slides only when requested | `/tracework:weekly`, "周报", "weekly PPT" |
| monthly | Raw-first scoped phase review with Daily/Weekly context | `/tracework:monthly`, "月度回顾", "月报", "monthly review" |
| roadmap | Narrative decision roadmap with accumulating risks and recurring questions | `/tracework:roadmap`, "决策路线图", "decision roadmap" |

## Key Design Decisions

- **Self-contained skills**: each skill has local copies of needed references, so installed skills do not read `../` paths outside their own directory.
- **Public namespace migration**: user-facing names, plugin metadata, docs, site, and command examples use Tracework and `/tracework:*`.
- **Tracework storage namespace**: `.tracework` paths and `tracework.*` schema strings are canonical. Legacy fallback paths and schema strings are not supported.
- **Codex plugin bundle sync**: `.agents/plugins/marketplace.json` points at `plugins/tracework`; after editing `.codex-plugin/`, `skills/`, or `assets/`, run `npm --prefix cli run copy-skills` and `npm --prefix cli run check-skills`.
- **Plugin release versioning**: user-visible plugin updates must bump the same semver in `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`, and `.claude-plugin/marketplace.json`; then run `npm --prefix cli run copy-skills`, `npm --prefix cli run check-skills`, `npm --prefix cli run test`, `claude plugin validate .claude-plugin/plugin.json`, and `claude plugin validate .claude-plugin/marketplace.json`. If the installed Claude CLI exposes `plugin tag`, also run its dry-run from a clean worktree; when unavailable, record the tool gap and require isolated Codex and Claude install smokes instead.
- **Convention sync**: canonical storage rules live in `references/tracework-storage-convention.md`; after editing it, run `scripts/sync-convention.sh`.
- **Reporting contract sync**: canonical narrative rules live in `references/reporting-narrative-contract.md`; after editing it, run `scripts/sync-reporting-contract.sh`.
- **Decision replay helper sync**: canonical implementation lives at `references/decision_replay.py`; after editing it, run `scripts/sync-decision-replay.sh`.
- **Raw-first reporting**: weekly and monthly reports use raw entries as the semantic source; git logs are fallback and coverage evidence only.
- **Reporting-first usage**: daily, weekly, and monthly are the high-frequency product surfaces; capture improves confidence; query, recall, and roadmap remain lower-frequency trust/recovery views.
- **Scope before selection**: reports partition `reporting_group` before ranking headlines. Work output must contain no personal material; `all` keeps groups separate.
- **Dynamic capture depth**: capture chooses `lite`, `standard`, or `deep` from the session signal by default; explicit depth wording only overrides the route.
- **No legacy CLI install surface**: the CLI is for maintenance diagnostics and packaging checks, not user-facing installation.

## Conventions

- Conventional commits (`feat:`, `docs:`, `chore:`)
- Bilingual docs are acceptable: English for technical specs, Chinese for user-facing triggers and report content
- Keep public docs current-only. Do not keep stale historical positioning docs in public navigation or tracked docs.
- Keep the repository clean: no generated caches, dead files, stale examples, or local planning artifacts in the tracked tree.
