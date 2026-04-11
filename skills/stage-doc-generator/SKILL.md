---
name: stage-doc-generator
description: Generate Stage implementation documentation following the 12-section structure defined in stage-implementation-spec.md. Use this skill whenever the user asks to write, create, or generate documentation for a Stage, implementation doc for a stage, stage specification, or any document describing how a pipeline stage works. Also triggers for requests like "为 X Stage 写文档"、"stage 实现文档"、"stage impl doc", or when documenting stage behavior, responsibilities, inputs/outputs, or processing flow. Even if the user doesn't explicitly mention "implementation" but is asking for stage-related technical documentation that covers responsibilities, pipeline position, or contracts, use this skill.
---

# Stage Implementation Documentation Generator

This skill guides you through creating comprehensive Stage implementation documentation following a standardized 12-section structure.

## When to Use

Use this skill when:
- User asks to write/create/generate Stage implementation documentation
- User mentions "stage doc", "stage 实现文档", "stage implementation spec"
- User wants to document a stage's responsibilities, inputs/outputs, or behavior
- User asks "how does X stage work?" and expects formal documentation
- User says "为 X stage 写文档" or similar Chinese phrasing

## Documentation Structure

**CRITICAL**: Always follow the 12-section structure defined in `references/stage-implementation-spec.md`. Each section serves a specific purpose:

1. **Document Meta** - Version tracking and ownership
2. **Stage Role in Pipeline** - Execution position and dependencies
3. **Responsibilities and Non-Goals** - Scope boundaries
4. **Inputs and Upstream Dependencies** - Input contracts (4 layers)
5. **Outputs and Downstream Contracts** - Output promises
6. **Core Processing Flow** - Step-by-step breakdown
7. **Prompt/Rule/Reference Contracts** - Model constraints
8. **Validation, Repair, and Failure Handling** - Error resilience
9. **Observability and Debugging** - How to troubleshoot
10. **Compatibility and Migration Notes** - Version evolution
11. **Known Issues and Open Questions** - Honest status
12. **Source of Truth** - Code vs documentation

## Writing Workflow

### Step 1: Gather Context

Before writing, collect:
- **Stage name** - Which stage is being documented?
- **Code location** - Where is the stage implemented?
- **Current state** - Is this a new stage or documenting existing code?

Read the source code to understand actual implementation. The code is the **source of truth**.

### Step 2: Read the Template

Always read `references/stage-implementation-spec.md` before starting. This contains the full specification for each section with required fields and examples.

### Step 3: Document Each Section

Follow this order:

**Section 0: Document Meta**
- `stage_name`: Name of the stage
- `doc_version`: Start at 1.0.0
- `created_date`: Document creation date (YYYY-MM-DD)
- `last_updated`: Last modification date (YYYY-MM-DD, same as created_date for new docs)
- `owner`: Stage owner/team
- `related_code_paths`: File paths
- `related_prompts`: Prompt files used
- `related_schemas`: Data structures
- `upstream_stages`: List
- `downstream_stages`: List
- `default_enabled`: true/false

**Section 1: Stage Role in Pipeline**
Describe:
- Execution order (dependencies)
- Parallel capability
- Skip conditions
- Cache behavior
- Rerun mechanism
- **Must include a Pipeline Position diagram** (see Visual Documentation section)

**Section 2: Responsibilities and Non-Goals**
Clear boundaries:
- **Responsibilities**: Semantic-level outputs, not technical actions
- **Non-Goals**: Explicitly list what's NOT this stage's job
- **Boundary**: Input assumptions and output contracts

**Section 3: Inputs (4 layers)**
- 3.1 Runtime Inputs (API fields, config overrides)
- 3.2 Upstream Artifacts (dependencies with source stages)
- 3.3 Schema Dependencies (data structures, required vs optional)
- 3.4 External Knowledge/Reference (reference files, templates)

**Section 4: Outputs (2 parts)**
- 4.1 Primary Outputs (schema, semantics, JSON example)
- 4.2 Secondary Outputs (metadata, warnings, diagnostics)

