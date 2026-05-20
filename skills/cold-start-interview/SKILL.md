---
name: cold-start-interview
description: >
  Set up Lode for first use. Use this skill when the user runs
  "/lode:cold-start-interview", asks to configure Lode, or needs help creating
  a Lode config for persistent memory across sessions. Triggers on phrases like
  "configure Lode", "set up Lode", "初始化 Lode", "配置 Lode".
---

# Lode Cold-Start Interview

Configure Lode's two-layer config: global user preferences and per-project identity.

Lode separates concerns between **what's shared** (knowledge vault path, reporting
preferences) and **what's project-specific** (project name, project slug). The global
config lives at `~/.lode/config.yaml`; project identity lives at
`{project-root}/.lode/config.yaml`. The interview detects context and writes to the
appropriate target.

## Goal

Create or update valid Lode configuration:

**Global config** (`~/.lode/config.yaml`):
- `knowledge_vault`
- `profile.report_language`
- `profile.weekly_mode`
- `profile.team_context`
- `artifact_index.enabled`
- `auto_capture.enabled`

**Project config** (`{project-root}/.lode/config.yaml`, when CWD is a project repo):
- `project_slug`
- `profile.project_name`

Then register the project in `{vault}/raw/projects.json`.

If an existing config is present, preserve fields that are unrelated to this
interview, including `daily_note`, `weekly_outline`, `monthly_review`, and any
custom keys.

## Step 0: Scope Detection — MUST Complete Before Step 1

**CRITICAL**: Step 0 is a mandatory gate. You MUST read both config files (if they exist) and check completeness BEFORE asking any questions. Do not skip to Step 1 until Step 0 is done.

Check the current working directory:

1. Is there a `.git/` directory or `.lode/` directory in CWD or its parents?
   - **Yes**: This is a project setup. The interview will write project identity
     to `{project-root}/.lode/config.yaml` and user preferences to
     `~/.lode/config.yaml`.
   - **No**: This is a global-preferences-only setup. Write everything to
     `~/.lode/config.yaml` (backward-compatible single-project behavior).

2. Read `~/.lode/config.yaml` if it exists.
   - **Global config is complete** when ALL of these are present and non-empty:
     `knowledge_vault`, `profile.report_language`, `profile.weekly_mode`,
     `profile.team_context`, `artifact_index.enabled`, `auto_capture.enabled`.
   - **Partial**: Some fields present. Interview only asks for the missing fields.
   - **Missing**: No file exists. Full interview needed.

3. If CWD is a project (has `.git/` or `.lode/`), read `{project-root}/.lode/config.yaml` if it exists.
   - **Project config is complete** when BOTH `project_slug` and `profile.project_name` are present and non-empty.
   - **Missing**: Project identity not yet set. Interview only asks for these two fields (project_name, project_slug) — do NOT re-ask global questions.

### Early-Exit Gate

**If global config is complete AND (CWD is not a project OR project config is also complete), STOP immediately.** Reply with a brief status summary listing both config paths and their contents. Do not ask any questions. The setup is done.

**If global config is complete but project config is missing (in a project), only ask project_name and project_slug.** Do not ask knowledge_vault, report_language, weekly_mode, team_context, auto_capture questions — they are already set.

**If global config is partial, only ask the specific fields that are missing.** Do not re-ask fields that already have values.

## Step 1: Interview

Ask for any missing values in one compact pass:

1. Knowledge vault path: directory where Lode stores raw JSON and human-readable
   reports. Expand `~` and accept absolute paths. If the path does not exist, ask
   before creating it. Target: **global config**.
2. Project name: human-readable name for reports. Target: **project config** (or
   global config if no project context).
3. Project slug: kebab-case identifier. Suggest a slug from the current repo
   directory or project name. Target: **project config** (or global config if no
   project context).
4. Report language: `zh`, `en`, or `mixed`. Target: **global config**.
5. Weekly mode: `tech` for engineering narrative or `report` for manager-facing
   status. Target: **global config**.
6. Team context: `solo`, `team`, or `mixed`. Target: **global config**.
7. Auto-capture: should `/lode:capture` run automatically at session end?
   Default: yes for configured vaults. Target: **global config**.

Prefer sensible defaults over long discussion:

```yaml
profile:
  report_language: mixed
  weekly_mode: tech
  team_context: solo
```

## Step 2: Write Config

### Global config

Write to `~/.lode/config.yaml`:

```yaml
knowledge_vault: /absolute/path/to/knowledge-vault

profile:
  report_language: mixed
  weekly_mode: tech
  team_context: solo

artifact_index:
  enabled: true

auto_capture:
  enabled: true
```

If an existing global config contains `project_slug` or `profile.project_name`,
preserve them — do not remove fields that single-project users may depend on.

### Project config (when in a project)

Write to `{project-root}/.lode/config.yaml`:

```yaml
project_slug: my-project

profile:
  project_name: My Project
```

If the user wants to override a global preference for this project (e.g. different
`report_language`), include that override in the project config.

### Write rules

- Keep YAML machine-readable and avoid prose comments in the written file.
- Normalize `project_slug` to lowercase kebab-case.
- Do not overwrite an existing `knowledge_vault` unless the user confirms.
- Preserve unknown top-level keys and nested sections from existing configs.
- Never store secrets, credentials, or remote sync tokens.

## Step 3: Register Project

After writing config, register the project in the knowledge vault:

```bash
python <this-skill>/scripts/lode_raw.py register-project --cwd "$PWD"
```

If the helper is unavailable, manually write or update
`{vault}/raw/projects.json` following this shape:

```json
[
  {
    "name": "My Project",
    "slug": "my-project",
    "path": "/absolute/path/to/project",
    "priority": "core"
  }
]
```

Use path-based dedup: if an entry with a matching `path` already exists, update it
in place rather than appending a duplicate.

## After Setup

Report:
1. The global config path and what was written there
2. The project config path (if created) and what was written there
3. The resolved vault path
4. Confirmation that the project was registered in `projects.json`

Then recommend the Tier 1 habit loop:

> Lode 已配置完成。从今天开始只需两个动作：
> - 每次结束工作说 **"收工"** 或运行 `/lode:capture`
> - 下次开始工作运行 `/lode:recall`
>
> 坚持 1-2 周积累数据后，日报 (`/lode:daily`)、周报 (`/lode:weekly`) 和决策查询 (`/lode:query`) 会自动变得更丰富。

Also mention:
- Another project to set up: switch to that directory and run `/lode:cold-start-interview` again

Keep the final response concise.
