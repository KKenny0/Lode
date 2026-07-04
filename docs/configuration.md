# Configuration

[Back to README](../README.md)

Tracework reads configuration from `.tracework` files and writes records into
the knowledge vault you choose.

## Config Files

```yaml
# ~/.tracework/config.yaml or {project}/.tracework/config.yaml
knowledge_vault: /path/to/your/knowledge-vault
project_slug: my-project

profile:
  project_name: My Project
  report_language: mixed
  weekly_mode: tech
  team_context: solo
```

Resolution order:

1. `{project}/.tracework/config.yaml`
2. `~/.tracework/config.yaml`

Set `knowledge_vault` in one of those files. Tracework does not read legacy
environment or default-directory fallbacks.

## Fields

- `knowledge_vault`: required for quiet writes and cross-session reuse. The
  directory must already exist.
- `project_slug`: optional stable project id. If omitted, helpers infer it from
  the repository directory.
- `profile.project_name`: optional display name for briefs and reviews.
- `profile.report_language`: `zh`, `en`, or `mixed`.
- `profile.weekly_mode`: `tech` or `report`.
- `profile.team_context`: `solo`, `team`, or `mixed`.
- `artifact_index.enabled`: defaults to `true`; controls whether capture writes
  or updates `{vault}/raw/artifacts/{slug}.json`.
- `auto_capture.enabled`: preference flag for automatic capture. Host tools
  still need their own hook configuration.

## First Run

Run:

```text
/tracework:cold-start-interview
```

The skill writes the global and project config layers as needed. After that,
`/tracework:capture`, `/tracework:recall`, `/tracework:query`, and the brief or
review skills read the same storage convention.

## Doctor

The maintenance CLI can check config, vault access, and native plugin install
state:

```bash
tracework doctor
```

It does not install skills. Public installation should use the native plugin
marketplace path:

```bash
codex plugin marketplace add KKenny0/Tracework
codex plugin add tracework@tracework
```

## Auto-Capture Hook

`auto_capture.enabled: true` means Tracework should capture at session end when
the host supports hooks. For Claude Code, add a Stop hook that runs:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "/tracework:capture"
          }
        ]
      }
    ]
  }
}
```

Manual capture always remains valid:

```text
收工
/tracework:capture
/tracework:capture checkpoint
```
