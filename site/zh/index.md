---
layout: home

hero:
  name: Tracework
  text: 汇报并回放 agent work。
  tagline: 先生成可用的工作报告，再 capture 关键 session 证据，让后续 agent 可以追问、召回、复盘和生成 roadmap。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/quick-start
    - theme: alt
      text: 查看工作流
      link: /zh/workflow

features:
  - title: 留下工作痕迹
    details: 当 session 值得沉淀时，保留决策、放弃路径、风险、artifact、source refs 和下一步。
  - title: 追问本地记录
    details: 当记录足够时，用带引用的本地证据回答为什么选择这条路。
  - title: 继续推进工作
    details: 把 raw record 和 limited git coverage 转成 recall context、brief、review 和 roadmap，同时保留向下核验路径。
  - title: 保持本地
    details: Markdown 和 JSON 写入你自己的 vault，不依赖远程服务或托管数据库。
---

<section class="tw-command-panel">

```bash
codex plugin marketplace add KKenny0/Tracework
codex plugin add tracework@tracework
```

<p>公开 namespace 是 <code>tracework</code>。配置写在 <code>.tracework</code> 下，记录留在你自己的 vault。</p>

</section>

## Work Trace Loop

```text
先报告或追问当前工作 -> capture 关键 session -> 提升后续报告和决策证据
```

Tracework 服务的是需要留下工作痕迹的 agent session：做过哪些选择，放弃过哪些
路径，引用了哪些证据，留下了哪些风险，下一步应该继续哪里。Coding 是最强场景，
但研究、写作和产品叙事只要包含决策与证据，也能使用同一套记录结构。
日报和周报可以先从 git fallback coverage 开始，但这些 claim 会保持 `limited`，
直到 raw entries 解释清楚为什么。

## 证据链

| 层级 | 问题 | Tracework surface |
| :--- | :--- | :--- |
| Report fallback | 现在能汇报什么？ | `/tracework:daily`, `/tracework:weekly`, `/tracework:monthly` |
| Raw record | 关键 session 里发生了什么？ | `/tracework:capture` |
| Decision evidence | 为什么这样选，而不是那样？ | `/tracework:query` |
| Work context | 后续工作要继承什么？ | `/tracework:recall` |
| Brief / review | 改变了什么，哪里有风险，下一步是什么？ | `/tracework:weekly`, `/tracework:monthly` |
| History | 决策如何演变？ | `/tracework:roadmap` |

## 边界

Tracework 不是会议纪要、审批流、泛办公室套件、绩效包装或员工监控。它不会把
活动数量包装成成果。它保留证据，让后来的读者可以检查工作判断。
