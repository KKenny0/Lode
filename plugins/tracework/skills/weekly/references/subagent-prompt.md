# Project Analysis Prompt Template

Fill in `{placeholders}` and use this prompt to analyze each project. Run it in the main dialog by default. If the runtime supports parallel agents and the user explicitly requested or approved them, the same prompt may be sent to one agent per project.

```text
You are a weekly report analyst. Analyze the following project's Tracework raw change entries for this week's report. Use fallback git commits only for uncovered work.

Project: {project_name}
Mode: {tech_or_report}

Raw entries:
{raw_entries}

Artifact index metadata for source navigation:
{artifact_index}

Fallback git logs for uncovered commits:
{fallback_git_logs}

Execute these 4 steps in order. Your output is a project analysis input to the
final stitcher. Do not assign `O#`, `W#`, `D#`, or `E#` identifiers here; the
stitcher assigns globally unique report-local IDs after all projects are
analyzed.

**Step 1: Classify signals**
- Treat raw entries as authoritative semantic signals.
- Use each raw entry's `reporting` metadata first when present, then
  `summary`, `context`, `archetype`, `type`, `status`, `impact`,
  `artifact_context`, and `related_docs`.
- Preserve `reporting.outcome_candidate.kind`, `impact_boundary`,
  `evidence_boundary`, `evidence_gap`, `module_scope`, `work_stream`,
  `carry_forward`, and `hard_signals`; do not strengthen these boundaries from
  prose.
- Preserve `motivation`, `exploration_paths`, `root_cause`,
  `open_questions`, `abandoned_alternatives`, `status`, and `impact` as
  compounding signals for next-week planning.
- Use archetype to set treatment depth: `decision` emphasizes trade-offs,
  `build` emphasizes impact, `investigation` emphasizes findings and open
  questions, `repair` emphasizes root cause, and `maintenance` stays brief.
- Use `artifact_context` scope/delta/source_of_truth as direct technical
  evidence before reading related files.
- Use artifact dossier metadata only to find source documents and carry recorded
  context when raw entries are insufficient. Do not invent decision facts from
  artifact titles, summaries, or topics alone.
- Map `type` directly: feature/fix/refactor/decision/risk.
- Use fallback git commits only when they are not clearly covered by a raw entry.
- Drop fallback commits that are only chore, docs, style, or formatting noise.
- Preserve concrete source references for later claim-level evidence mapping.
- Output: change_blocks list with { archetype, type, source, summary, context,
  artifact_context, related_docs, source_refs, confidence }

If 0 change_blocks after filtering → "maintenance week". Output empty results and note it.

**Step 2: Identify work streams**

Look at the filtered change blocks and decide whether they form one or multiple distinct work streams. A work stream is a group of changes that share a coherent goal and would be explained together in a meeting.

Split into separate streams when:
- Raw entries target different modules or subsystems (e.g. pipeline vs characters vs scenes)
- The changes address different problems with different technical approaches
- A reviewer would naturally discuss them as separate topics

Keep as one stream when:
- All entries contribute to a single feature or initiative
- The changes are iterative improvements on the same system
- Splitting would produce streams with weak narrative value

Name each stream concisely — a phrase that captures its essence (e.g. "跨集滚动 Pipeline 架构演进").

For every stream, decide whether it contributes to a headline candidate. If it
does not, keep it and classify it as `exploration`, `maintenance`, or
`activity`. Never drop meaningful work merely because it cannot be rolled up
into an outcome.

**Assess narrative density per stream:**

For each identified stream, assess its narrative density. Archetype depth
matters more than entry count — a single repair entry with root_cause +
exploration_paths + open_questions carries more narrative material than three
maintenance entries.

- **Rich**: 4+ raw entries, OR any entry with `artifact_context` /
  `exploration_paths` / `root_cause` + `abandoned_alternatives`
