# Slide Structure Templates

## Shared 3+1 Reporting Backbone

Both modes use report-local traceability IDs assigned during final stitching:

```text
O# outcome/progress
  └─ W# supporting work stream
       └─ D# decision/trade-off
            └─ E# concrete evidence
```

Use at most three `O#` items in the entire report. An `O#` marked
`outcome` must pass the Fruit Check: it names an observable state change,
deliverable, recorded effect, or demonstrably removed risk. Expected impact is
prospective. Fallback-only work is `limited` progress/activity, never an
outcome.

Evidence grades:

- `verified`: raw claim plus direct independent verification that substantiates
  the claim's actual wording, not merely a related change.
- `recorded`: raw entry records status and impact without independent verification.
- `limited`: fallback-only or semantically incomplete; phrase as progress/activity.

Every meaningful `W#` appears even when it does not support an `O#`; label it
`exploration`, `maintenance`, or `activity`. Every material claim maps to one or
more `E#` items in the evidence appendix.

## Slide Format

Use `## Slide N: Title` for slide headings, separated by `---`:

```markdown
---

## Slide N: Slide Title

{content}

---

## Slide N+1: Next Slide Title

{content}
```

Slide numbering starts from 1. The title page is Slide 1, overview is Slide 2, and so on.

## Tech Mode (6-part)

### Full layout (1 stream — 3-4 slides)

```markdown
## Slide N: W# {stream} — 背景 & 问题

### 背景
{narrative.goal}

**向上关联：** {O# references, or "未收口：exploration/maintenance/activity"}

### 本周核心问题
{narrative.problems}

---

## Slide N+1: W# {stream} — 关键改动 & 技术方案

### 关键改动
{narrative.key_changes}

### 技术方案
{narrative.technical_approach}

### 决策与取舍

| ID | 选择 | 放弃/延后 | 原因 | 解释状态 |
|----|------|-----------|------|----------|
| D# | {choice} | {alternative} | {why} | explicit / inferred |

---

## Slide N+2: W# {stream} — 成果/进展 & 下一步

### 成果/进展
{narrative.result}（关联 {O# or "未形成 headline"}，证据见 {E# references}）

### 风险 & 下一步
{narrative.risk_and_next}
```

### Standard layout (multi-stream default — 2 slides each)

The default for most streams in a multi-stream week. Separates context+approach
from results+next. Every non-trivial stream gets at least this layout.

```markdown
## Slide N: W# {stream} — 背景 & 方案

### 背景
{narrative.goal}

**向上关联：** {O# references, or "未收口：exploration/maintenance/activity"}

### 本周核心问题
{narrative.problems}

### 关键改动
{narrative.key_changes}

### 技术方案
{narrative.technical_approach}

### 决策与取舍
{D# choices, alternatives, reasons, and explicit/inferred status}

---

## Slide N+1: W# {stream} — 成果/进展 & 下一步

### 成果/进展
{narrative.result}（证据见 {E# references}）

### 风险 & 下一步
{narrative.risk_and_next}
```

### Compact layout (5+ streams — 2 slides each)

For weeks with many streams where each needs to stay concise.
Background and problems are merged into the key changes section.
Technical approach is inline rather than diagram-heavy.

```markdown
## Slide N: W# {stream} — 背景 & 关键改动

### 背景
{narrative.goal}

**向上关联：** {O# references, or "未收口：exploration/maintenance/activity"}

### 关键改动
{narrative.key_changes}

### 技术方案
{narrative.technical_approach}

### 决策与取舍
{D# concise choices and alternatives}

---

## Slide N+1: W# {stream} — 成果/进展 & 下一步

### 成果/进展
{narrative.result}（证据见 {E# references}）

### 风险 & 下一步
{narrative.risk_and_next}
```

## Report Mode (4-part, 2-3 slides per stream)

```markdown
## Slide N: W# {stream} — 目标 & 关键改动

### 本周目标
{narrative.goal}

**向上关联：** {O# references, or "未收口：exploration/maintenance/activity"}

### 关键改动
{narrative.key_changes}

### 关键决策
{D# choice, trade-off, and reason; keep concise}

---

## Slide N+1: W# {stream} — 成果/进展 & 下一步

### 成果/进展
{narrative.result}（证据见 {E# references}）

### 下一步
{narrative.risk_and_next}
```

## Common Slides

### Title (Slide 1)

```markdown
## Slide 1: 标题页

## 本周工作汇报

**日期：** YYYY-MM-DD ~ YYYY-MM-DD | **范围：** project-a / project-b
```

### Overview (Slide 2)

Show at most three report-wide headline items. Use `成果` only for claims that
pass the Fruit Check; otherwise use `进展`. If none qualify as outcomes, say
“本周无可核验的完成成果” and show bounded progress instead.

```markdown
## Slide 2: 本周成果与进展

| ID | 类型 | 成果/进展 | 影响 | 证据等级 | 支撑主线 |
|----|------|-----------|------|----------|----------|
| O1 | outcome / progress | {observable claim} | {recorded or prospective impact} | verified / recorded / limited | W1, W2 |
| O2 | outcome / progress | {observable claim} | {impact} | verified / recorded / limited | W3 |
| O3 | outcome / progress | {observable claim} | {impact} | verified / recorded / limited | W4 |

Omit unused rows; never invent an item to fill the table.

### 未收口工作

- **W# exploration / maintenance / activity：** {brief explanation}
```

