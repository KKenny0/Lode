# Slide Structure Templates

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
## Slide N: {stream} — 背景 & 问题

### 背景
{narrative.goal}

### 本周核心问题
{narrative.problems}

---

## Slide N+1: {stream} — 关键改动 & 技术方案

### 关键改动
{narrative.key_changes}

### 技术方案
{narrative.technical_approach}

---

## Slide N+2: {stream} — 成果 & 下一步

### 成果
{narrative.result}

### 风险 & 下一步
{narrative.risk_and_next}
```

### Compact layout (2-3 streams — 2-3 slides each)

Background and problems are merged into the key changes slide to save space. Technical approach retains its own section with full diagrams.

```markdown
## Slide N: {stream} — 背景 & 关键改动

### 背景
{narrative.goal}

### 本周核心问题
{narrative.problems}

### 关键改动
{narrative.key_changes}

---

## Slide N+1: {stream} — 技术方案 & 成果

### 技术方案
{narrative.technical_approach}

---

## Slide N+2: {stream} — 成果 & 下一步

### 成果
{narrative.result}

### 风险 & 下一步
{narrative.risk_and_next}
```

## Report Mode (4-part, 2-3 slides per stream)

```markdown
## Slide N: {stream} — 目标 & 关键改动

### 本周目标
{narrative.goal}

### 关键改动
{narrative.key_changes}

---

## Slide N+1: {stream} — 成果 & 下一步

### 成果
{narrative.result}

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

One bullet per work stream (or per project in multi-project mode):

```markdown
## Slide 2: 本周总览

- **stream-a：** {narrative.goal} (one sentence)
- **stream-b：** {narrative.goal} (one sentence)
- **stream-c：** {narrative.goal} (one sentence)
```

Natural cross-project/cross-stream themes are fine here when they genuinely emerge, but don't force connections that don't exist.

### Summary (Final Slide)

```markdown
## Slide N: 总结 & 下一步

### 全局状态

| 工作项 | 状态 | 关键进展 |
|--------|------|----------|
| stream-a | {current_status} | {key_changes summary} |
| stream-b | {current_status} | {key_changes summary} |

### 各工作项下一步

- **stream-a：** {narrative.risk_and_next}
- **stream-b：** {narrative.risk_and_next}

### 决策与开放问题

| 信号 | 状态 | 下周影响 |
|------|------|----------|
| {decision/open question/risk} | carried-forward / revisited / resolved | {next-week planning impact} |

### 本周难点

仅当本周 raw entries 支持至少一个风险、反复开放问题、陈旧线程或值得重看的放弃方案时出现。没有证据时整段省略。

| 难点 | 证据 | 下周动作 |
|------|------|----------|
| {risk/open question/stale thread} | {raw timestamp or entry summary} | {planning impact} |
```

## Commit Appendix (Optional)

Include a commit table at the end for verification. Mark it clearly so the presenter knows it's reference material, not slide content.

```markdown
---

## 附录：本周 Commit 清单（仅供核实，不入 PPT）

| Hash | Message |
|------|---------|
| abc1234 | feat(xxx): description |
```

## Slide Budget

Slides per stream, driven by each stream's content density (not total stream count):

| Density | Criteria | Slides |
|---|---|---|
| Rich | 4+ raw entries, **or** arch-doc evidence + clear tech approach + diagrams | 3-4 |
| Moderate | 2-3 entries, mixed session-recap and arch-doc | 2-3 |
| Light | 1 entry, or fallback-only from git | 1-2 |
| Empty | 0 meaningful changes after filtering | merge into overview |

When streams share close context, consider merging their slides to avoid redundancy.

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
