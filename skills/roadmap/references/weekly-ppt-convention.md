# Weekly PPT Shared Convention (v2.1)

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
project_slug: my-project  # optional, defaults to git repo directory name

profile:
  project_name: My Project
  report_language: mixed   # zh | en | mixed
  weekly_mode: tech        # tech | report
  team_context: solo       # solo | team | mixed

artifact_index:
  enabled: true
```

All subsequent path references use `{vault}` as shorthand for the resolved knowledge vault path. `profile.*` fields are optional preferences written by `/lode:cold-start-interview`; consumers should use them to choose language, report framing, and project labels when present, and fall back to local inference when absent. If a skill's primary output depends on `{vault}` and no path can be resolved, tell the user to run `/lode:cold-start-interview` or configure `knowledge_vault`. If writing a weekly change entry is only a side effect, skip that write gracefully when `{vault}` cannot be resolved.

## Storage Location

Lode uses four storage surfaces. Store the full artifact where it is maintained,
then store enough structured metadata for future skills to find and reuse it:

- **Project repo**: code-adjacent artifacts that evolve with implementation,
  such as `DESIGN.md`, `PLAN.md`, `AGENTS.md`, prompt contracts, schema
  contracts, migration notes, and architecture notes.
- **Vault raw layer**: machine-readable memory and indexes, such as weekly raw
  entries, artifact index entries, decision thread indexes, open question
  indexes, and monthly signals.
- **Vault wiki layer**: human-readable synthesis outputs, such as daily notes,
  weekly outlines, monthly reviews, and decision roadmaps.
- **Conversation fallback**: zero-config immediate value when no durable storage
  exists, such as Markdown session recap output.

The knowledge vault itself is organized in two layers following the raw/wiki
pattern:

```
{vault}/
  raw/                            # Raw layer (immutable intermediate data)
    projects.json                 # Optional project registry
    artifacts/
      my-project.json             # Array of durable artifact index entries
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
  Work Diary/                     # Wiki layer (human-readable work outputs)
    Weekly/
      2026-W15.md                 # Weekly Markdown PPT outline
      2026-W16.md
    Monthly/
      2026-04.md                  # Monthly archive
      2026-04.summary.md          # Monthly summary
```

Weekly outline consumers should write their primary human-readable output to
`{vault}/Work Diary/Weekly/{YYYY-WNN}.md` unless the user or config provides an
explicit output path.

## Artifact Index

Raw entries record chronological semantic work signals. Artifact index entries
record durable artifact metadata and recall navigation. Do not overload weekly
raw entries as a document catalog.

Each `{vault}/raw/artifacts/{slug}.json` file contains a JSON array of artifacts:

```json
[
  {
    "id": "storyboard-pipeline:design-doc:parse-stage:v1",
    "project_slug": "storyboard-pipeline",
    "artifact_type": "design-doc",
    "title": "Parse Stage Implementation",
    "path": "/Users/dev/projects/storyboard-pipeline/docs/2026-W18/lode-stage-parse-implementation-v1.md",
    "repo_relative_path": "docs/2026-W18/lode-stage-parse-implementation-v1.md",
    "created_at": "2026-05-08T10:00:00+08:00",
    "updated_at": "2026-05-08T10:00:00+08:00",
    "source": "capture",
    "topics": ["parse-stage", "validation", "repair-loop"],
    "decision_threads": ["schema-validation-boundary"],
    "open_questions": ["whether repair-loop ownership should move upstream"],
    "evidence_refs": ["doc:lode-stage-parse-implementation-v1"],
    "status": "active",
    "supersedes": [],
    "superseded_by": null
  }
]
```

### Artifact Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Stable unique id within the vault |
| `project_slug` | string | Yes | Same slug resolution as weekly raw entries |
| `artifact_type` | enum | Yes | `arch-doc` \| `design-doc` \| `plan-doc` \| `agents-rule` \| `prompt-contract` \| `schema-contract` \| `checklist` \| `roadmap` \| `review` \| `other` |
| `title` | string | Yes | Human-readable artifact title |
| `path` | string | Yes | Absolute path to the local artifact when available |
| `created_at` | ISO 8601 | Yes | First indexed time |
| `updated_at` | ISO 8601 | Yes | Last indexed time |
| `source` | string | Yes | Producing skill or workflow |
| `status` | enum | Yes | `active` \| `draft` \| `superseded` \| `obsolete` \| `missing` |
| `repo_relative_path` | string | No | Path relative to the project repo when the artifact lives inside the repo |
| `topics` | string[] | No | Stable recall tags, not prose summaries |
| `decision_threads` | string[] | No | Stable narrative threads used by roadmap and recall |
| `open_questions` | string[] | No | Questions preserved by the artifact |
| `risk_refs` | string[] | No | Risk ids or short risk labels |
| `evidence_refs` | string[] | No | Commit SHAs, eval ids, issue ids, or doc refs |
| `supersedes` | string[] | No | Artifact ids this artifact replaces |
| `superseded_by` | string or null | No | Artifact id that replaces this artifact |

When `scripts/lode_raw.py` supports artifact indexing, producers should write
the artifact object to a temporary JSON file and delegate validation and upsert
behavior to the helper:

```bash
python <skill-or-repo>/scripts/lode_raw.py upsert-artifact \
  --artifact /tmp/lode-artifact.json \
  --cwd "$PWD"