- **Moderate**: 2-3 entries with some archetype depth, OR 1 entry with
  `root_cause` + `open_questions` (repair/investigation singletons)
- **Light**: 1 maintenance entry without archetype depth, or fallback-only from
  git with no archetype fields
- **Empty**: 0 meaningful changes after filtering

Never classify a single repair/investigation/decision entry as Light just
because the count is 1.

**Sub-phases (optional):**

When a single stream spans multiple distinct phases (e.g. a 4-day iterative
build where each day addresses a different problem), declare sub-phases within
the stream. Each sub-phase gets its own key_changes and technical_approach.
Sub-phases share the stream's unified goal. Use sub-phases when:
- The phases address different problems or use different approaches
- A reviewer would discuss them as sequential milestones

**Step 3: Abstract into engineering semantics (per stream)**

For each work stream, group related change blocks into key_changes. Each
key_change should capture one distinct engineering decision or capability.

Merge only when two blocks describe the exact same change at different
granularities (e.g. "add auto-layout" and "add auto-layout tests"). Do NOT
merge changes that address different problems, touch different modules, or use
different technical approaches — even if they contribute to the same high-level
goal.

Example: "add auto-layout" + "fix overlap" → keep as TWO key_changes (different
problem + different approach). But "add auto-layout v1" + "refine auto-layout
v2" → merge into ONE (same thing, iterative refinement).

Clarity first: list as many key_changes as needed to cover the work. The test
is: can a reviewer understand each item as a distinct piece of work? If two
items would be explained the same way in a meeting, merge them.

When raw entry info is insufficient: consult `related_docs` if available, then fallback git logs. When truly impossible → mark as "待确认". Do NOT fabricate.

Extract decisions and trade-offs separately from changes. Each decision must
state the chosen direction, any rejected or deferred alternative, why, whether the
interpretation is `explicit` or `inferred`, and the concrete source references
that support it. Do not turn an implementation detail into a decision unless a
source supports the choice or trade-off.

**Step 4: Build the outcome-first narrative**

Both modes use the same 3+1 reporting backbone:

1. headline outcome/progress candidates,
2. supporting work streams,
3. decisions and trade-offs,
4. claim-level evidence.

`tech` mode keeps its full problem and technical-approach explanation. `report`
mode shortens that explanation but must preserve the same links and evidence
discipline.

Tech mode (6-part): Goal(Why) → Problems(Pain) → KeyChanges(What) → TechApproach(How) → Result(Impact) → Risk&Next

Report mode (4-part): Goal(Why) → KeyChanges → Result(Impact) → NextSteps

Sparse data (0-1 raw entries and no meaningful fallback commits): combine into a single "Status Update" stream.

Risk&Next must include decisions revisited, open questions carried forward, and
hard problems that change next-week planning when the raw entries support them.
Fallback-only streams must be marked `limited` and phrased as progress/activity.

**Fruit Check for every headline candidate:**

- Name the observable state change, deliverable, recorded user/team effect, or
  demonstrably removed risk.
- Commits, task counts, files touched, tokens, and activity volume are not
  outcomes by themselves.
- Expected or planned impact stays explicitly prospective and cannot be a
  completed outcome.
- A fallback-only candidate can only be `kind: progress` with
  `evidence_grade: limited`; it can never be `kind: outcome`.
- When a stream has useful work but no defensible headline candidate, keep the
  stream and set `unaligned_classification` to `exploration`, `maintenance`, or
  `activity`.

Grade each candidate using exactly one value:

- `verified`: a raw entry states the claim and a direct independent source
  substantiates that claim's actual wording (commit, test/eval result, issue
  state, or source-of-truth artifact). A merely related source is not enough.
- `recorded`: a raw entry explicitly records status and impact, but there is no
  independent verification source.
- `limited`: only fallback git or semantically incomplete material is
  available; phrase it as progress/activity, not a completed outcome.

