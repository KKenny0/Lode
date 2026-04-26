# Project Analysis Prompt Template

Fill in `{placeholders}` and use this prompt to analyze each project. Run it in the main dialog by default. If the runtime supports parallel agents and the user explicitly requested or approved them, the same prompt may be sent to one agent per project.

```text
You are a weekly report analyst. Analyze the following project's Lode raw change entries for this week's report. Use fallback git commits only for uncovered work.

Project: {project_name}
Mode: {tech_or_report}

Raw entries:
{raw_entries}

Fallback git logs for uncovered commits:
{fallback_git_logs}

Execute these 4 steps in order:

**Step 1: Classify signals**
- Treat raw entries as authoritative semantic signals.
- Use each raw entry's `summary`, `context`, `type`, `source`, and `related_docs`.
- Map `type` directly: feature/fix/refactor/decision/risk.
- Use fallback git commits only when they are not clearly covered by a raw entry.
- Drop fallback commits that are only chore, docs, style, or formatting noise.
- Output: change_blocks list with { type, source, summary, context, related_docs, confidence }

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

**Step 3: Abstract into engineering semantics (per stream)**

For each work stream, group related change blocks into abstracted changes. Example: "add auto-layout" + "fix overlap" + "add positioning" → ONE key_change: "Built scene composition system with auto-layout and dense-panel overlap resolution"

Clarity first: list as many key_changes as needed to cover the work, but merge items that overlap in scope or audience. The test is: can a reviewer understand each item as a distinct piece of work? If two items would be explained the same way in a meeting, merge them.

When raw entry info is insufficient: consult `related_docs` if available, then fallback git logs. When truly impossible → mark as "待确认". Do NOT fabricate.

**Step 4: Build narrative (per stream)**

Tech mode (6-part): Goal(Why) → Problems(Pain) → KeyChanges(What) → TechApproach(How) → Result(Impact) → Risk&Next

Report mode (4-part): Goal(Why) → KeyChanges → Result(Impact) → NextSteps

Sparse data (0-1 raw entries and no meaningful fallback commits): combine into a single "Status Update" stream.

**For TechApproach:**
- This is the most important section — it's where reviewers understand HOW the work was done
- Prefer structured ASCII diagrams (flow charts, before/after comparisons, decision trees) over prose
- Each major change should have its own diagram with enough detail to stand on its own
- Include version tags if commit messages reference them (e.g. v2.7, v2.14)
- Don't compress multiple distinct approaches into one terse block — give each the space it needs
- Treat `source: arch-doc` entries and `related_docs` as stronger technical-approach evidence than bare commit subjects.

**Return ONLY this JSON (no other commentary):**

{
  "project": "{project_name}",
  "is_maintenance_week": false,
  "work_streams": [
    {
      "name": "concise stream name",
      "priority": "core | supporting | exploratory",
      "narrative": {
        "goal": "1 sentence — why this stream's work matters",
        "problems": "core pain points this stream addresses",
        "key_changes": "abstracted engineering changes for this stream",
        "technical_approach": "how it was done — detailed, with ASCII diagrams (omit in report mode)",
        "result": "impact and outcomes",
        "risk_and_next": "risks and next steps"
      }
    }
  ]
}
```

## Handling Results

- `is_maintenance_week: true` → project gets only a brief line on the overview slide, no dedicated slides
- Non-JSON response → retry with stricter format instruction
- Missing fields → fill from available data; if truly missing → mark as "待确认"
- Fallback-only stream → label the confidence as lower in the narrative or next steps
