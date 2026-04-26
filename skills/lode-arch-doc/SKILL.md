---
name: lode-arch-doc
description: >
  Generate architecture and implementation documentation for pipeline systems.
  Supports two modes — Stage mode for single-stage implementation docs, and Pipeline mode
  for system-wide architecture evolution docs. Triggers on requests like
  "为 X stage 写文档", "stage 实现文档", "stage impl doc", "写架构文档",
  "pipeline 架构演进", "系统架构设计", "architecture doc", "document the pipeline",
  "how does X stage work?", "cross-stage", "写技术文档", "document the design".
  When the request clearly mentions a single stage/component, use Stage mode.
  When it mentions "pipeline", "架构", "跨 stage", "系统", use Pipeline mode.
  When ambiguous, ask the user which mode they need.
  Does NOT trigger for general README/API docs or non-technical writing.
---

# Architecture Documentation Generator

This skill generates technical documentation for pipeline systems in two modes:

- **Stage mode**: Implementation documentation for a single pipeline Stage (13 sections)
- **Pipeline mode**: Architecture evolution documentation for the entire pipeline system (14 sections)

## Mode Selection

Determine the mode from the user's request:

1. **Stage mode** — when the request mentions:
   - A specific stage/component name (e.g. "为 Parse Stage 写文档")
   - "stage 文档", "stage 实现文档", "stage impl doc"
   - "how does X stage work?" (expecting formal docs)
   - Any request clearly scoped to ONE component's internals

2. **Pipeline mode** — when the request mentions:
   - "pipeline", "架构", "架构演进", "架构文档"
   - "cross-stage", "跨 stage", "系统", "system"
   - Multiple stages or the whole system
   - "pipeline 架构演进", "系统架构设计", "architecture evolution"

3. **Ambiguous** — when you cannot determine the mode:
   - Ask the user: "需要生成 Stage 实现文档还是 Pipeline 架构文档？"
   - Do not guess.

## Documentation Structure

### Stage Mode (13 sections, 0-12)

Read `references/stage-implementation-spec.md` for the full specification.

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

### Pipeline Mode (14 sections, 0-13)

Read `references/pipeline-doc.md` for the full specification.

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

Before writing, check if a document already exists in the target `docs/` directory.

- **Stage mode**: look for `lode-stage-{stage_name}-implementation-v*.md`
- **Pipeline mode**: look for `lode-pipeline-evolution-v*.md`

**If it exists**: Read the existing document, compare against current code/system state, identify stale sections. Update affected sections, increment the version number in the filename, refresh `last_updated`. `created_date` stays unchanged. Add a new version entry.

**If not**: Proceed with full document creation (Steps 1-4).

### Step 0.5: Choose Documentation Scope

Judge the complexity to decide the documentation depth:

**Stage mode:**
- **Full mode** (default): Write all 13 sections. Use for new stages, major refactors, complex LLM interactions, validation/repair loops, or cross-stage dependencies.
- **Minimal mode**: Write only sections 0, 1, 2, 5 (simplified), 12. Leave rest as `<!-- TODO: Section N - brief note -->`. Use for simple stages where full doc is disproportionate.

**Pipeline mode:**
- **Full mode** (default): Write all 14 sections. Use for major architectural changes, new stage additions, cross-stage refactoring.
- **Minimal mode**: Write only sections 0, 1, 4, 13. Leave rest as `<!-- TODO: Section N - brief note -->`. Use for minor adjustments.

### Step 1: Gather Context

Before writing, collect relevant information by reading the source code and existing documentation. The code is the **source of truth**.

**Stage mode:**
- Stage name
- Code location (file paths, modules)
- Upstream/downstream dependencies

**Pipeline mode:**
- Evolution scope (new stages? refactoring? bug fixes?)
- Affected stages
- Trigger reason (bad case? eval results? new requirements?)

### Step 2: Read the Template

- **Stage mode**: read `references/stage-implementation-spec.md`
- **Pipeline mode**: read `references/pipeline-doc.md`

### Step 3: Document Each Section

Follow the specification from the relevant reference file. Write sections in order, ensuring each has the required fields and structure.

**Key principles across both modes:**
- **Code is truth** — verify against actual implementation
- **Be specific** — concrete field names, file paths, function names
- **Explain why** — reasoning behind design decisions
- **Be honest** — document issues and limitations transparently
- **JSON examples are mandatory** — for inputs/outputs

### Step 4: Output Format

Save documentation with mode-prefixed filenames, organized by ISO week:

```
docs/{YYYY-WNN}/lode-stage-{stage_name}-implementation-v{N}.md
docs/{YYYY-WNN}/lode-pipeline-evolution-v{version}.md
```

- `{YYYY-WNN}`: current ISO week (e.g. `2026-W17`)
- Update existing documents by incrementing the version number, not by creating new filenames
- The `lode-stage-*` / `lode-pipeline-*` prefix distinguishes the mode

