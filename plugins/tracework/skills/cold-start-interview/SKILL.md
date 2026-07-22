---
name: cold-start-interview
description: >
  Configure Tracework's knowledge vault, project identity, and reporting group
  for first use. Use for "/tracework:cold-start-interview", "configure
  Tracework", "set up Tracework", "初始化 Tracework", or "配置 Tracework".
---

# Tracework Cold Start

Create the minimum configuration needed for scoped Daily, Weekly, Monthly, and
Capture. Ask only for information that cannot be inferred safely.

## Required Result

Global config:

- `knowledge_vault`
- optional `profile.default_reporting_group`

Project config when inside a project:

- `project_slug`
- `profile.project_name`
- `profile.reporting_group`

Then register the project in `{vault}/raw/projects.json`, including
`reporting_group`.

## Preflight

1. Detect the project root from `.git` or `.tracework`.
2. Read global and project configs when present.
3. Preserve all unknown and unrelated fields.
4. Stop early when the required fields above are complete.

Do not re-ask existing values. Do not require report language, weekly mode,
team context, artifact index, or session scanning during first setup.

## Interview

Ask for all missing required values in one compact pass:

1. Knowledge vault absolute path. Ask before creating a missing directory.
2. Human project name when in a project.
3. Project slug, with a kebab-case suggestion from the repo name.
4. Reporting group for the project. Recommend `work` or `personal`, but accept
   another non-empty stable group such as `open-source` or `consulting`.
5. When the user has multiple groups, ask which should be the default report
   scope. Recommend `work` for audience safety.

Reporting group is not cosmetic: it prevents personal projects from entering a
workplace report. Never infer `work` from a path or repo name.

## Write Config

Global minimum:

```yaml
knowledge_vault: /absolute/path/to/vault

profile:
  default_reporting_group: work
```

Project minimum:

```yaml
project_slug: my-project

profile:
  project_name: My Project
  reporting_group: work
```

Rules:

- Normalize project slug to lowercase kebab-case.
- Preserve existing custom keys and nested sections.
- Do not overwrite an existing vault path without confirmation.
- Do not store credentials or remote tokens.
- Missing optional preferences are valid. Consumers infer language, use
  management-brief Weekly by default, enable artifact indexing by default, and
  treat absent session scanning as disabled.

## Register Project

Run:

```bash
python <this-skill>/scripts/tracework_raw.py register-project \
  --cwd "$PWD" \
  --name "My Project" \
  --slug my-project \
  --reporting-group work
```

Registration is path-deduplicated. Update an existing matching path rather than
adding a duplicate.

## Optional Session Scan

After setup, mention Capture Day as an opt-in enhancement. Do not ask about it
during the required interview and do not modify host hooks without explicit
permission.

Explain:

- `session_scan.enabled: true` lets the bundled Stop hook index session metadata
  for later `/tracework:capture day` recovery.
- The index contains pointers and scope metadata, not transcript content.
- Codex still requires the user to review and trust the plugin hook; host or
  organization policy may disable it.
- Manual `收工` or `/tracework:capture` always works.

If the user explicitly opts in, preserve unrelated global config fields in
`~/.tracework/config.yaml` and set:

```yaml
session_scan:
  enabled: true
  retention_days: 30
```

Do not edit host hook settings. The plugin bundles the hook, and disabling the
preference makes it a no-op.

## Completion Report

Return:

- global and project config paths;
- resolved vault;
- project name, slug, and reporting group;
- default report scope;
- registry result;
- session-scan status only when configured.

State clearly that Tracework can already produce daily/weekly reports before
this setup; configuration unlocks durable multi-day storage, file writes, and
strict work/personal partition. Do not imply the user could not try reports
without cold-start.

Then suggest the primary loop:

> 现在可以跑 `/tracework:daily`、`/tracework:weekly` 或 `/tracework:monthly`
> 做工作收口；未配置前也能先在对话里试用。关键 session 结束时说“收工”，可以提升
> 后续报告和证据下钻质量。