```

Consumers must tolerate missing artifact indexes. Artifact index metadata helps
find source documents; it must not be treated as a replacement for raw-entry
facts.

## ISO Week

Use `date +%Y-W%V` to calculate the current week string. Format: `YYYY-WNN` (zero-padded).

If the `raw/weeks/{week}/` or `Work Diary/Weekly/` directory does not exist,
create it before writing.

When a skill-local or repository helper script is available, prefer it over
hand-written date logic:

```bash
python <skill-or-repo>/scripts/lode_raw.py week --date 2026-04-26
```

## Project Slug

Resolution order:
1. Check `.lode/config.yaml` for explicit `project_slug` field
2. Look up the current project path in `{vault}/raw/projects.json` → use its `slug`
3. If not found or the file contains invalid JSON, derive from the project directory name: lowercase, replace spaces/underscores with hyphens

Helper command:

```bash
python <skill-or-repo>/scripts/lode_raw.py project-slug --cwd "$PWD"
```

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

This file is maintained by the `register-project` helper. The cold-start interview calls it automatically during setup. The `capture` skill may also update it as a best-effort side effect. Skills should work correctly whether or not it exists — when absent, the project slug is derived from config or directory name.

Helper command:

```bash
python <skill-or-repo>/scripts/lode_raw.py register-project --cwd "$PWD" [--name "My Project"] [--slug my-project] [--priority core]
```

## Change Entry Schema

Each `{vault}/raw/weeks/{week}/{slug}.json` file contains a **JSON array** of entries:

```json
[
  {
    "timestamp": "2026-04-11T14:30:00+08:00",
    "archetype": "build",
    "type": "feature",
    "summary": "Built scene composition system with auto-layout and overlap resolution",
    "context": "Replaced manual positioning with constraint solver. Resolves 3 bad cases from v2.3 batch eval.",
    "related_docs": ["/Users/dev/projects/my-project/docs/stage-composition-implementation.md"],
    "source": "session-recap",
    "status": "done",
    "motivation": "Manual positioning caused recurring panel overlap failures during export.",
    "impact": "Weekly outline can explain the shipped layout capability without re-reading implementation commits.",
    "evidence_refs": ["abc1234", "/Users/dev/projects/my-project/docs/stage-composition-implementation.md"],
    "artifact_context": [
      {
        "artifact_path": "/Users/dev/projects/my-project/DESIGN.md",
        "scope": "Scene composition layout contract and ownership.",
        "delta": "Recorded the auto-layout boundary and overlap-resolution responsibility.",
        "open_questions": ["Whether dense panels need a separate export fallback."],
        "source_of_truth": ["src/composition/layout.ts", "tests/composition-layout.test.ts"]
      }
    ]
  }
]
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | ISO 8601 | Yes | When the change was made or recorded |
| `archetype` | enum | Recommended for new entries | `decision` \| `build` \| `investigation` \| `repair` \| `maintenance`; describes the session shape |
| `type` | enum | Yes | `feature` \| `fix` \| `refactor` \| `decision` \| `risk` |
| `summary` | string | Yes | 1 sentence, engineering-level abstraction |
| `context` | string | Yes | 1-2 sentences explaining why and impact |
| `related_docs` | string[] | No | Absolute paths to relevant documentation files |
| `source` | enum | Yes | `session-recap` for new entries; `arch-doc` is legacy-only historical data |

### Recommended Optional Fields

Consumers must tolerate these fields being absent. Producers should add them when the signal is available without extra analysis:

| Field | Type | Description |
|-------|------|-------------|
| `project_area` | string | Product/module area affected by the change |
| `work_stream` | string | Suggested weekly-report narrative grouping |
| `impact` | string | User, system, or engineering impact in report-friendly language |
| `status` | enum | `done` \| `ongoing` \| `risk` \| `decision` |
| `evidence_refs` | string[] | Commit SHAs, eval IDs, issue IDs, or doc paths supporting the entry |
| `motivation` | string | Trigger reason and goal for the change — what problem was being solved |
| `exploration_paths` | string[] | Approaches tried during the session and their outcomes |
| `abandoned_alternatives` | string[] | Approaches explicitly rejected and why |
| `open_questions` | string[] | Unresolved questions at session end; entry points for next session |
| `root_cause` | string | Repair archetype root cause; 1-2 sentences |
| `artifact_context` | object[] | Durable artifact scope/delta/source-of-truth blocks embedded in the raw entry |
| `sync_suggestions` | string[] | Presence-based hints that repo-local intent artifacts may need review |

