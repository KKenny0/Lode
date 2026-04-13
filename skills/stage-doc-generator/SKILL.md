---
name: stage-doc-generator
description: >
  Generate implementation documentation for a single pipeline Stage — covering behavior,
  responsibilities, inputs/outputs, processing flow, and contracts. Triggers on requests like
  "为 X Stage 写文档", "stage 实现文档", "stage impl doc", "document this stage",
  "how does X stage work?" (when expecting formal docs). Also triggers when the user asks to
  write technical documentation about ONE specific stage, even without saying "implementation".
  Does NOT trigger for pipeline-level architecture docs (use pipeline-doc-generator) or
  general README/API docs.
---

# Stage Implementation Documentation Generator

This skill guides you through creating comprehensive Stage implementation documentation following a standardized 13-section structure.

## When to Use

Use this skill when:
- User asks to write/create/generate Stage implementation documentation
- User mentions "stage doc", "stage 实现文档", "stage implementation spec"
- User wants to document a stage's responsibilities, inputs/outputs, or behavior
- User asks "how does X stage work?" and expects formal documentation
- User says "为 X stage 写文档" or similar Chinese phrasing

## Documentation Structure

**CRITICAL**: Always follow the 13-section structure (sections 0-12) defined in `references/stage-implementation-spec.md`. Each section serves a specific purpose:

0. **Document Meta** - Version tracking and ownership
1. **Stage Role in Pipeline** - Execution position and dependencies
2. **Responsibilities and Non-Goals** - Scope boundaries
3. **Inputs and Upstream Dependencies** - Input contracts (4 layers)
4. **Outputs and Downstream Contracts** - Output promises
5. **Core Processing Flow** - Step-by-step breakdown
6. **Prompt/Rule/Reference Contracts** - Model constraints
7. **Validation, Repair, and Failure Handling** - Error resilience
8. **Observability and Debugging** - How to troubleshoot
9. **Compatibility and Migration Notes** - Version evolution
10. **Known Issues and Open Questions** - Honest status
11. **Versioned Changes** - Historical tracking
12. **Source of Truth** - Code vs documentation

## Writing Workflow

### Step 0: Check for Existing Document

Before writing, check if a document for this stage already exists (look for `{stage_name}-implementation-*.md` in the target docs directory).

- **If it exists**: Read the existing document, compare against current code, identify which sections have stale or missing information. Update only the affected sections, increment `doc_version`, refresh `last_updated`. `created_date` stays unchanged. Add a new row to Section 11 (Versioned Changes).
- **If not**: Proceed with full document creation (Steps 1-4).

### Step 0.5: Choose Documentation Scope

Judge the complexity of the stage to decide the documentation scope:

- **Full mode** (default): Write all 13 sections. Use for new stages, major refactors, or stages with complex LLM interactions, validation/repair loops, or cross-stage dependencies.
- **Minimal mode**: Write only the essential sections, leave the rest as `<!-- TODO -->` placeholders. Use for simple stages (e.g., pure data transforms, lightweight post-processing) where the full 13-section doc would be disproportionate effort.

Minimal mode sections (always write these):
- Section 0: Document Meta
- Section 1: Stage Role in Pipeline (with Pipeline Position diagram)
- Section 2: Responsibilities and Non-Goals
- Section 5: Core Processing Flow (simplified — key steps only, no need for all 8 canonical steps if fewer apply)
- Section 12: Source of Truth

Skip or placeholder: Sections 3, 4, 6, 7, 8, 9, 10, 11 — add `<!-- TODO: Section N - brief note on what goes here -->`.

### Step 1: Gather Context

Before writing, collect:
- **Stage name** - Which stage is being documented?
- **Code location** - Where is the stage implemented?

Read the source code to understand actual implementation. The code is the **source of truth**.

### Step 2: Read the Template

Always read `references/stage-implementation-spec.md` before starting. This contains the full specification for each section with required fields and examples.

### Step 3: Document Each Section

Read `references/stage-implementation-spec.md` for the full specification of each section (required fields, examples, format). Write sections in this order:

**Section 0: Document Meta** — Fill all required fields per spec. Key: `created_date` is set once and never changes; `last_updated` always reflects the current modification.

**Section 1: Stage Role in Pipeline** — Execution order, parallelism, skip/cache/rerun behavior. Must include a Pipeline Position diagram (see Visual Documentation).