**Section 5: Core Processing Flow**
Break down into 8 steps:
1. Input preparation
2. Prompt/Rule construction
3. LLM/Algorithm execution
4. Parsing and structuring
5. Normalization
6. Validation
7. Repair
8. Output artifact

Each step must map to code modules/functions and specify inputs/outputs.

**Must include visual diagrams** (see Visual Documentation section):
- Function Call Tree for the main orchestration entry point
- Data Flow Diagram if there's concurrency, fan-out, or branching (PASS/FAIL)
- Per-module code explanation blocks with file path, responsibility, inputs, outputs

**Section 6: Contracts (3 layers)**
- 6.1 Prompt Design (system/user prompt roles, constraints)
- 6.2 Rule Layer (non-LLM rules, post-processing)
- 6.3 Reference Layer (what knowledge reference files provide)

**Section 7: Validation and Repair**
- 7.1 Validation Types (schema, semantic, coverage, alignment)
- 7.2 Failure Modes (common failures, detection)
- 7.3 Repair Strategy (trigger, input, limits, fallback)
- 7.4 Failure Output (error/partial result behavior)

**Section 8: Observability**
- 8.1 Logging (key fields, stage usage)
- 8.2 Artifacts (output paths, debug files)
- 8.3 Debug Guide (step-by-step troubleshooting)

**Section 9: Compatibility**
Document:
- Input/output/semantic changes from previous version
- Whether historical data needs rerun
- Schema migration requirements
- Risks (cache incompatibility, downstream breaks)

**Section 10: Known Issues**
Three categories:
- 10.1 Known Issues (actual problems in production/samples)
- 10.2 Limitations (structural design constraints)
- 10.3 Open Questions (undecided design directions)

**Section 11: Versioned Changes**
Use a table:
| version | change | type | impact_input | impact_output | downstream_impact | need_rerun |

Types: feature, refactor, bugfix, behavior_change

**Section 12: Source of Truth**
List:
- Code paths (most authoritative)
- Config files
- Prompt files
- Reference files
- CHANGELOG

Always include: "本文档仅为解释性描述，实际行为以代码为准"

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

## Principles

1. **Code is truth** - Always verify against actual implementation
2. **Be specific** - Use concrete field names, file paths, function names
3. **Explain why** - Don't just list what; explain the reasoning
4. **Be honest** - Document known issues and limitations transparently
5. **Keep current** - Update doc_version and last_updated when changing; created_date never changes

## Common Mistakes to Avoid

- **Don't** copy-paste without understanding - read the code first
- **Don't** skip sections - all 12 sections are required
- **Don't** be vague - use concrete names and paths
- **Don't** hide problems - known issues should be documented
- **Don't** forget examples - JSON examples for inputs/outputs are mandatory

## After Writing

1. Verify all 12 sections are complete
2. Check that code paths actually exist
3. Ensure JSON examples are valid
4. Confirm source of truth points to correct locations

### Step 5: Export Change Summary

After completing and verifying the document, export a change summary entry so downstream tools (like weekly report generators) know this doc was produced.

Read `references/weekly-ppt-convention.md` for the full schema and storage rules. Generate a single entry:

- **type**: `"feature"` (documenting a new implementation) or `"decision"` (documenting a design choice)
- **summary**: 1 sentence — what stage was documented and what it does
- **context**: 1-2 sentences — why this stage matters and its downstream impact
- **related_docs**: path to the generated `{stage_name}-implementation-{YYYY-MM-DD}.md`
- **source**: `"stage-doc"`

Append the entry to `~/.weekly-ppt/weeks/{current-ISO-week}/{project-slug}.json`.

If the project slug cannot be determined (no `~/.weekly-ppt/projects.json`, no clear project context), skip this step silently. The documentation is the primary deliverable; the change summary is a side effect.

## Shared Storage Convention

This skill participates in the weekly-ppt shared storage system alongside `pipeline-doc-generator` and `weekly-change-tracker`. The full schema and storage rules are defined in `references/weekly-ppt-convention.md`.