Natural cross-project/cross-stream themes are fine here when they genuinely emerge, but don't force connections that don't exist.

### Summary (Final Slide)

```markdown
## Slide N: 总结 & 下一步

### 全局状态

| 工作主线 | 向上关联 | 状态 | 关键进展 |
|----------|----------|------|----------|
| W1 stream-a | O1 | {current_status} | {key_changes summary} |
| W2 stream-b | 未收口：exploration | {current_status} | {key_changes summary} |

### 各工作项下一步

- **W1 stream-a：** {narrative.risk_and_next}
- **W2 stream-b：** {narrative.risk_and_next}

### 决策与开放问题

| 信号 | 状态 | 下周影响 |
|------|------|----------|
| D# {decision/open question/risk} | carried-forward / revisited / resolved | {next-week planning impact} |

### 本周难点

仅当本周 raw entries 支持至少一个风险、反复开放问题、陈旧线程或值得重看的放弃方案时出现。没有证据时整段省略。

| 难点 | 证据 | 下周动作 |
|------|------|----------|
| {risk/open question/stale thread} | {raw timestamp or entry summary} | {planning impact} |
```

## Claim-level Evidence Appendix

Always include a claim-level evidence map after the slides. It is reference
material, not slide content. Deduplicate sources into `E#` IDs, and link every
material `O#`, `W#`, and `D#` claim to its source. A raw commit list without
claim links does not satisfy this contract.

```markdown
---

## 附录：主张—证据映射（仅供核验，不入 PPT）

| 主张 | 表述 | 证据 | 来源类型 | 核验说明 |
|------|------|------|----------|----------|
| O1 | {outcome/progress claim} | E1, E2 | raw + test | {why this grade is justified} |
| W1 | {work-stream claim} | E1, E3 | raw + commit | {scope/status support} |
| D1 | {decision/trade-off} | E4 | raw/artifact | {explicit or inferred} |

### Evidence index

| ID | 来源类型 | 引用 |
|----|----------|------|
| E1 | raw entry | {timestamp + entry summary or durable raw reference} |
| E2 | test/eval | {test or eval result reference} |
| E3 | commit | {hash + subject} |
| E4 | artifact | {source-of-truth path or artifact reference} |
```

Do not upgrade a raw-entry reference to independent verification merely because
the entry contains `evidence_refs`; verify the referenced source type. A commit
may appear here when it supports a claim, but never as an unconnected dump.

## Slide Budget

Slides per stream, driven by each stream's narrative density (not total stream count):

| Density | Criteria | Slides | Layout |
|---|---|---|---|
| Rich | 4+ raw entries, **or** any entry with `artifact_context` / `exploration_paths` / `root_cause` + `abandoned_alternatives` — these carry full narrative arcs even in a single entry | 3-4 | Full |
| Moderate | 2-3 entries with some archetype depth, **or** 1 entry with `root_cause` + `open_questions` (repair/investigation singletons) | 2 | Standard |
| Light | 1 maintenance entry without archetype depth, or fallback-only from git | 2 | Standard |
| Empty | 0 meaningful changes after filtering | merge into overview | — |

Never classify a single repair/investigation/decision entry as Light just
because the count is 1. Archetype depth (root_cause, exploration_paths,
abandoned_alternatives, artifact_context) matters more than entry count.

When streams share close context (e.g. a bug fix stream and the feature it
fixes), consider merging their slides to avoid redundancy — but do not merge
purely to reduce slide count.

### Sub-phase pattern (within a stream)

When a rich stream spans multiple phases (e.g. a 4-day iterative build with
distinct milestones), use sub-headings within the key_changes and
technical_approach sections instead of creating separate streams:

```markdown
## Slide N: {stream} — 关键改动

### Phase 1: {sub-phase name} ({date range})
{phase 1 key_changes}

### Phase 2: {sub-phase name} ({date range})
{phase 2 key_changes}
```

Use sub-phases when:
- The phases address different problems or use different approaches
- A reviewer would discuss them as sequential milestones
- Splitting into separate streams would lose the unified goal

Sub-phases share the stream's goal but each has its own key_changes and
technical_approach.

## Content Density Guide

There's no hard character limit — the right amount of content depends on what the presenter needs to explain. That said:

- **A slide should map to ~1-2 minutes of presenting.** If it would take 5 minutes to talk through, split it.
- **Diagrams > prose.** An ASCII flow chart or comparison diagram conveys more in less space and is more readable on screen.
- **Background & Problems slides** should be lean — set the stage, don't write the documentation.
- **Key Changes & Technical Approach** slides carry the weight — this is where depth is appropriate.
- **If a section feels like a wall of text**, ask: can this be a diagram? Can parts move to the appendix?
- **Compounding matters**: include decisions revisited, open questions carried
  forward, and hard problems that alter next-week planning. Weekly output should
  change what the team does next, not only summarize what happened.
- **Lower confidence**: label fallback git-only streams as lower confidence when
  raw entries are absent.
