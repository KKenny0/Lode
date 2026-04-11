---
name: pipeline-doc-generator
description: Generate Pipeline-level architecture evolution documentation following the 13-section structure defined in pipeline-doc.md. Use this skill whenever the user asks to write, create, or generate Pipeline architecture documentation, architecture evolution docs, system design docs for the whole pipeline, or any document describing how the entire pipeline system evolves and changes. Also triggers for requests like "写架构文档"、"pipeline 架构演进"、"系统架构设计", or when documenting cross-stage changes, dataflow evolution, architectural trade-offs, or system-level refactoring. Even if the user doesn't explicitly mention "architecture" but is asking for pipeline-wide technical documentation that covers multiple stages, system structure, or evolution history, use this skill.
---

# Pipeline Architecture Documentation Generator

This skill guides you through creating comprehensive Pipeline-level architecture evolution documentation following a standardized 13-section structure.

## When to Use

Use this skill when:
- User asks to write/create/generate Pipeline architecture documentation
- User mentions "pipeline doc", "架构文档", "架构演进文档", "architecture evolution"
- User wants to document system-wide changes, cross-stage refactoring, or architectural decisions
- User asks about the overall pipeline structure, dataflow, or system topology
- User says "为 pipeline 写架构文档" or similar Chinese phrasing
- User needs to track architectural changes between versions
- User is documenting a major refactoring that affects multiple stages

## Key Difference from Stage Docs

**Stage Implementation Docs** (`stage-doc-generator`):
- Focus on a single Stage's internal implementation
- Describe how ONE stage processes data
- Cover inputs/outputs, validation, error handling for that stage

**Pipeline Architecture Docs** (this skill):
- Focus on the ENTIRE system's structure and evolution
- Describe how MULTIPLE stages work together
- Cover architectural changes, trade-offs, dataflow evolution
- Track system-level changes across versions

## Documentation Structure

**CRITICAL**: Always follow the 13-section structure defined in `references/pipeline-doc.md`. Each section serves a specific purpose:

1. **Document Meta** - Version tracking and impacted stages
2. **Context and Problem Statement** - Why this evolution is needed
3. **Current Pipeline Snapshot** - System state before changes
4. **Evolution Goals and Design Principles** - What we're achieving
5. **Key Architectural Changes** - Before/After comparisons
6. **Cross-Stage Contract Changes** - Stage间数据契约变化
7. **Dataflow and Artifact Evolution** - How data flows through the system
8. **System-Level Trade-offs** - Architectural权衡分析
9. **Impact Analysis** - Quality/Efficiency/Stability metrics
10. **Evaluation and Verification** - How to validate changes
11. **Migration and Rollout Plan** - Deployment strategy
12. **Known Risks and Failure Modes** - What could go wrong
13. **Versioned Evolution History** - Historical tracking
14. **References and Source of Truth** - Authoritative sources

## Writing Workflow

### Step 1: Gather Context

Before writing, collect:
- **Evolution scope** - What is changing? (New stages? Refactoring? Bug fixes?)
- **Affected stages** - Which stages are impacted?
- **Trigger** - Why is this change happening? (Bad case? Evaluation results? New requirements?)
- **Current state** - What does the pipeline look like now?

Read the existing documentation and code to understand the current system state.

### Step 2: Read the Template

Always read `references/pipeline-doc.md` before starting. This contains the full specification for each section with required fields and examples.

### Step 3: Document Each Section

Follow this order:

**Section 0: Document Meta**
- `version`: Version number (e.g., v2.4)
- `date`: Current date
- `author`: Owner/responsible person
- `related_changelog`: Path to CHANGELOG
- `impacted_stages`: List of affected stages

Keep it concise, 5-10 lines max.

**Section 1: Context and Problem Statement**

Current system state:
- Main pipeline structure
- Core capabilities

Core problems (3-5 system-level issues):
- Must be cross-stage or full-pipeline problems
- Each problem must be verifiable
- Don't write implementation details

Trigger reasons:
- Bad case examples
- Batch evaluation results
- New requirements or constraints

**Section 2: Current Pipeline Snapshot**

Use visual diagrams to show:
- Pipeline structure (text-based diagram)
- Core artifacts (narrative_timeline, storyboard, etc.)
- Main data flow

**Must include a Pipeline Structure diagram** (see Visual Documentation section).

**Section 3: Evolution Goals and Design Principles**

Goals (3-5 items):
- Result-oriented
- Map to specific problems