## Visual Documentation

Architectural understanding depends heavily on visual structure. Use ASCII diagrams to make data flows, schemas, and code relationships immediately visible.

### Stage Mode Diagrams

| Section | Diagram Type | Purpose |
|---------|-------------|---------|
| 1. Stage Role in Pipeline | Pipeline Position | Show execution order and dependencies |
| 3. Inputs / 4. Outputs | Schema Hierarchy | Show type relationships and composition |
| 5. Core Processing Flow | Function Call Tree | Show module internals and execution paths |
| 5. Core Processing Flow | Data Flow | Show parallel execution, branching, and merge |
| 6. Prompt/Rule Contracts | Data Flow | Show prompt assembly pipeline |

### Pipeline Mode Diagrams

| Section | Diagram Type | Purpose |
|---------|-------------|---------|
| 2. Current Pipeline Snapshot | Pipeline Structure | Show overall system topology |
| 2. Current Pipeline Snapshot | Data Flow Overview | Show main data paths |
| 4. Key Architectural Changes | Before/After Comparison | Show structural evolution |
| 6. Dataflow and Artifact Evolution | Data Flow Diagram | Show how data moves through stages |

See the Appendix in the relevant reference file (`stage-implementation-spec.md` or `pipeline-doc.md`) for character set, formatting rules, and per-type examples.

## Step 5: Export Weekly Signal

After completing the document, append a report-friendly change entry to `{vault}/raw/weeks/{current-ISO-week}/{project-slug}.json` following the schema in `references/weekly-ppt-convention.md`. Generate the entry JSON, save it to a temporary file, and call the shared helper:

```bash
python <this-skill>/scripts/lode_raw.py append-entry \
  --entry /tmp/lode-arch-doc-entry.json \
  --cwd "$PWD"
```

The helper resolves config, calculates the current ISO week, resolves the project slug, validates required fields, creates the week directory, and appends to the existing project array.

```json
{
  "timestamp": "ISO 8601",
  "type": "feature | fix | refactor | decision | risk",
  "summary": "1 sentence, engineering-level abstraction",
  "context": "1-2 sentences explaining why and impact",
  "related_docs": ["/absolute/path/to/doc"],
  "source": "arch-doc"
}
```

Skill-specific values:
- **type**: `feature` (new capability), `fix` (bug resolved), `refactor` (restructured), `decision` (design choice), or `risk` (issue identified)
- **source**: always `"arch-doc"`
- **related_docs**: absolute path to the generated document

The entry must describe the architecture signal, not the documentation activity:

- **Do write**: "Documented the Parse stage contract split between normalized input, validation, and repair loops"
- **Do not write**: "Generated Parse stage implementation document"
- **summary**: capture the architecture change, technical decision, contract boundary, risk, or system behavior that the document makes explicit
- **context**: explain why that architecture signal matters for future work, debugging, migration, weekly reporting, or cross-stage coordination
- **related_docs**: keep the document path as evidence, not as the main message

**New document**: summary captures the architecture/implementation knowledge newly made explicit. Context explains why that knowledge matters now.

**Updating existing**: summary describes the actual architecture or contract change reflected in the update. Context explains why the previous document was stale or incomplete.

If the document only records a simple component with no report-worthy architecture signal, skip the raw entry rather than writing a low-value "updated docs" entry.

If the helper is unavailable, config cannot be resolved, or the write fails, skip the raw entry side effect silently. The generated architecture document is the primary deliverable.

## Configuration

此 skill 使用 Lode 统一配置系统。从以下位置解析知识库路径（`{vault}`），高优先级优先：

| 优先级 | 位置 | 说明 |
|--------|------|------|
| 1 | `.lode/config.yaml`（项目根目录） | 项目级覆盖 |
| 2 | `~/.lode/config.yaml` | 全局配置 |
| 3 | `$WEEKLY_PPT_PATH` 环境变量 | legacy fallback |
| 4 | `~/.weekly-ppt/` | legacy fallback 默认值 |

项目级配置覆盖全局配置的同名字段。文档输出不依赖 `{vault}`；如果无法解析配置，只跳过 raw change entry 副作用。完整配置格式、合并规则和 helper 命令见 `references/weekly-ppt-convention.md`。

此 skill 的产出路径：
- 文档输出：`docs/{YYYY-WNN}/lode-stage-{name}-implementation-v{N}.md` 或 `docs/{YYYY-WNN}/lode-pipeline-evolution-v{N}.md`（项目仓库内）
- Change entry 写入：`{vault}/raw/weeks/{ISO-week}/{project-slug}.json`

## Shared Storage Convention

Change entries follow the schema in `references/weekly-ppt-convention.md`. Read it for the full field spec and writing guidelines.
