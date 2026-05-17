---
layout: home

hero:
  name: Lode
  text: Agentic coding 的持久记忆
  tagline: 记录为什么，然后将其积累为报告、回顾和决策路线图。
  image:
    src: /mark.svg
    alt: Lode
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/quick-start
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/KKenny0/Lode

features:
  - title: 持久记忆
    details: 在每次收工时捕获决策、放弃的路径、风险和开放问题。在开工时自动回忆。
    icon: 🧠
  - title: 决策回溯
    details: 超越 git diff。用叙事性决策路线图重建代码背后的推理过程。
    icon: 🗺️
  - title: 积累报告
    details: 原始条目积累为周报大纲、月度回顾和候选规则。每一层都建立在前一层之上。
    icon: 📊
  - title: 零配置启动
    details: 一条命令捕获你的第一个会话。无需 vault — 结构化 Markdown 直接出现在对话中。
    icon: ⚡
---

## 技能

每个技能对应一个你已经有的习惯。通过命名空间命令激活。

| 技能 | 何时 | 作用 |
| :--- | :--- | :--- |
| `/lode:cold-start-interview` | 首次运行 | 创建 `~/.lode/config.yaml`，配置 vault 路径、项目标识和报告偏好 |
| `/lode:recall` | 会话开始 | 回忆最近的决策、风险、开放问题和相关文档 |
| `/lode:capture` | 每次收工 | 分类会话原型，捕获决策/修复深度，索引制品 |
| `/lode:daily` | 每天，按需 | 从原始条目和 git 历史更新 Obsidian 日报 |
| `/lode:weekly` | 每周，按需 | 从原始条目构建周报大纲，包含条件性的困难章节 |
| `/lode:monthly` | 每月，按需 | 从重复证据生成月度回顾和候选规则 |
| `/lode:roadmap` | 按需 | 生成叙事性决策路线图，包含累积风险 |

## 习惯循环

```text
开工 (recall) → 实现探索 (work) → 收工 (capture) → 周期复盘 (review)
```

周报、月度和路线图输出是这一循环之上的积累层。技能相互独立 — 每个都能单独使用，但它们共享一套本地存储约定，使下游报告可以复用早期上下文。

## Decision Replay Proof

Lode 已经用自己的项目历史 dogfood 派生决策回放索引。raw entries 仍然是事实源；
`{vault}/raw/decisions/{slug}.json` 为 coding agent 提供回答“当时为什么这么选？”
的紧凑证据包。

查看 [GitHub 上的 dogfood proof](https://github.com/KKenny0/Lode/blob/main/examples/decision-replay-proof.md)。

## 安装

```bash
# Codex Git-backed marketplace
codex plugin marketplace add KKenny0/Lode

# CLI 验证
npx @lode/cli doctor
```

然后运行一次 `/lode:cold-start-interview`。会话开始时说 `开工`，结束时说 `收工`。

没有 vault？没问题 — `收工` 会直接在对话中输出结构化 Markdown。
