---
layout: home

hero:
  name: Lode
  text: Git 记录了改了什么。Lode 让下一个 coding agent 知道为什么。
  tagline: 安装、运行 demo、捕获一次 session，然后用本地证据 query 一个 decision。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/quick-start
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/KKenny0/Lode

features:
  - title: Decision Replay
    details: 追问为什么选择某条路径，从本地 raw entries 与派生决策索引中得到带引用证据。
    icon: 🔍
  - title: 持久记忆
    details: 收工时捕获决策、放弃的路径、风险和开放问题。已有历史后再在开工时回忆。
    icon: 💎
  - title: 逐层收口
    details: 把 session 信号归并成工作主线和可汇报成果，同时保留向下核验的决策、取舍与证据。
    icon: 📈
  - title: 零配置启动
    details: 一条命令捕获第一个会话。无需 vault。结构化 Markdown 直接出现在对话中。
    icon: ⚡
---

## 技术职场场景：逐层收口

**向上逐层收口，向下穿透核验。**

Lode 把 AI 协作中的散乱工作，组织成可汇报、可核验的成果；需要追问时，
可以沿着成果回到决策、取舍与证据。

```text
向上汇报：session signals → 工作主线 → 成果与影响
向下核验：成果与影响 → 决策与取舍 → source refs
```

它面向需要解释技术工作的开发者、tech lead 和小型技术团队。活动数量只能说明
记录覆盖度，不能单独证明成果；Lode 也不扩张到会议、审批或绩效监控等泛职场流程。

## 技能

每个技能对应一个你已经有的习惯。通过命名空间命令激活。

| 技能 | 何时 | 作用 |
| :--- | :--- | :--- |
| `/lode:cold-start-interview` | 首次运行 | 创建 `~/.lode/config.yaml`，配置 vault 路径、项目标识和报告偏好 |
| `/lode:capture` | 收工或阶段记录 | 安静捕获会话深度、阶段进展和制品 |
| `/lode:query` | 定向追问 | 用带引用的 decision replay evidence 回答"当时为什么这么选？" |
| `/lode:recall` | 已有历史后的开工 | 回忆最近的决策、风险、开放问题和相关文档 |
| `/lode:roadmap` | 多个决策之后 | 生成叙事性决策路线图，包含累积风险 |
| `/lode:daily` | 每天，按需 | 从原始条目和 git 历史更新 Obsidian 日报 |
| `/lode:weekly` | 每周，按需 | 从原始条目构建周报大纲，包含条件性的困难章节 |
| `/lode:monthly` | 每月，按需 | 从重复证据生成月度回顾和候选规则 |

## Replay Loop

```text
安装 → demo → capture 一次 session → query 一个 decision
```

这是第一条价值路径。周报、月报、recall 和 roadmap 都是同一份本地记录之上的
复利层。技能相互独立，但共享一套存储约定，使下游视图可以复用早期证据。

## Decision Replay

Lode 已经用自己的项目历史 dogfood 派生决策回放索引。raw entries 仍然是事实源; `{vault}/raw/decisions/{slug}.json` 为 coding agent 提供回答"当时为什么这么选？"的紧凑证据包。

查看 [GitHub 上的 dogfood proof](https://github.com/KKenny0/Lode/blob/main/examples/decision-replay-proof.md)。

## 安装

```bash
codex plugin marketplace add KKenny0/Lode
npx @lode/cli install-codex-plugin
```

然后运行 demo，运行一次 `/lode:cold-start-interview`，用 `收工` 捕获一次真实
session，再用 `/lode:query` 追问一个 decision。

没有 vault? 没问题。`收工` 会直接在对话中输出结构化 Markdown。
配置 vault 后 capture 默认安静写入；长 session 中途可以用 `/lode:capture checkpoint`。
