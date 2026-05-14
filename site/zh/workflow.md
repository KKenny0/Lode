# 工作流

## 习惯循环

Lode 围绕你想重复直到自动化的循环来组织：

```text
开工 (recall) → 实现探索 (work) → 收工 (capture) → 周期复盘 (review)
```

每一步映射到你工作流中的自然时刻：

1. **开始会话** — `开工` 或 `/lode:recall` 呈现最近的决策、风险和开放问题，让你从上次停下的地方继续。
2. **正常工作** — 编码、探索、决策、放弃路径、更新 schema。无需特殊操作。
3. **收工** — `收工` 或 `/lode:capture` 分类会话并捕获重要内容：决策、风险、放弃的方案、制品变更。
4. **周期复盘** — 需要结构化总结时运行 `/lode:daily`、`/lode:weekly`、`/lode:monthly` 或 `/lode:roadmap`。

## 积累层次

Lode 不是严格的流水线。技能独立触发，但会在可用时复用彼此的制品。

```text
Recall ← raw/weeks/ + raw/artifacts/      → 会话上下文
Capture → raw/weeks/{week}/{slug}.json    → 原始条目 + 制品索引
Daily   ← raw/weeks/ JSON + git log       → Daily Note.md
Weekly  ← raw/weeks/ + git 覆盖           → 周报大纲
Monthly ← Daily Note.md                   → 月度回顾 + 候选规则
Roadmap ← raw/weeks/                      → 决策叙事
```

关键洞察：`capture` 的原始条目具有报告价值。它们携带原型特定字段（决策理由、修复根因、调查发现），使下游报告无需二次写入即可解释发生了什么。

## 存储约定

数据分为两个层次存放在你的知识库中：

- **原始层** (`raw/`) — 不可变的中间数据：JSON 条目、制品索引、信号、骨架
- **Wiki 层** — 人类可读的输出：日报、周报大纲、月度回顾、决策路线图

你的知识库是一个 git 仓库（通常是 Obsidian vault），通过 git push/pull 实现跨机器同步。

## 零配置模式

没有 vault？没问题。`capture` 直接在对话中输出结构化 Markdown。`recall` 仅使用对话上下文。你从第一个会话就能获得价值，无需任何设置。

当你准备好使用持久存储时，运行 `/lode:cold-start-interview` 配置 vault 路径。已有的纯对话会话仍然有用 — 只是不会积累到报告中。
