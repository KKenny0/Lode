---
name: roadmap
description: Generate a narrative decision roadmap from accumulated raw entries in the Lode knowledge vault. Use this skill for "/lode:roadmap", when the user says "决策路线图", "decision roadmap", "项目决策历史", "decision history", "看看项目做了哪些关键决策", or when they want to understand how project decisions evolved over time. Also use this skill when the user wants to revisit abandoned alternatives, reassess past decisions, or find forgotten viable approaches.
---

# Decision Roadmap Generator

Reads accumulated raw entries from the knowledge vault and synthesizes them into a narrative decision roadmap — a document organized by decision threads rather than time periods. Each thread tells the story of a key decision: what triggered it, what was explored, what was chosen, what was abandoned, whether those abandonments still make sense, and which decisions were revised or superseded.

Unlike weekly/monthly reports (organized by calendar period) or git history (organized by code changes), the decision roadmap is organized by **decision threads** — chains of related entries that reveal how a project's thinking evolved.

## Workflow

### Step 0: Resolve Config and Scope

Resolve the vault path using the standard Lode config resolution:

```bash
python <this-skill>/scripts/lode_raw.py resolve-config --cwd "$PWD"
```

If the helper is unavailable, resolve manually:
1. Check `.lode/config.yaml` in project root
2. Check `~/.lode/config.yaml`
3. Fall back to `$WEEKLY_PPT_PATH` or `~/.weekly-ppt/`

Determine scope from the user's request:

- **Default**: current project, all available weeks
- **Cross-project**: if the user explicitly asks, read all `{slug}.json` files
- **Date range**: if the user specifies (e.g. "from April", "last month"), filter accordingly

### Step 1: Gather Raw Entries

Read all matching raw entry files:

```
{vault}/raw/weeks/{YYYY-WNN}/{slug}.json
```

Each file contains a JSON array of entries. Load all files in scope, flatten into a single list, and sort by `timestamp` ascending.

If `{vault}/raw/artifacts/{slug}.json` exists, load it as optional source navigation. Artifact index entries can provide document links and topic hints, but they must not create decision facts by themselves.

If no entries are found, tell the user and stop — there is nothing to build a roadmap from.

### Step 2: Assess Decision Signal Strength

Every entry contributes to the roadmap, but with different signal strength. Classify each entry:

**Strong signal** — entries with explicit decision-recording fields:
- `motivation` is present and non-empty
- `exploration_paths` is present and non-empty
- `abandoned_alternatives` is present and non-empty
- `open_questions` is present and non-empty
- `type` is `decision`

These entries directly state why something was done, what was tried, and what was rejected. Use their decision fields verbatim.

**Medium signal** — entries without decision-recording fields, but with rich `summary` and `context` that reveal decision logic. These are the most common case in real vaults — many projects have entries written before the decision-recording schema was introduced. **Infer decision signals** from:

- `summary` describes what was built/changed → infer **motivation** from the "why" implicit in `context`
- `context` explains why it was needed → extract **trigger** and **outcome**
- `type` indicates the nature of the change → `feature` = new capability chosen, `fix` = problem-driven decision, `refactor` = structural decision, `risk` = identified concern
- `impact` field (when present) → forward-looking consequence, useful for reassessment

Inference examples:
- summary: "Added retry-with-repair loop to validation" + context: "Single-pass missed 3 failure patterns" → motivation: "Validation accuracy insufficient for production", exploration: ["single-pass → rejected (missed patterns)", "retry-with-repair → chosen"]
- summary: "Switched from batch to per-episode rolling execution" + context: "Batch processing failed on long scripts" → motivation: "Batch mode couldn't handle script length variance", abandoned: ["batch processing for all episodes at once"]

**Weak signal** — entries with terse summary/context that only describe what changed without explaining why. These establish what was built. Use them as timeline markers and background context within threads, but don't force them into decision points.

**Signal density check**: After classification, if fewer than 30% of entries are strong-signal, the roadmap will rely heavily on inference. Note this in the document header: "Decision context inferred from {N}/{M} entries (explicit decision fields present in {N} entries)."

### Step 2.5: Data Integrity Constraint

