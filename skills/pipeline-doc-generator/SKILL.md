---
name: pipeline-doc-generator
description: >
  Generate architecture evolution documentation for the entire Pipeline system — covering
  cross-stage changes, dataflow evolution, architectural trade-offs, and version history.
  Triggers on requests like "写架构文档", "pipeline 架构演进", "系统架构设计",
  "architecture doc", "document the pipeline". Also triggers when the user asks to write
  technical documentation covering MULTIPLE stages or the whole system, even without saying
  "architecture". Does NOT trigger for single-stage implementation docs (use stage-doc-generator)
  or general README/API docs.
---

# Pipeline Architecture Documentation Generator

This skill guides you through creating comprehensive Pipeline-level architecture evolution documentation following a standardized 14-section structure.

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

**CRITICAL**: Always follow the 14-section structure (sections 0-13) defined in `references/pipeline-doc.md`. Each section serves a specific purpose:

0. **Document Meta** - Version tracking and impacted stages
1. **Context and Problem Statement** - Why this evolution is needed
2. **Current Pipeline Snapshot** - System state before changes
3. **Evolution Goals and Design Principles** - What we're achieving
4. **Key Architectural Changes** - Before/After comparisons
5. **Cross-Stage Contract Changes** - Stage间数据契约变化
6. **Dataflow and Artifact Evolution** - How data flows through the system
7. **System-Level Trade-offs** - Architectural权衡分析
8. **Impact Analysis** - Quality/Efficiency/Stability metrics
9. **Evaluation and Verification** - How to validate changes
10. **Migration and Rollout Plan** - Deployment strategy
11. **Known Risks and Failure Modes** - What could go wrong
12. **Versioned Evolution History** - Historical tracking
13. **References and Source of Truth** - Authoritative sources

## Writing Workflow

### Step 0: Check for Existing Document

Before writing, check if a document for this version already exists (look for `pipeline-evolution-v{version}-*.md` in the target docs directory).

- **If it exists**: Read the existing document, compare against current system state, identify which sections are outdated. Update the affected sections, refresh `last_updated`. `created_date` stays unchanged. Add a new entry to Section 12 (Versioned Evolution History).
- **If not**: Proceed with full document creation (Steps 1-4).

### Step 0.5: Choose Documentation Scope

Judge the scope of the evolution to decide the documentation depth:

- **Full mode** (default): Write all 14 sections. Use for major architectural changes, new stage additions, cross-stage refactoring, or changes that affect data flow and contracts.
- **Minimal mode**: Write only the essential sections, leave the rest as `<!-- TODO -->` placeholders. Use for minor adjustments (e.g., config changes, small bug fixes, single-stage parameter tuning) where a full 14-section doc would be disproportionate effort.

Minimal mode sections (always write these):
- Section 0: Document Meta
- Section 1: Context and Problem Statement
- Section 4: Key Architectural Changes (Before/After)
- Section 13: References and Source of Truth

Skip or placeholder: Sections 2, 3, 5, 6, 7, 8, 9, 10, 11, 12 — add `<!-- TODO: Section N - brief note on what goes here -->`.

### Step 1: Gather Context

Before writing, collect:
- **Evolution scope** - What is changing? (New stages? Refactoring? Bug fixes?)
- **Affected stages** - Which stages are impacted?
- **Trigger** - Why is this change happening? (Bad case? Evaluation results? New requirements?)

Read the existing documentation and code to understand the current system state.

### Step 2: Read the Template

Always read `references/pipeline-doc.md` before starting. This contains the full specification for each section with required fields and examples.

### Step 3: Document Each Section

Follow this order:

**Section 0: Document Meta** — Version, created_date, last_updated, author, changelog path, impacted stages. Keep to 5-10 lines.

**Section 1: Context and Problem Statement** — Current system state, 3-5 cross-stage problems (each must be verifiable), trigger reasons (bad cases, eval results, new requirements).

**Section 2: Current Pipeline Snapshot** — Pipeline structure diagram, core artifacts, main data flow. Must include a Pipeline Structure diagram (see Visual Documentation).

**Section 3: Evolution Goals and Design Principles** — 3-5 result-oriented goals + method-oriented design principles. Focus on WHAT and WHY, not specific solutions.

