# Weekly PPT Shared Convention (v2.0)

This file defines the shared data schema and storage convention used by all skills in this monorepo. When generating change entries, follow this spec exactly so downstream consumers can reliably read them.

## Configuration

Lode uses a YAML configuration file to determine the knowledge vault location. The vault is a git repo (typically an Obsidian vault) that stores both raw intermediate data and human-readable outputs.

**Config file locations** (higher priority wins):

| Priority | Location | Scope |
|----------|----------|-------|
| 1 | `{project-root}/.lode/config.yaml` | Project-level override |
| 2 | `~/.lode/config.yaml` | Global default |
| 3 | `$WEEKLY_PPT_PATH` env var | Legacy fallback |
| 4 | `~/.weekly-ppt/` | Legacy fallback default |

**Config file format** (see `references/lode-config-template.yaml` for full template):

```yaml
knowledge_vault: /path/to/your/knowledge-vault
# project_slug: my-project  # optional, defaults to git repo directory name
```

All subsequent path references use `{vault}` as shorthand for the resolved knowledge vault path. If a skill's primary output depends on `{vault}` and no path can be resolved, ask the user to configure `knowledge_vault`. If writing a weekly change entry is only a side effect, skip that write gracefully when `{vault}` cannot be resolved.

## Storage Location

Data is organized in two layers following the raw/wiki pattern:

```
{vault}/
  raw/                            # Raw layer (immutable intermediate data)
    projects.json                 # Optional project registry
    weeks/
      2026-W15/
        my-project.json           # Array of change entries
      2026-W16/
        my-project.json
    months/
      2026-04/
        signals.json              # Monthly extracted signals
        skeleton.json             # Monthly summary skeleton
  Daily Note.md                   # Wiki layer (daily notes)
  Work Diary/                     # Wiki layer (monthly archives + summaries)
```

## ISO Week

Use `date +%Y-W%V` to calculate the current week string. Format: `YYYY-WNN` (zero-padded).

If the `weeks/{week}/` directory does not exist, create it before writing.

## Project Slug

Resolution order:
1. Check `.lode/config.yaml` for explicit `project_slug` field
2. Look up the current project path in `{vault}/raw/projects.json` → use its `slug`
3. If not found or the file contains invalid JSON, derive from the project directory name: lowercase, replace spaces/underscores with hyphens

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

Each `{vault}/raw/weeks/{week}/{slug}.json` file contains a **JSON array** of entries:

```json
[
  {
    "timestamp": "2026-04-11T14:30:00+08:00",
    "type": "feature",
    "summary": "Built scene composition system with auto-layout and overlap resolution",
    "context": "Replaced manual positioning with constraint solver. Resolves 3 bad cases from v2.3 batch eval.",
    "related_docs": ["/Users/dev/projects/my-project/docs/stage-composition-implementation.md"],
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
| `related_docs` | string[] | No | Absolute paths to relevant documentation files |
| `source` | enum | Yes | `session-recap` \| `arch-doc` |

### Optional Future Fields

Consumers must tolerate these fields being absent. Producers may add them later when the signal is available without extra analysis:

| Field | Type | Description |
|-------|------|-------------|
| `project_area` | string | Product/module area affected by the change |
| `work_stream` | string | Suggested weekly-report narrative grouping |
| `impact` | string | User, system, or engineering impact in report-friendly language |
| `status` | enum | `done` \| `ongoing` \| `risk` \| `decision` |
| `evidence_refs` | string[] | Commit SHAs, eval IDs, issue IDs, or doc paths supporting the entry |

### Writing `summary`

One sentence that answers: **what was done + how**. Use active voice, specific technical nouns, avoid generic verbs.

Pattern: `[Action verb] [specific output/change] [with/using/replacing key approach]`

- Good: "Added retry-with-repair loop to narrative validation, replacing single-pass validation"
- Good: "Extracted character extraction into a standalone stage with fan-out parallelism"
- Avoid: "Updated documentation" / "Made improvements" / "Fixed issues"

### Writing `context`

1-2 sentences that answer: **why this was needed + what impact it has**. Capture the design intent and reasoning that git commits rarely convey.

Pattern: `[Trigger/motivation]. [Approach chosen] → [expected impact or what it resolves].`

- Good: "Single-pass validation missed 3 recurring failure patterns from v2.3 eval. Repair loop now catches and corrects these automatically, reducing manual review by ~40%."
- Good: "Character extraction was tightly coupled with parsing, blocking independent iteration. New isolation allows tuning extraction without risking parse stability."
- Avoid: Repeating the summary / describing implementation details / vague statements like "improved quality"

### Type Definitions

- **feature** — New capability was built
- **fix** — Bug was resolved or reliability improved
- **refactor** — Code restructured without behavior change
- **decision** — Architectural or design decision (even if not yet implemented)
- **risk** — Issue identified that could affect future work

## Write Behavior

- **Append** new entries to the existing array (read → append → write)
- Do not deduplicate or overwrite — the consumer handles merging
- **Side-effect failure**: if the project slug cannot be determined or the write fails, skip the change-entry write gracefully. The primary deliverable of each skill is never the change entry — it is always a side effect.
- **Concurrent writes**: two sessions writing to the same `{slug}.json` simultaneously may lose data. This is acceptable for the intended use case (single developer, single machine). If concurrent access becomes a concern, the consumer should implement merge logic.

## Consumers

Downstream tools read these files to get high-quality development context:

- **lode-weekly-outline** — reads change entries as the primary semantic source for weekly report generation. Git logs are only fallback and coverage evidence when raw entries are missing or incomplete.
- **lode-git-daily-note** — reads change entries as primary data source, with git log as fallback
- **lode-monthly-review** — reads daily notes (produced by lode-git-daily-note) for monthly summaries
- Any future reporting or review tool that needs structured change history

## Weekly Report Consumption

For weekly reporting, raw entries should carry the meaning of the work:

- `summary` should describe the engineering change at report granularity.
- `context` should explain why it mattered and what changed as a result.
- `source: arch-doc` entries should summarize the architectural change or decision, not merely state that a document was written.
- `related_docs` are evidence and deep context; consumers should read them only when the raw entry is not enough to explain the technical approach.
- Git commits are useful for coverage checks, but they should not override explicit raw-entry intent.