Design Principles:
- Method-oriented
- Guide the architectural approach

Don't write specific solutions here — focus on WHAT and HOW, not the exact implementation.

**Section 4: Key Architectural Changes**

Each change must use this structure:

### Change N: {名称}
- **Before**: 改动前结构或行为
- **After**: 改动后结构或行为
- **Why**: 对应解决的问题
- **What Changed**: 具体变化范围（模块/数据/流程）
- **Impact**: 对系统的影响（质量/稳定性/复杂度）

Requirements:
- At least 3 changes
- Must have clear Before/After comparison
- Don't write code or prompts

**Section 5: Cross-Stage Contract Changes**

Describe by stage relationship:

### {Stage A} → {Stage B}
- New constraints (fields / validation rules)
- Removed or adjusted constraints
- Compatibility notes

Focus on "data contracts" between stages, not implementation details.

**Section 6: Dataflow and Artifact Evolution**

Data flow changes:
- Before vs After

Artifact changes:
- New / deleted / enhanced data structures

Core chain changes:
- Main data path evolution

Use structural diagrams or flow descriptions. Emphasize the closed loop.

**Section 7: System-Level Trade-offs**

List 2-4 key trade-offs:

### Trade-off N
- **Gain**: 收益
- **Cost**: 代价

Common dimensions:
- Quality vs Performance
- Flexibility vs Control
- Upstream complexity vs Downstream stability

Must include costs — don't just list advantages.

**Section 8: Impact Analysis**

Qualitative impact:
- Which capabilities improved or changed

Quantitative metrics (if available):
- Coverage
- Error rate
- Generation time

Use table format:

| 维度 | Before | After | 变化 |
|------|--------|-------|------|

At least 2 quantitative metrics if obtainable.

**Section 9: Evaluation and Verification Strategy**

Validation methods:
- How to verify changes are effective

Evaluation types:
- Stage-level
- E2E
- Batch evaluation

Data sources:
- Datasets or sample types used

Must be actionable — avoid conceptual descriptions.

**Section 10: Migration and Rollout Plan**

Rollout phases:
- Parallel run
- Canary release
- Full rollout

Data strategy:
- Whether migration is needed

Rollback strategy:
- How to restore previous version

Clear steps, actionable.

**Section 11: Known Risks and Failure Modes**

List 3-5 risks:
- Risk point
- Trigger condition
- Impact scope

Must be specific — no generalized descriptions.

**Section 12: Versioned Evolution History**

Record key version changes:

```
v2.2 → v2.3
* Core changes

v2.3 → v2.4
* Core changes
```

Only key architectural changes — don't repeat CHANGELOG.

**Section 13: References and Source of Truth**

List:
- Design docs
- Changelogs
- Stage docs
- Evaluation documents

Use paths or links. Mark authoritative sources.

### Step 4: Output Format

Save the documentation to a file named `pipeline-evolution-v{version}.md` or similar in the appropriate docs directory.

Use the exact template from `references/pipeline-doc.md`.

## Visual Documentation

Architecture understanding depends heavily on visual structure. Use ASCII diagrams to make data flows, system topology, and stage relationships immediately visible.

### Diagram Types for Pipeline Docs

| Section | Diagram Type | Purpose |
|---------|-------------|---------|
| 2. Current Pipeline Snapshot | Pipeline Structure | Show overall system topology |
| 2. Current Pipeline Snapshot | Data Flow Overview | Show main data paths |
| 4. Key Architectural Changes | Before/After Comparison | Show structural evolution |
| 6. Dataflow and Artifact Evolution | Data Flow Diagram | Show how data moves through stages |

### Character Set

Use Unicode box-drawing characters:

```
Horizontal:  ─ ── ─────
Vertical:    │
Corners:     ┌ ┐ └ ┘
T-junctions: ├ ┤ ┬ ┴
Cross:       ┼
Arrows:      ▼ ▲ → ← ► ◄
```

### Diagram Type 1: Pipeline Structure

For showing the overall system topology and stage relationships.

```markdown
                    ┌─────────────────────────────────────┐
                    │         Pipeline Orchestrator        │
                    └─────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
            ┌───────▼────────┐              ┌──────────▼──────────┐
            │  Parse Stage   │              │  Extract Characters │
            └────────────────┘              └─────────────────────┘
                    │                                   │
                    └─────────────────┬─────────────────┘
                                      ▼
                            ┌───────────────────┐
                            │  Narrative Slice  │
                            └───────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
            ┌───────▼────────┐              ┌──────────▼──────────┐
            │ Analyze Scenes │              │ Generate Storyboard │
            └────────────────┘              └─────────────────────┘
```

