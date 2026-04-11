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

### Character Set

Use Unicode box-drawing characters for diagrams. They render reliably in all Markdown viewers and terminals:

```
Horizontal:  ─ ── ─────
Vertical:    │
Corners:     ┌ ┐ └ ┘
T-junctions: ├ ┤ ┬ ┴
Cross:       ┼
Arrows:      ▼ ▲ → ← ► ◄
Branches:    ├── └──
```

### Diagram Type 1: Data Flow

For showing how data moves through the stage — parallel execution, branching paths (PASS/FAIL), and merge points.

```markdown
                        ┌─── input_1 ───┐
                        │               │
                        │ (concurrent)  │
                        ▼               ▼
                  process_a         process_b
                        │               │
                 ┌──────┴──────┐  ┌─────┴─────┐
                 PASS          │  PASS        │
                 │          FAIL              FAIL
                 │             │              │
                 │         repair           repair
                 │             │              │
                 ▼             ▼              ▼
           (result_a)    (result_b)
                 │              │
                 └──────┬───────┘
                        ▼
                   merge_results
                        │
                        ▼
                   final_output
```

Key rules:
- Each processing step is a labeled box or line
- Branching uses `┌──┤` or `├──┐` T-junctions
- Arrows (`▼`) show flow direction at critical transitions
- Use `PASS` / `FAIL` labels on conditional branches
- Parallel sections are shown side-by-side at the same indentation level
- Wrap the entire diagram in a fenced code block (` ``` `)

### Diagram Type 2: Schema Hierarchy

For showing type inheritance, composition, and field-level detail between related data structures.

```markdown
                SliceDraft (LLM output layer)
                ─────────────────────────────
                source_text: str
                narrative_summary: str
                content_type: Literal
                extra: forbid
                       │
                       │  inherits
                       ▼
                NarrativeSlice (system enrichment layer)
                ────────────────────────────────────────
                + slice_id: str
                + slice_index: int
                + location: str
                       │
                       │  composed into
                       ▼
                NarrativeSlicePlan (scene wrapper)
                ──────────────────────────────────
                title: str
                slices: list[NarrativeSlice]
```

Key rules:
- Each type is a horizontal block with `───────` separators
- Show fields with their types on separate lines
- Use `│` and `▼` for inheritance/composition arrows with labels
- Use `+` prefix for fields added at each layer
- Include key constraints (e.g., `extra: forbid`) inline

### Diagram Type 3: Function Call Tree

For showing the execution hierarchy within a module — which functions call which, with parameters and return values.

```markdown
run(inputs)
 ├── ValidateInputs.model_validate(inputs)          # input validation
 ├── _build_episode_order(parsed_scenes)              # extract episode order
 ├── asyncio.gather(                                  # concurrent fan-out
 │     _process_scene(scene_0),
 │     _process_scene(scene_1),
 │     ...  (Semaphore limited)
 │ )
 ├── sort by scene_order
 └── materialize_output(all_results, parsed_scenes)
```

For loops and branching within a function:

```markdown
for attempt in range(max_attempts):
    ├── render_template(system + user)
    ├── llm_call → structured_output
    ├── _finalize → deterministic enrichment
    ├── _validate → coverage check
    │
    ├── PASS → return result
    │
    └── FAIL
          └── _build_repair_prompt
              └── next attempt (repair replaces user_prompt)
```

Key rules:
- Root function at the top, no indentation
- Each call is `├──` or `└──` with function name and brief comment
- Use `# comment` for inline annotations (what the call does)
- Show loops with `for ... :` headers followed by indented tree
- Show conditional branches with `PASS →` / `FAIL →` labels
- Keep it readable — if a function has >8 sub-calls, split into sub-diagrams

### Diagram Type 4: Pipeline Position

For showing where the stage sits in the overall pipeline execution order.

```markdown
parse → extract_characters → THIS_STAGE → analyze_scenes → generate_storyboard
                                ↑
                     dependencies: (parse, extract_characters)
                     artifact_input_key: "narrative_timeline"
```

Key rules:
- Linear left-to-right flow with `→`
- `THIS_STAGE` or `↑` marks the current stage
- Dependencies listed below with `↑` connector
- Keep it to a single line for the main flow; add context below

### General Diagram Rules

1. **Always use fenced code blocks** (` ``` `) — never inline monospace
2. **Width**: Keep diagrams ≤ 80 characters wide. If wider, split into sub-diagrams
3. **Horizontal alignment matters** — use consistent indentation for parallel paths
4. **Labels on branches** — every branch point should have a label (PASS/FAIL, success/error, etc.)
5. **Prefer diagrams over prose** for:
   - Data flow between functions/modules
   - Type relationships and inheritance
   - Pipeline topology
   - Conditional branching logic
6. **Don't over-diagram** — simple sequential steps are fine as numbered lists. Reserve diagrams for non-trivial flows with branching, parallelism, or composition.

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

### Step 5: Export Change Summary

After completing the document, append a change entry to `{base_path}/weeks/{current-ISO-week}/{project-slug}.json` following `references/weekly-ppt-convention.md`.

Skill-specific values:
- **type**: `"feature"` (new implementation) or `"decision"` (design choice)
- **source**: `"stage-doc"`
- **related_docs**: path to the generated `{stage_name}-implementation-{YYYY-MM-DD}.md`

If the project slug cannot be determined, skip silently.

## Shared Storage Convention

This skill participates in the weekly-ppt shared storage system alongside `pipeline-doc-generator` and `weekly-change-tracker`. The full schema and storage rules are defined in `references/weekly-ppt-convention.md`.
