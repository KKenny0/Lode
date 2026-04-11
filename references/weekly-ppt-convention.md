# Weekly PPT Shared Convention

This file defines the shared data schema and storage convention used by all skills in this monorepo. When generating change entries, follow this spec exactly so downstream consumers (like weekly PPT generators) can reliably read them.

## Storage Location

```
~/.weekly-ppt/
  projects.json          # Optional project registry
  weeks/
    2026-W15/
      my-project.json    # Array of change entries
    2026-W16/
      my-project.json
```

## ISO Week

Use `date +%Y-W%V` to calculate the current week string. Format: `YYYY-WNN` (zero-padded).

If the `weeks/{week}/` directory does not exist, create it before writing.

## Project Slug

Resolution order:
1. Look up the current project path in `~/.weekly-ppt/projects.json` → use its `slug`
2. If not found, derive from the project directory name: lowercase, replace spaces/underscores with hyphens

## projects.json (Optional)

```json
[
  {
    "name": "My Project",
    "slug": "my-project",
    "path": "/Users/dev/projects/my-project",
    "priority": "core"
  }
]
```

This file is created and maintained manually. Skills should work correctly whether or not it exists.

## Change Entry Schema

Each `~/.weekly-ppt/weeks/{week}/{slug}.json` file contains a **JSON array** of entries:

```json
[
  {
    "timestamp": "2026-04-11T14:30:00+08:00",
    "type": "feature",
    "summary": "Built scene composition system with auto-layout and overlap resolution",
    "context": "Replaced manual positioning with constraint solver. Resolves 3 bad cases from v2.3 batch eval.",
    "related_docs": ["docs/stage-composition-implementation.md"],
    "source": "session-recap"
  }
]
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | ISO 8601 | Yes | When the change was made or recorded |
| `type` | enum | Yes | `feature` \| `fix` \| `refactor` \| `decision` \| `risk` |
| `summary` | string | Yes | 1 sentence, engineering-level abstraction |
| `context` | string | Yes | 1-2 sentences explaining why and impact |
| `related_docs` | string[] | No | Paths to relevant documentation files |
| `source` | enum | Yes | `session-recap` \| `stage-doc` \| `pipeline-doc` |

### Type Definitions

- **feature** — New capability was built
- **fix** — Bug was resolved or reliability improved
- **refactor** — Code restructured without behavior change
- **decision** — Architectural or design decision (even if not yet implemented)
- **risk** — Issue identified that could affect future work

## Write Behavior

- **Append** new entries to the existing array (read → append → write)
- Do not deduplicate or overwrite — the consumer handles merging
- **Silent failure**: if the project slug cannot be determined or the write fails, skip silently. The primary deliverable of each skill is never the change entry — it is always a side effect.

## Consumers

Downstream tools read these files to get high-quality development context:

- **weekly-multi-project-ppt-lite** — reads change entries as primary context for weekly report generation (user provides the path when invoking the skill)
- Any future reporting or review tool that needs structured change history