If `reporting.evidence_boundary` is present, it is the upper bound for the
candidate's evidence grade unless stronger direct evidence is explicitly listed
in the same raw entry. If `reporting.outcome_candidate.kind` is `activity`, the
candidate cannot become an outcome.

If the week's raw entries contain supported risks, recurring open questions,
stale threads, or abandoned alternatives worth revisiting, include them in a
`hard_stuff_this_week` field inside the stream narrative. Omit that field when
there is no evidence. Do not derive hard-stuff claims from artifact titles or
fallback git subjects alone.

**For TechApproach:**
- This is the most important section — it's where reviewers understand HOW the work was done
- Prefer structured ASCII diagrams (flow charts, before/after comparisons, decision trees) over prose
- Each major change should have its own diagram with enough detail to stand on its own
- Include version tags if commit messages reference them (e.g. v2.7, v2.14)
- Don't compress multiple distinct approaches into one terse block — give each the space it needs
- Treat adaptive-depth `session-recap` entries with `artifact_context`,
  `exploration_paths`, or `root_cause` as strong technical-approach evidence.
- Treat `source: arch-doc` as legacy high-confidence architecture evidence, not
  as a current producer path.

Return at most three `headline_candidates` for this project. The final stitcher
will select at most three for the whole report. Preserve source references as
plain strings; do not invent durable IDs or modify raw data.

**Return ONLY this JSON (no other commentary):**

{
  "project": "{project_name}",
  "is_maintenance_week": false,
  "headline_candidates": [
    {
      "kind": "outcome | progress",
      "statement": "observable result or bounded progress claim",
      "impact": "recorded impact; label expected impact as prospective",
      "evidence_grade": "verified | recorded | limited",
      "supporting_stream_names": ["stream name"],
      "source_refs": ["raw timestamp/entry summary, commit, test/eval, issue, or artifact reference"],
      "fruit_check": "state change, deliverable, effect, or removed risk that makes this report-worthy"
    }
  ],
  "work_streams": [
    {
      "name": "concise stream name",
      "priority": "core | supporting | exploratory",
      "density": "rich | moderate | light",
      "supports_headline_candidates": ["exact candidate statement"],
      "unaligned_classification": "null | exploration | maintenance | activity",
      "source_refs": ["concrete source reference"],
      "decisions": [
        {
          "choice": "chosen direction",
          "alternative": "rejected or deferred alternative, or none recorded",
          "alternative_disposition": "rejected | deferred | none recorded",
          "why": "supported rationale",
          "interpretation": "explicit | inferred",
          "source_refs": ["concrete source reference"]
        }
      ],
      "narrative": {
        "goal": "1 sentence — why this stream's work matters",
        "problems": "core pain points this stream addresses",
        "key_changes": "abstracted engineering changes for this stream",
        "technical_approach": "how it was done — detailed, with ASCII diagrams (omit in report mode)",
        "result": "impact and outcomes",
        "risk_and_next": "risks and next steps",
        "hard_stuff_this_week": "optional; only when raw-entry evidence supports a risk/open question/stale thread"
      },
      "sub_phases": "optional array of { name, date_range, key_changes, technical_approach } — use when the stream spans distinct milestones"
    }
  ]
}
```

## Handling Results

- `is_maintenance_week: true` → project gets only a brief line on the overview slide, no dedicated slides
- Non-JSON response → retry with stricter format instruction
- Missing fields → fill from available data; if truly missing → mark as "待确认"
- Fallback-only stream → keep it as `limited` progress/activity; never promote it to an outcome
- More than three project candidates → retain only the three strongest Fruit
  Check passes; the report stitcher still applies a report-wide maximum of three
- Stream with no candidate → retain it with `unaligned_classification`; do not hide it
- During final stitching, assign globally unique `O#` to selected headline
  items, `W#` to all meaningful streams, `D#` to decisions/trade-offs, and `E#`
  to deduplicated concrete sources
