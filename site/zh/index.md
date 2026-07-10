---
layout: home

hero:
  name: Tracework
  text: 把 Agent 工作收口成有证据的报告。
  tagline: 日报、周报和月报是主产品；工作被追问时，再回放其中的决策与依据。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/quick-start
    - theme: alt
      text: 查看工作流
      link: /zh/workflow

features:
  - title: 收口今天
    details: 解释今天改变了什么、为什么重要、还差哪一道门、下一步是什么。
  - title: 形成本周判断
    details: 选择少数结果弧线，同时在组合状态里保留其余有意义的工作。
  - title: 回顾阶段
    details: 从 raw facts 生成月度成果、反复风险和下月收口目标。
  - title: 下钻证据
    details: 安静 capture 本地事实，只在报告被追问或继续旧工作时回放 why。
---

<section class="tw-command-panel">

```bash
codex plugin marketplace add KKenny0/Tracework
codex plugin add tracework@tracework
```

<p>公开 namespace 是 <code>tracework</code>，记录留在你自己的本地 vault。</p>

</section>

## Reporting-First Loop

```text
Agent 工作 -> capture 持久事实 -> Daily -> Weekly -> Monthly
                                  \-> 需要时 Query / Recall
```

项目声明 `work`、`personal` 等 reporting group。报告先分区，再选择 headline，个人
项目不会挤占或泄漏进公司汇报；私人 `all` 视图会把各组放在独立叙事中。

Tracework 仍由 decision replay 提供可信度，但 Query 和 Recall 不需要成为每天的习惯。

## 边界

Tracework 不是会议纪要、审批流、绩效包装、泛办公室套件或员工监控。活动数量只能
说明覆盖度，不能证明成果。
