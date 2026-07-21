# Skills

## High-Frequency Reporting

### Daily

`/tracework:daily [work|personal|all]` writes one daily judgment per reporting
group, normally three state-change headlines, complete portfolio coverage, and
the next gate.

### Weekly

`/tracework:weekly [work|personal|all]` writes a management brief by default.
Explicit PPT wording switches to a 6-10 slide outline for an individual
contributor reporting within a department. A core technical result separates
four complementary layers:

- Before/After shows why the change was needed and what state changed.
- A solution-logic diagram shows how data, control, branches, fallbacks, and
  invariants work together.
- An implementation narrative explains that mechanism in execution order.
- Data, tests, or a visible measurement gap show whether the result is
  effective and how mature the evidence is.

Core runtime-mechanism changes must cover all four layers. The main deck keeps
at most two or three logic diagrams; routine maintenance does not receive a
decorative architecture diagram. Logic explains how a solution works, while
independent evidence establishes whether it works. Raw evidence maps remain in
the appendix.

### Monthly

`/tracework:monthly [work|personal|all]` uses raw entries as semantic truth and
Daily/Weekly as prior human judgments. It produces phase arcs, recurring risks,
and next-month closure targets.

## Evidence Foundation

### Capture

`/tracework:capture`, checkpoint wording, or `收工` stores adaptive-depth raw
facts. It does not pre-write separate Daily, Weekly, and Monthly prose.

`/tracework:capture day [YYYY-MM-DD] [scope]` incrementally recovers durable
facts from opt-in local session manifests. Scope partition happens before
transcript reading, and transcript bodies are never copied into the vault.

## Lower-Frequency Trust and Recovery

### Query

Answers a specific why, alternative, revisit, or impact question from cited
local evidence. Unsupported questions return an evidence gap.

### Recall

Restores bounded project context when older work is resumed.

### Roadmap

Builds a long-range narrative over decision threads. It is an advanced review,
not a required reporting step.

### Cold Start

Configures the vault, project identity, and reporting group with the minimum
required questions. Metadata-only session scanning remains an explicit opt-in.