Key rules:
- Use box-drawing characters for clean borders
- Show data flow with arrows
- Group related stages
- Keep width ≤ 80 characters

### Diagram Type 2: Before/After Comparison

For showing architectural evolution.

```markdown
Before:
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Stage A │───▶│ Stage B │───▶│ Stage C │
└─────────┘    └─────────┘    └─────────┘

After:
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Stage A │───▶│ Stage B │───▶│ Stage C │
└─────────┘    └─────────┘    └─────────┘
                    │
                    ▼
              ┌─────────┐
              │ Stage D │  (NEW)
              └─────────┘
```

### Diagram Type 3: Data Flow Overview

For showing how data flows through the pipeline.

```markdown
User Input (Script)
      │
      ▼
┌─────────────┐
│    Parse    │ ──▶ narrative_timeline
└─────────────┘
      │
      ▼
┌─────────────┐
│   Slice     │ ──▶ narrative_slices[]
└─────────────┘
      │
      ▼
┌─────────────┐
│  Analyze    │ ──▶ scene_analysis[]
└─────────────┘
      │
      ▼
┌─────────────┐
│ Storyboard  │ ──▶ storyboard
└─────────────┘
```

### Diagram Type 4: Cross-Stage Contracts

For showing data relationships between stages.

```markdown
Stage A (Parse)                    Stage B (Slice)
─────────────────                  ─────────────────
Outputs:                    ──▶   Inputs:
- narrative_timeline              - narrative_timeline (required)
- scenes                          - scenes (optional)
                                  - config.overrides

Contract Changes:
v2.2 → v2.3: Added scenes output (optional)
v2.3 → v2.4: narrative_timeline now includes audio_notes
```

## Principles

1. **Focus on Pipeline Level** - Don't describe Stage internal implementation
2. **All Changes Need Before/After** - Show evolution clearly
3. **Problems Must Be Verifiable** - Don't write vague issues
4. **Solutions Must Be Actionable** - Avoid conceptual fluff
5. **Emphasize Structure and Data Flow** - Not code details
6. **No Code/Prompt Details** - This is architecture, not implementation
7. **Keep Engineering-Focused** - Must be actionable and concrete

## Common Mistakes to Avoid

- **Don't** describe Stage internal implementation — that's what stage-doc-generator is for
- **Don't** skip Before/After comparisons — all changes must show evolution
- **Don't** write un-verifiable problems — every issue should be testable
- **Don't** include code or prompt details — focus on architecture
- **Don't** write vague descriptions — be concrete about what changed
- **Don't** forget trade-offs — always document the costs
- **Don't** ignore data flow changes — show how artifacts evolve

## Writing Constraints (Must Follow)

1. Only describe Pipeline level, not Stage internal implementation
2. All changes must have Before / After comparison
3. All problems must be verifiable
4. All validation strategies must be actionable
5. Prioritize describing structural changes and data flow changes
6. No prompt / code details
7. Content must be engineering-focused and actionable

## After Writing

1. Verify all 13 sections are complete
2. Check that Before/After comparisons are clear
3. Ensure all problems are verifiable
4. Confirm trade-offs include both gains and costs
5. Make sure references point to correct locations

### Step 5: Export Change Summary

After completing and verifying the document, export a change summary entry so downstream tools (like weekly report generators) know this architecture evolution was documented.

Read `references/weekly-ppt-convention.md` for the full schema and storage rules. Generate a single entry:

- **type**: `"decision"` (pipeline architecture evolution is inherently a decision)
- **summary**: 1 sentence — what evolved (version, scope, which stages)
- **context**: 1-2 sentences — what stages are impacted and the strategic intent
- **related_docs**: path to the generated `pipeline-evolution-v{version}.md`
- **source**: `"pipeline-doc"`

Append the entry to `~/.weekly-ppt/weeks/{current-ISO-week}/{project-slug}.json`.

If the project slug cannot be determined (no `~/.weekly-ppt/projects.json`, no clear project context), skip this step silently. The documentation is the primary deliverable; the change summary is a side effect.

## Shared Storage Convention

This skill participates in the weekly-ppt shared storage system alongside `stage-doc-generator` and `weekly-change-tracker`. The full schema and storage rules are defined in `references/weekly-ppt-convention.md`.