The roadmap must be derived from raw entries only. Do not:
- Supplement with git history, commit logs, or external documents
- Invent entries, timestamps, commit hashes, or technical details not present in the source data
- Fabricate exploration paths or abandoned alternatives that aren't supported by the entries

If the raw entries are insufficient to build a meaningful thread, say so rather than filling gaps with invented content. A thin roadmap built from real data is more valuable than a rich roadmap built from assumptions.

### Step 3: Identify Decision Threads

Group entries into **decision threads**. A thread connects entries that share a common theme, regardless of signal strength:

- Same technical area (same module, component, or architectural concern mentioned in `summary` or `context`)
- Exploration paths that reference each other's outcomes
- Motivations that build on each other (later entry resolves earlier entry's `open_questions`)
- Entries that describe successive iterations on the same problem

Strong-signal entries anchor each thread with explicit decision context. Medium-signal entries fill the timeline with inferred decision points. Weak-signal entries provide chronological context — what was built when, establishing the background against which decisions were made.

For each thread, extract:

| Element | Source |
|---------|--------|
| Title | Capture the core decision area in 3-6 words |
| Timeline | First to last entry timestamp |
| Trigger | Original `motivation` (strong signal) or inferred from earliest entry's `context` (medium signal) |
| Decision points | Key moments where a choice was made — from explicit exploration paths (strong) or from contrasting "what was" vs "what changed" (medium) |
| Exploration paths | From `exploration_paths` field (strong) or inferred from before/after in `summary`+`context` (medium) |
| Abandoned alternatives | From `abandoned_alternatives` field (strong) or from `context` describing rejected approaches (medium) |
| Current status | Resolved / Ongoing / Has open questions |

Also track lifecycle-like signals when entries explicitly support them:

- revised decisions
- superseded decisions
- abandoned alternatives worth revisiting
- stale open questions
- accumulating risks
- recurring open questions

Aim for 3-7 threads. If you find more, merge loosely related ones. If you find fewer than 3, the data may be too thin for a meaningful roadmap — say so and show what you can.

**Mark inferred content**: When decision points, exploration paths, or abandoned alternatives are inferred rather than directly sourced from entry fields, express them with hedging language ("likely motivated by", "appears the approach shifted from X to Y") rather than presenting inference as fact.

### Step 4: Write the Roadmap

Generate a Markdown document with this structure:

```markdown
# Decision Roadmap — {project name}

> Generated {date} from {N} entries spanning {first-week} to {last-week}.
> {N} decision threads identified.
> Decision context: {N_strong} entries with explicit decision fields, {N_medium} inferred from summary/context, {N_weak} as background.

---

## Decision Timeline

```mermaid
timeline
    title {project} Decision Timeline
    section {YYYY-WNN}
        {Thread title}
        : {Key decision or outcome}
    section {YYYY-WNN}
        {Thread title}
        : {Key decision or outcome}
```

---

## Thread: {Thread Title}

**Timeline**: {first-date} → {last-date}
**Status**: Resolved | Ongoing | Open questions remaining

{2-4 sentence narrative: what triggered this thread, what was explored, what was chosen, and why. Write as a story, not a bullet list.}

### Decision Points

| Date | Decision | Trigger | Outcome |
|------|----------|---------|---------|
| {date} | {what was decided} | {what prompted it} | {what happened as a result} |

### Exploration Paths

```mermaid
flowchart LR
    A[{Trigger}] --> B{Decision point}
    B -->|{Option 1}| C[{Outcome}]
    B -->|{Option 2}| D[{Outcome}]
    D -->|Rejected| E[{Reason}]
    C --> F[{Result}]
```

| Approach | Outcome | Why |
|----------|---------|-----|
| {approach} | {chosen / rejected / deferred} | {reason} |

### Abandoned Alternatives

- **{Alternative name}** — {why it was rejected}. {Any conditions under which it should be reconsidered.}

### Open Questions

- {Question from open_questions field, or inferred from the thread}

---

{Repeat for each thread}

---

## Reassessment of Abandoned Alternatives

For each abandoned alternative across all threads, reassess with current knowledge:

| Alternative | When | Original Reason | Still Valid? | Revisit Trigger |
|-------------|------|----------------|--------------|-----------------|
| {name} | {date} | {why abandoned} | Yes / Partially / No | {what would make it worth reconsidering} |

## Roadmap Correction

Use this section when current evidence suggests a prior abandonment, decision,
or open question should be revisited. Every correction must cite raw-entry
evidence and label inferred conclusions.

## Accumulating Risks

List risks that appear across multiple entries, remain unresolved, or become
more consequential over time. Each item must cite source timestamps and say
whether the risk is explicit or inferred.

| Risk | Evidence | Current Pressure | Suggested Review |
|------|----------|------------------|------------------|
| {risk} | {timestamps} | low / medium / high | {what to inspect next} |

## Recurring Open Questions

Group repeated or long-lived open questions by decision thread. Omit this section
if there are no supported recurring questions.

| Question | First Seen | Repeated In | Why It Matters |
|----------|------------|-------------|----------------|
| {question} | {timestamp} | {timestamps} | {planning or architecture impact} |

---

## Open Questions Inventory

All unresolved questions across threads, organized by urgency:

### Active (needs resolution soon)
- {question} — from {thread}, open since {date}

### Deferred (no immediate pressure)
- {question} — from {thread}, open since {date}

### Resolved since last roadmap
- ~~{question}~~ — resolved in {entry summary}
```

### Writing Guidelines

**Narrative tone**: Write as a colleague explaining the project's journey to someone who wasn't there. Second person is fine ("we explored", "we chose"). Be specific about technical details — vague abstractions defeat the purpose.

**Decision points table**: Each row should be a meaningful fork in the road, not every entry. Ask: "did this change the project's direction?" If yes, it's a decision point.

**Mermaid diagrams**:
- Use `timeline` for the overview — one entry per thread per week where something happened
- Use `flowchart LR` for exploration paths within a thread — show the branching and where each path led
- Keep diagrams readable: max 8-10 nodes per flowchart. If a thread has more decision points, split into sub-diagrams.
- For inferred exploration paths (not from explicit `exploration_paths` field), use dashed-style arrows or add "?" to the node label to distinguish inference from explicit data

**Reassessment**: This is the highest-value section. For each abandoned alternative, honestly evaluate whether the original rejection reason still holds. The goal is to surface forgotten viable approaches — that's the Phase 3 validation criterion. When alternatives were inferred rather than explicitly recorded, note this: "Inferred alternative — original rejection reason reconstructed from context."

**Roadmap correction**: Include revised/superseded decisions and alternatives
worth revisiting. Do not invent corrections from artifact titles alone; artifact
index is source navigation only.

**Accumulating risks and recurring questions**: This absorbs the useful part of
hard-stuff radar. Only include a risk or question when supported by raw entries.
Use "inferred" language when grouping is based on similarity rather than an
explicit repeated label.

**Inference transparency**: The roadmap mixes explicit decision data with inferred signals. Readers need to know which is which. Use these conventions:
- Decision points from explicit fields: stated as fact
- Decision points inferred from summary/context: "appears to have been motivated by..." or "likely driven by..."
- Exploration paths from explicit fields: stated as fact
- Exploration paths inferred from before/after: "the approach evolved from X to Y, suggesting..."

### Step 5: Output

Save the roadmap to the vault:

```
{vault}/Work Diary/Decision Roadmap.md
```

If scoped to a date range:

```
{vault}/Work Diary/Decision Roadmap - {start} to {end}.md
```

If the vault path cannot be resolved, output the roadmap directly to the conversation and tell the user to run `/lode:cold-start-interview` for persistent roadmap memory.

This skill does **not** write a raw entry side effect. The decision roadmap is a reading/synthesis activity — it consumes entries, it doesn't produce new decision signals. The roadmap itself is the deliverable.

## Configuration

Uses the unified Lode configuration system. Same resolution order as other skills:

| Priority | Location | Scope |
|----------|----------|-------|
| 1 | `.lode/config.yaml` (project root) | Project-level override |
| 2 | `~/.lode/config.yaml` | Global default |
| 3 | `$WEEKLY_PPT_PATH` env var | Legacy fallback |
| 4 | `~/.weekly-ppt/` | Legacy fallback default |

## Shared Storage Convention

The skill reads raw entries following the schema in `references/weekly-ppt-convention.md`. It produces a Markdown document in the vault's wiki layer — it does not modify the raw layer.
