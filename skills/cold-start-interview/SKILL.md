---
name: cold-start-interview
description: >
  Set up Lode for first use. Use this skill when the user runs
  "/lode:cold-start-interview", asks to configure Lode, or needs help creating
  ~/.lode/config.yaml for persistent memory across sessions.
---

# Lode Cold-Start Interview

Configure Lode's canonical machine-readable profile at `~/.lode/config.yaml`.
This is a short setup flow, not a generic onboarding document. Collect only the
answers needed to make `capture`, `recall`, `daily`, `weekly`, `monthly`, and
`roadmap` behave consistently.

## Goal

Create or update a valid global Lode config with:

- `knowledge_vault`
- `project_slug`
- `profile.project_name`
- `profile.report_language`
- `profile.weekly_mode`
- `profile.team_context`

If an existing config is present, preserve fields that are unrelated to this
interview, including `daily_note`, `weekly_outline`, `monthly_review`, and
`artifact_index`.

## Interview

Ask for any missing values in one compact pass:

1. Knowledge vault path: directory where Lode should store raw JSON and
   human-readable reports. Expand `~` and accept absolute paths. If the path
   does not exist, ask before creating it.
2. Project name: human-readable name for reports.
3. Project slug: kebab-case identifier. Suggest a slug from the current repo
   directory or project name.
4. Report language: `zh`, `en`, or `mixed`.
5. Weekly mode: `tech` for engineering narrative or `report` for
   manager-facing status.
6. Team context: `solo`, `team`, or `mixed`.

Prefer sensible defaults over long discussion:

```yaml
profile:
  report_language: mixed
  weekly_mode: tech
  team_context: solo
```

## Write Contract

Write the global config to `~/.lode/config.yaml`.

Use this shape:

```yaml
knowledge_vault: /absolute/path/to/knowledge-vault
project_slug: my-project

profile:
  project_name: My Project
  report_language: mixed
  weekly_mode: tech
  team_context: solo

artifact_index:
  enabled: true
```

Rules:

- Keep YAML machine-readable and avoid prose comments in the written file.
- Normalize `project_slug` to lowercase kebab-case.
- Do not overwrite an existing `knowledge_vault` unless the user confirms the
  replacement.
- Preserve unknown top-level keys and nested sections from an existing config.
- If the user wants project-specific settings, write the same supported fields
  to `{project-root}/.lode/config.yaml` instead of the global file, after
  confirming that choice.
- Never store secrets, credentials, or remote sync tokens in this config.

## After Setup

Report the saved config path and the resolved vault path. Then suggest the first
use based on context:

- End of a session: `/lode:capture`
- Start of a session: `/lode:recall`
- Weekly reporting: `/lode:weekly`

Keep the final response concise.
