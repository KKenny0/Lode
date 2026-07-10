# Configuration

[Back to README](../README.md)

Tracework needs only a vault path and project reporting identity for normal use.

## Minimum Config

Global `~/.tracework/config.yaml`:

```yaml
knowledge_vault: /path/to/your/knowledge-vault

profile:
  default_reporting_group: work
```

Project `{project}/.tracework/config.yaml`:

```yaml
project_slug: my-project

profile:
  project_name: My Project
  reporting_group: work
```

Resolution order:

1. `{project}/.tracework/config.yaml`
2. `~/.tracework/config.yaml`

## Reporting Groups

`profile.reporting_group` partitions projects before Daily, Weekly, or Monthly
selects headlines. Recommended values are `work` and `personal`; other stable
values such as `open-source` or `consulting` are valid.

`profile.default_reporting_group` selects the default report scope. `work` is
the safest default because personal project material must never leak into a
workplace report. Explicit `all` produces a private combined view with separate
group sections.

The project registry mirrors the group:

```json
{
  "name": "My Project",
  "slug": "my-project",
  "path": "/absolute/path/to/project",
  "reporting_group": "work"
}
```

### Upgrading from 0.2

Existing project configs and registry rows remain valid, but rows without a
reporting group are treated as `unassigned`. Scoped reports exclude them rather
than guessing that they are safe for work or personal output. Run
`/tracework:cold-start-interview` in each existing project or add
`profile.reporting_group` and the registry field manually.

## Optional Fields

```yaml
profile:
  report_language: mixed     # zh | en | mixed; otherwise inferred
  weekly_mode: report        # report | tech; brief remains the default format
  team_context: solo         # solo | team | mixed

artifact_index:
  enabled: true              # default true

auto_capture:
  enabled: false             # default false; host hook still required
```

Output paths remain optional under `daily_note`, `weekly_outline`, and
`monthly_review`.

## First Run

Run `/tracework:cold-start-interview`. It asks only for missing vault, project
identity, reporting group, and—when multiple groups exist—the default scope.

Auto-capture is an optional host-specific enhancement, not a required setup
step. `auto_capture.enabled: true` does not install or activate a hook by itself.
Manual `收工` and `/tracework:capture` always remain valid.

## Doctor

The maintenance CLI checks config, vault access, and plugin install state:

```bash
tracework doctor
```

Public installation uses the native marketplace commands documented in the
README. The CLI is not a legacy installer.