**Section 4: Key Architectural Changes** — Each change needs Before/After/Why/What Changed/Impact. At least 3 changes, no code or prompt details.

**Section 5: Cross-Stage Contract Changes** — Per stage-pair: new/removed/adjusted constraints, compatibility notes. Focus on data contracts, not implementation.

**Section 6: Dataflow and Artifact Evolution** — Before vs After for data flows, artifact changes (new/deleted/enhanced), main chain evolution.

**Section 7: System-Level Trade-offs** — 2-4 trade-offs. Each must include both Gain (收益) and Cost (代价). Common dimensions: quality vs performance, flexibility vs control, upstream complexity vs downstream stability.

**Section 8: Impact Analysis** — Qualitative capabilities changed + quantitative metrics (coverage, error rate, generation time) in Before/After table format. At least 2 quantitative metrics if obtainable.

**Sections 9-10: Verification & Rollout** — Evaluation strategy (must be actionable, not conceptual), migration plan (phases, data strategy, rollback).

**Section 11: Known Risks** — 3-5 specific risks with trigger conditions and impact scope. No generalized descriptions.

**Sections 12-13: History & References** — Key version changes (don't repeat CHANGELOG), authoritative source list with paths/links.

### Step 4: Output Format

Save the documentation to a file named `pipeline-evolution-v{version}-{YYYY-MM-DD}.md` in the appropriate docs directory.

Use the exact template from `references/pipeline-doc.md`.

## Visual Documentation

Architecture understanding depends heavily on visual structure. Use ASCII diagrams to make data flows, system topology, and stage relationships immediately visible.

### When to Use Diagrams

| Section | Diagram Type | Purpose |
|---------|-------------|---------|
| 2. Current Pipeline Snapshot | Pipeline Structure | Show overall system topology |
| 2. Current Pipeline Snapshot | Data Flow Overview | Show main data paths |
| 4. Key Architectural Changes | Before/After Comparison | Show structural evolution |
| 6. Dataflow and Artifact Evolution | Data Flow Diagram | Show how data moves through stages |

Each diagram type (Pipeline Structure, Before/After, Data Flow, Cross-Stage Contracts) has specific formatting rules and examples. See the Appendix in `references/pipeline-doc.md` for character set, per-type rules, and examples.

## Guidelines

- **Pipeline level only** — don't describe Stage internal implementation; that's what stage-doc-generator is for
- **Before/After for every change** — show evolution clearly; skipping comparisons makes the doc useless
- **Problems must be verifiable** — every issue should be testable; vague problems waste readers' time
- **Solutions must be actionable** — avoid conceptual fluff; if you can't execute it, don't write it
- **Emphasize structure and data flow** — show how artifacts evolve; don't get lost in code details
- **No code/prompt details** — this is architecture documentation, not implementation
- **Trade-offs need costs** — always document both gains and costs; one-sided analysis is misleading
- **Engineering-focused and concrete** — every claim should be backed by evidence or a concrete example

## After Writing

1. Verify all 14 sections are complete
2. Check that Before/After comparisons are clear
3. Ensure all problems are verifiable
4. Confirm trade-offs include both gains and costs
5. Make sure references point to correct locations

### Step 5: Export Change Summary

After completing the document, append a change entry to `{base_path}/weeks/{current-ISO-week}/{project-slug}.json` following the schema in `references/weekly-ppt-convention.md`.

The change entry JSON looks like this:

```json
{
  "timestamp": "ISO 8601",
  "type": "feature | fix | refactor | decision | risk",
  "summary": "1 sentence, engineering-level abstraction",
  "context": "1-2 sentences explaining why and impact",
  "related_docs": ["path/to/doc"],
  "source": "pipeline-doc"
}
```

Skill-specific values:
- **type**: `"decision"` (pipeline architecture evolution is inherently a decision)
- **source**: always `"pipeline-doc"`
- **related_docs**: path to the generated `pipeline-evolution-v{version}-{YYYY-MM-DD}.md`

If the project slug cannot be determined, skip silently.

## Shared Storage Convention

This skill participates in the weekly-ppt shared storage system alongside `stage-doc-generator` and `weekly-change-tracker`. Read `references/weekly-ppt-convention.md` for the full schema and storage rules.
