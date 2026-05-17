# Skills

Lode ships eight skills. The primary path is `capture -> query`: preserve one
session's decision evidence, then replay one decision with citations. The other
skills compound that record into session-start context, roadmap narrative, and
reports.

## Cold Start Interview

**Trigger:** `/lode:cold-start-interview`

First-run setup. Creates `~/.lode/config.yaml` with:
- Knowledge vault path (where Lode stores its data)
- Project identity and slug
- Report language (English, Chinese, or mixed)
- Weekly report mode and team context

Run this once. After that, all other skills read config automatically.

## Query

**Trigger:** `/lode:query`, `why did we choose this?`, `为什么当时这么选`

The primary value path: targeted decision replay. Reads
`{vault}/raw/decisions/` first, then falls back to raw weekly entries to answer
specific project-history questions:
- Why a path was chosen
- What alternatives were rejected or deferred
- Which open questions should be revisited
- What impact a decision had

The skill returns cited evidence from `source_entry_refs` and refuses to answer
when Lode has no supporting record. This keeps the system local-first and
evidence-bound rather than turning it into a generic memory guesser.

## Capture

**Trigger:** `/lode:capture`, `收工`, `done`, `今天到这`

Adaptive-depth session recap. Classifies your session as one of five archetypes:
- **Decision** — design choices, tradeoffs, rejected paths
- **Build** — features implemented, contracts changed
- **Investigation** — explorations, findings, dead ends
- **Repair** — bugs fixed, root causes, mitigations
- **Maintenance** — refactors, upgrades, cleanup

Writes report-worthy signals (decisions, risks, contracts, impact) rather than process logs. Also generates lightweight sync suggestions for architecture docs, plans, and README files.

Zero-config mode: outputs structured Markdown directly in the conversation without writing to any vault.

## Recall

**Trigger:** `/lode:recall`, `开工`, `session start`, `继续上次`

Session-start context recall for projects with history. Reads recent raw
entries, decision indexes, and artifact indexes from your knowledge vault to
surface:
- Recent decisions and their rationale
- Open risks and unresolved questions
- Abandoned alternatives worth remembering
- Stale intent artifacts that may need attention

Works without a vault — falls back to conversation-only context.

## Daily

**Trigger:** `/lode:daily`, `更新日报`, `日报`, `daily note`

Updates Obsidian daily notes from raw entries and git history. Aggregates what happened across sessions into a single day view.

## Weekly

**Trigger:** `/lode:weekly`, `周报`, `weekly PPT`

Builds a weekly outline from raw change entries. Uses raw entries as the primary semantic source; git logs are fallback and coverage evidence only. Includes a conditional "hard stuff" section when evidence exists.

## Monthly

**Trigger:** `/lode:monthly`, `月度回顾`, `月报`, `monthly review`

Generates a monthly review from daily notes. Extracts signals, produces a structured skeleton, and proposes candidate rules from repeated evidence. Python scripts handle parsing and aggregation for determinism.

## Roadmap

**Trigger:** `/lode:roadmap`, `决策路线图`, `decision roadmap`

Generates a narrative decision roadmap from accumulated raw entries. Tracks:
- Decisions made and their context
- Accumulating risks that haven't been resolved
- Recurring open questions
- How thinking evolved over time

The roadmap is not a feature list — it tells the story of what happened and why.