**Sections 2-4: Scope & Contracts** — Responsibilities vs non-goals, inputs (4 layers: runtime, upstream artifacts, schemas, external references), outputs (primary + secondary). Provide concrete JSON examples for input/output schemas.

**Section 5: Core Processing Flow** — Break into the 8 canonical steps (input prep → prompt build → LLM execution → parse → normalize → validate → repair → output). Each step must map to actual code modules. Must include Function Call Tree diagram; add Data Flow diagram if there's concurrency, fan-out, or branching.

**Sections 6-9: Constraints & Operations** — Prompt/rule/reference contracts (3 layers), validation & repair (4 sub-sections), observability (logging, artifacts, debug guide), compatibility & migration notes.

**Sections 10-12: Status & Provenance** — Known issues (3 categories: actual issues, limitations, open questions), versioned changes table, source of truth list. Always end with "本文档仅为解释性描述，实际行为以代码为准".

### Step 4: Output Format

Save the documentation to a file named `{stage_name}-implementation-{YYYY-MM-DD}.md` in the appropriate docs directory.

Use the exact template from `references/stage-implementation-spec.md`.

## Visual Documentation

Architectural understanding depends heavily on visual structure. Use ASCII diagrams to make data flows, schemas, and code relationships immediately visible — a good diagram replaces paragraphs of prose.

### When to Use Diagrams

| Section | Diagram Type | Purpose |
|---------|-------------|---------|
| 1. Stage Role in Pipeline | Pipeline Position | Show execution order and dependencies |
| 3. Inputs / 4. Outputs | Schema Hierarchy | Show type relationships and composition |
| 5. Core Processing Flow | Function Call Tree | Show module internals and execution paths |
| 5. Core Processing Flow | Data Flow | Show parallel execution, branching, and merge |
| 6. Prompt/Rule Contracts | Data Flow | Show prompt assembly pipeline |

See the Appendix in `references/stage-implementation-spec.md` for character set and general rules. Per-type examples appear inline in the relevant spec sections (1, 3.3, 5.x, 6.1).

## Guidelines

- **Code is truth** — always verify against actual implementation; read the code first, don't copy-paste blindly
- **Be specific** — use concrete field names, file paths, function names; vagueness makes docs useless
- **Explain why** — don't just list what; explain the reasoning behind design decisions
- **Be honest** — document known issues and limitations transparently; hiding problems hurts trust
- **All 13 sections are required** — don't skip any; each serves a specific purpose
- **JSON examples are mandatory** — for inputs/outputs, a concrete example beats a paragraph of description
- **Keep current** — update `doc_version` and `last_updated` when changing; `created_date` never changes

## After Writing

1. Verify all 13 sections are complete
2. Check that code paths actually exist
3. Ensure JSON examples are valid
4. Confirm source of truth points to correct locations

## Step 5: Export Change Summary

After completing the document, append a change entry to `{base_path}/weeks/{current-ISO-week}/{project-slug}.json` following the schema in `references/weekly-ppt-convention.md`.

The change entry JSON looks like this:

```json
{
  "timestamp": "ISO 8601",
  "type": "feature | fix | refactor | decision | risk",
  "summary": "1 sentence, engineering-level abstraction",
  "context": "1-2 sentences explaining why and impact",
  "related_docs": ["/absolute/path/to/doc"],
  "source": "stage-doc"
}
```

Skill-specific values:
- **type**: choose based on the primary nature of the change — `feature` (new capability), `fix` (bug resolved), `refactor` (restructured), `decision` (design choice), or `risk` (issue identified)
- **source**: always `"stage-doc"`
- **related_docs**: absolute path to the generated `{stage_name}-implementation-{YYYY-MM-DD}.md`

**New document**: summary should capture what the stage implements. Context should explain why this stage was documented now.

**Updating an existing document**: summary should describe what changed since the last version (e.g. "Updated section 5-7 to reflect new retry loop"). Context should explain why the update was needed (e.g. "Stage gained repair logic in v2.4; previous doc didn't cover it").

If the project slug cannot be determined, skip silently.

## Shared Storage Convention

This skill participates in the weekly-ppt shared storage system alongside `pipeline-doc-generator` and `weekly-change-tracker`. Read `references/weekly-ppt-convention.md` for the full schema and storage rules.
