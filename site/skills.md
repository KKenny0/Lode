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

The skill returns compact nodes with raw provenance (`source_entry_refs`) and
direct evidence links (`evidence_refs` or typed `source_refs`) kept distinct.
Provenance says where a claim was recorded; it does not by itself verify that
claim. Missing evidence is reported explicitly, and attached references remain
visible for inspection; Lode refuses to answer when it has no supporting record.

## Capture

**Trigger:** `/lode:capture`, `/lode:capture checkpoint`, `收工`, `done`, `今天到这`, `checkpoint`

Adaptive-depth session recap and checkpoint capture. Classifies your session as one of five archetypes:
- **Decision** — design choices, tradeoffs, rejected paths
- **Build** — features implemented, contracts changed
- **Investigation** — explorations, findings, dead ends
- **Repair** — bugs fixed, root causes, mitigations
- **Maintenance** — refactors, upgrades, cleanup

Writes report-worthy signals (`work_stream`, state change, status, impact,
decisions, risks, contracts, and evidence) rather than process logs. A Fruit
Check prevents commits, line counts, task counts, or vague completion claims
from becoming outcomes without an observable state change, impact, honest
status, and source path. Capture also generates lightweight sync suggestions
for architecture docs, plans, and README files.

Zero-config mode: outputs structured Markdown directly in the conversation without writing to any vault.

Vault mode writes quietly by default. Use checkpoint capture during long work to
save decisions, stage progress, risks, or next-step entry points without filling
the main conversation with a full recap.

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

Builds a weekly outline around at most three headline outcomes or progress
claims. Each report uses a local 3+1 chain: `O#` outcome/progress, `W#` work
stream, `D#` decision/tradeoff, and `E#` evidence audit. Raw entries remain the
primary semantic source; git logs are fallback and coverage evidence only.
Fallback-only work stays limited progress, never verified delivery.

## Monthly

**Trigger:** `/lode:monthly`, `月度回顾`, `月报`, `monthly review`

Generates an outcomes-first monthly review from daily notes, with optional raw
evidence enrichment and the same report-local `O#`/`W#`/`D#`/`E#` traceability
used by weekly reports. Task counts, active days, category totals, and code-size
figures stay in a coverage appendix and are never promoted into outcomes.
Risks, evidence gaps, next-month handoff, and candidate rules remain visible.
Python scripts handle parsing and aggregation for determinism.

## Roadmap

**Trigger:** `/lode:roadmap`, `决策路线图`, `decision roadmap`

Generates a narrative decision roadmap from accumulated raw entries. Tracks:
- Decisions made and their context
- Accumulating risks that haven't been resolved
- Recurring open questions
- How thinking evolved over time
- Confidence, evidence references, and evidence gaps for each decision point

The roadmap is not a feature list — it tells the story of what happened and why.
