# Weekly Department Slide Outline Template

Use only for **slides** mode when the user explicitly asks for PPT, slides, or
an演示大纲. Never load this file for **quick** or default **brief** weekly
output.

Read `reporting-narrative-contract.md` first. The default presenter is an
individual contributor reporting inside a department to managers and peers.

The main deck contains 6-10 slides per reporting group. The evidence and
technical appendices are outside the budget. Do not allocate one slide per work
stream. Allocate slides by the conclusions the audience must understand.

## Presentation Contract

Core technical results use this sequence:

```text
为什么改          如何工作                    是否有效
Before/After  ->  方案逻辑图 + 实施叙事  ->  数据或验证结果
```

- A normal result covers at least two of the three parts.
- A result with `solution_logic.significance=core` covers all three and adds a
  complete implementation narrative.
- A simple result may combine Before/After and Solution Logic on one slide.
- A complex result separates the state/result slide from its logic slide.
- Keep at most two to three solution-logic diagrams in the main deck. Put the
  rest in the technical appendix.
- A logic diagram contains material branches, fallbacks, or invariants. Actor
  names connected by decorative arrows do not pass.
- A logic diagram proves only how a solution works. Data, tests, or observed
  evidence must separately support whether it worked.
- Evaluate this coverage across the result's associated slides. Do not force
  Before/After, the diagram, the narrative, and result evidence onto one page.
- Keep each implementation-narrative block to one or two sentences. Put fuller
  mechanism detail in the technical appendix; each block must stay within 600
  Unicode characters.
- Each slide has one conclusion title and at most one primary visual.

## Main Deck

```markdown
## Slide 1｜{本周主线结论}

**日期：** YYYY-MM-DD ~ YYYY-MM-DD
**范围：** {reporting group and projects}
**汇报视角：** 部门内团队成员

{One sentence stating the week's central state change.}

---

## Slide 2｜{阶段判断结论}

**阶段判断：** {mechanism, effect, and production-acceptance boundary}

### 关键结果

| 结果 | 当前状态或数字 | 成熟度 | 最大门槛 |
|---|---|---|---|
| {result} | {supported number or bounded state} | 机制 / 效果 / 生产 | {gate} |

**需要协作：** {bounded support request or 当前无需要升级的协作事项。}

---

## Slide N｜{Before/After supported conclusion}

**推荐视觉：** Before/After {process | failure path | state | architecture}

**改造前：** {supported starting state}
**关键改变：** {intervention}
**改造后：** {supported end state}
**实施说明：** {only for a result with `solution_logic.significance=core | supporting`; compress its existing `implementation_narrative` into two sentences without creating a separate narrative field}
**部门价值：** {delivery, quality, risk, cost, collaboration, or iteration meaning}
**成熟度：** 机制 {state} / 效果 {state} / 生产验收 {state}
**剩余门槛：** {gate}
**证据边界：** {verified | recorded | limited}

---

## Slide N｜{Solution Logic supported conclusion}

**推荐视觉：** {sequence | swimlane | data flow | decision tree | failure path | state machine | architecture}

{solution-logic diagram containing the trigger, actors, ordered flow, material
branches, fallbacks, output, invariants, and remaining boundary}

### 实施说明

1. **正常路径：** {implementation_narrative.normal_path}
2. **分支与回退：** {implementation_narrative.branch_and_fallback}
3. **输出与约束：** {implementation_narrative.outcome_and_invariant}

**验证结论：** {supported data or test result, followed by the measurement gap when effect evidence is incomplete}
**页面结论：** {why this mechanism addresses the original problem}

Keep source locations, raw evidence ids, commit hashes, and internal links in
the evidence appendix for the default department deck. An explicitly requested
technical-review deck may show sanitized compact references.

---

## Slide N｜{Metric or validation supported conclusion}

**推荐视觉：** {number_card | comparison_chart | distribution_chart | trend_chart | timeline_chart | waterfall_chart}

### 图表数据

| 指标 | 基线 | 当前 | 变化 | 单位 |
|---|---:|---:|---:|---|
| {metric} | {baseline} | {current} | {delta} | {unit} |

**图表结论：** {only the conclusion supported by the data}
**样本范围：** {sample scope}
**评估方法：** {method}
**口径说明：** {comparability conditions or limitations}
**证据边界：** {observed/recorded/expected + grade}
**待验证效果：** {gap and closure criterion, or none}

If comparable numeric evidence is absent, replace the table with a validation
result and measurement plan. Never emit guessed numbers.

---

## Slide N｜{Portfolio conclusion}

| 工作项 | 本周形成的变化 | 部门价值 | 成熟度 | 需要关注 |
|---|---|---|---|---|
| {stream} | {bounded change} | {value or none supported} | {maturity} | {gate or none} |

Only use this slide when the portfolio materially helps the department
understand coverage or allocation. Otherwise keep it in the appendix.

---

## Slide N｜{Risk and collaboration conclusion}

| 风险或门槛 | 可能影响 | 当前控制 | 关闭标准 | 责任边界 |
|---|---|---|---|---|
| {risk} | {impact} | {control} | {pass/fail criterion} | 本人 / 团队协作 / 管理决策 |

**当前不需要升级：** {items or none}

---

## Slide N｜{Next-week acceptance conclusion}

| 验收目标 | 验收方法 | 完成定义 | 未通过时的下一步 |
|---|---|---|---|
| {target} | {method} | {closure criterion} | {branch} |

**下周期望阶段变化：** {from current maturity to intended maturity}
```

## Visual Routing Rules

- concurrency, asynchronous work, or stage collaboration -> sequence/swimlane;
- data processing, aggregation, or materialized rebuild -> data flow;
- provider, model, policy, or strategy dispatch -> decision tree;
- failure handling and fallback -> failure path;
- lifecycle or state transition -> state machine;
- component responsibility change -> architecture relationship;
- comparable outcome data -> an appropriate result chart;
- no reliable result data -> mechanism diagram plus measurement plan, not a
  fabricated chart.

Parameter tuning, small refactors, cleanup, and configuration edits that do not
change runtime behavior remain portfolio items. Do not force an architecture
diagram or implementation narrative for visual variety.

For `all`, create separate group mini-decks with their own judgment, result
selection, logic-diagram budget, portfolio, closure targets, and evidence map.
Never place work and personal projects in one headline ranking or evidence map.

After the deck, append:

1. technical solution details not selected for the main deck;
2. metric definitions, samples, full data, and validation caveats;
3. the same claim-level evidence map defined in `weekly-brief-template.md`.

Keep `O#`, `W#`, `D#`, and `E#` in appendices or small footer references rather
than the spoken headline.