### `type` vs `archetype`

`archetype` describes the shape of the session. `type` describes the reporting
category of the entry. They are independent axes:

- A `build` archetype normally produces `type: "feature"`.
- A `repair` archetype normally produces `type: "fix"`.
- A `decision` archetype normally produces `type: "decision"`, but can produce
  `type: "feature"` when the chosen approach was implemented in the same
  session.

New `session-recap` entries should include `archetype`. Historical entries
without it are valid and must be treated as legacy raw signals.

### Archetype Expectations

The adaptive-depth helper logs warnings for missing archetype fields; it does
not reject the entry. Zero-config Markdown output follows the same best-effort
rule.

| Archetype | Expected fields when known |
|---|---|
| `decision` | `motivation`, `exploration_paths`; `abandoned_alternatives` when discussed |
| `build` | `motivation`, `impact` |
| `investigation` | `exploration_paths`, `open_questions` |
| `repair` | `motivation`, `root_cause` |
| `maintenance` | Core fields only |

### `artifact_context`

Use `artifact_context` when a session created or materially changed a durable
artifact such as `DESIGN.md`, `PLAN.md`, `AGENTS.md`, README, prompt contracts,
schema contracts, migration notes, or architecture notes.

Each object has this shape:

```json
{
  "artifact_path": "/absolute/path/to/artifact",
  "scope": "What this artifact governs",
  "delta": "What changed in this session",
  "open_questions": ["unresolved artifact question"],
  "source_of_truth": ["path/to/implementation", "path/to/tests"]
}
```

`artifact_path`, `scope`, `delta`, and `source_of_truth` are required when the
object is present. `artifact_path` must be absolute.

Recommended producer behavior:

- Add `status` whenever it can be inferred from the session: `done` for completed work, `ongoing` for partially completed work, `risk` for open risk entries, and `decision` for design decisions.
- Add `archetype` for new `session-recap` entries using the adaptive-depth
  classification rules from the skill.
- Add `impact` when the entry has a clear user, system, reporting, reliability, migration, or developer-workflow effect. This should be more report-ready than `context`, not a duplicate.
- Add `evidence_refs` for commit SHAs, issue IDs, eval IDs, or doc paths that are already known. Do not perform extra repository analysis only to populate this field.
- Add `project_area` or `work_stream` when the natural module or narrative grouping is obvious. Leave them absent rather than guessing.
- Add `motivation` when the trigger for the change is clear — the problem being solved, the constraint that forced the change, or the goal being pursued. This is the "why now" behind the change.
- Add `exploration_paths` when the session involved trying multiple approaches. Each entry should describe the approach and its outcome (e.g. "lazy loading → marginal gain on mobile first-screen").
- Add `abandoned_alternatives` when approaches were explicitly considered and rejected. Include the rejection reason — this is valuable for future roadmap decisions.
- Add `open_questions` when the session ends with unresolved decisions or unanswered questions. These serve as entry points for the next session.
- Add `sync_suggestions` when the entry mentions a decision, prompt/schema
  contract, orchestration rule, or intent artifact that may require follow-up in
  `DESIGN.md`, `PLAN.md`, `AGENTS.md`, README, architecture docs, prompt
  contracts, or schema contracts. This is lightweight flagging only; producers
  must not claim semantic diffing or automatic doc updates.

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

### Quality Levels

Use these levels when judging whether a raw entry is worth keeping:

| Level | Example | Problem / Value |
|-------|---------|-----------------|
| Bad | "Updated documentation" | Process log only; no durable work signal |
| OK | "Updated Parse Stage documentation" | Names the artifact, but not the engineering meaning |
| Good | "Clarified Parse Stage input validation and repair-loop responsibilities" | Captures the technical boundary |
| Excellent | "Separated Parse Stage input validation, repair-loop ownership, and downstream output contracts so future schema migrations can debug failures without re-reading implementation commits" | Captures change, boundary, why it matters, and future reuse value |

Prefer Good or Excellent entries. If an entry cannot rise above OK, skip it unless the user explicitly asked to preserve that process detail.

### Type Definitions

- **feature** — New capability was built
- **fix** — Bug was resolved or reliability improved
- **refactor** — Code restructured without behavior change
- **decision** — Architectural or design decision (even if not yet implemented)
- **risk** — Issue identified that could affect future work

## Lifecycle Signals

Lode does not mutate historical raw entries. When a later skill learns that an
open question, risk, or decision changed state, it should append a new raw entry
that states the lifecycle transition explicitly.

Supported lifecycle language:

```text
open_question: open -> answered -> obsolete -> promoted_to_decision
risk: identified -> mitigated -> accepted -> obsolete
decision: proposed -> chosen -> revised -> superseded
artifact: draft -> active -> superseded -> obsolete; active -> missing
```

Future consumers may derive current state by reading entries in timestamp order.
Producers must not pretend lifecycle state is fully managed if they only have a
new raw signal.

## Write Behavior

- **Append** new entries to the existing array (read → append → write)
- Do not deduplicate or overwrite — the consumer handles merging
- **Side-effect failure**: if the project slug cannot be determined or the write fails, skip the change-entry write gracefully. The primary deliverable of each skill is never the change entry — it is always a side effect.
- **Concurrent writes**: two sessions writing to the same `{slug}.json` simultaneously may lose data. This is acceptable for the intended use case (single developer, single machine). If concurrent access becomes a concern, the consumer should implement merge logic.

When `scripts/lode_raw.py` is available in the skill directory or repository,
producers should write the entry object or array to a temporary JSON file and
delegate validation and append behavior to the helper:

```bash
python <skill-or-repo>/scripts/lode_raw.py append-entry \
  --entry /tmp/lode-entry.json \
  --cwd "$PWD"
```

The helper accepts a single entry object or an array of entries. It validates
required fields, resolves `{vault}` and project slug, creates the target week
directory, appends to the existing project JSON array, and prints a JSON summary
containing `week`, `slug`, `path`, `entries_appended`, and `total_entries`.

## Consumers

Downstream tools read these files to get high-quality development context:

- **weekly** — reads change entries as the primary semantic source for weekly report generation. Git logs are only fallback and coverage evidence when raw entries are missing or incomplete.
- **daily** — reads change entries as primary data source, with git log as fallback
- **monthly** — reads daily notes (produced by daily) for monthly summaries
- **recall** — reads recent raw entries first and uses artifact index entries as optional source navigation
- **roadmap** — derives decision threads, accumulating risks, and
  recurring open questions from raw entries
- Any future reporting or review tool that needs structured change history

## Weekly Report Consumption

For weekly reporting, raw entries should carry the meaning of the work:

- `summary` should describe the engineering change at report granularity.
- `context` should explain why it mattered and what changed as a result.
- `archetype` should control treatment depth: decisions emphasize trade-offs,
  repairs emphasize root cause, investigations emphasize open questions, and
  builds emphasize impact.
- `artifact_context` is embedded technical evidence. Consumers should use its
  scope, delta, and source-of-truth fields before reading files from disk.
- `source: arch-doc` is legacy historical data. Treat it as high-confidence
  architecture evidence, but do not expect new entries from that source.
- `related_docs` are evidence and deep context; consumers should read them only
  when the raw entry is not enough to explain the technical approach.
- Artifact index entries are optional source navigation. Consumers may use them
  to find durable repo-local docs, but must not invent decision facts from
  artifact titles alone.
- Git commits are useful for coverage checks, but they should not override explicit raw-entry intent.

### Duplicate and Conflict Handling

Consumers should merge semantically similar signals rather than repeat them:

- Same project + same week + similar `summary` / `context` means the entries are candidates for one work stream.
- `session-recap` entries are intent-rich: they often preserve why the work happened and what trade-off was made in conversation.
- Legacy `arch-doc` entries are evidence-rich: they often preserve contract
  boundaries, source-of-truth paths, and architecture decisions.
- If a `session-recap` entry and a legacy `arch-doc` entry describe the same
  change, combine them into one work stream. Use the session entry for
  motivation and the legacy arch-doc entry for technical evidence.
- If a new `session-recap` entry includes `artifact_context`, treat it as
  equivalent signal strength to the older session-recap plus arch-doc pair.
- Fallback git commits fill coverage gaps only. They should not create a duplicate stream for work already explained by raw entries.
- If two entries conflict, preserve the conflict explicitly in the weekly outline or daily note instead of silently choosing the more positive version.

## Producer Guidance

Raw entries are weekly-report signals, not chronological diary items.

### For `session-recap`

Capture only signals that should survive into a weekly review:

- Capabilities shipped or meaningfully advanced
- Technical decisions and trade-offs
- Risks, blockers, regressions, and follow-up work
- Cross-module contracts, migrations, reliability improvements, or validation changes

Merge related implementation steps into one entry. A feature implemented through several commits, fixes, and follow-up tweaks should usually become one `feature` entry with context that mentions the important repair or trade-off. Skip process-only work such as formatting, file moves, import cleanup, generated files, and local setup unless it explains a larger report-worthy change.

### Legacy `arch-doc` Entries

Historical raw data may still contain `source: "arch-doc"`. Consumers must keep
reading those entries as architecture evidence. New producers must not write
`source: "arch-doc"`; adaptive-depth `session-recap` entries with
`artifact_context` replace that signal path.
