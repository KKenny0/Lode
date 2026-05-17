# 工作流

## Replay Loop

Lode 围绕最短的价值证明路径组织：

```text
安装 → demo → capture 一次 session → query 一个 decision
```

每一步映射到你工作流中的自然时刻：

1. **安装** — 添加插件，必要时验证 CLI。
2. **Demo** — 运行 `node examples/decision-replay-demo.mjs` 查看 evidence-pack 形状。
3. **收工一次真实 session** — `收工` 或 `/lode:capture` 分类会话，捕获决策、风险、放弃的方案、制品变更和 source references。
4. **追问一个 decision** — agent 需要知道项目当时为什么选择某条路径时运行 `/lode:query`。
5. **之后复利** — 有历史后再用 `/lode:recall`、`/lode:roadmap`、`/lode:daily`、`/lode:weekly` 或 `/lode:monthly`。

## 积累层次

Lode 不是严格的流水线。技能独立触发，但会在可用时复用彼此的制品。

```text
Capture → raw/weeks/{week}/{slug}.json    → 原始条目 + 制品索引
Query   ← raw/decisions/ + raw/weeks/      → 带引用的决策回放证据包
Recall ← raw/weeks/ + raw/artifacts/      → 会话上下文
Roadmap ← raw/weeks/ + raw/decisions/      → 决策叙事
Daily   ← raw/weeks/ JSON + git log       → Daily Note.md
Weekly  ← raw/weeks/ + git 覆盖           → 周报大纲
Monthly ← Daily Note.md                   → 月度回顾 + 候选规则
```

关键洞察：`capture` 的原始条目具有报告价值。它们携带原型特定字段（决策理由、修复根因、调查发现），使 `/lode:query`、`/lode:roadmap` 和周期报告无需二次写入即可解释发生了什么。

日报、周报和月报是复利层。它们会随着 decision evidence 积累而变好，但不是
Lode 第一次使用时必须跑通的路径。

## 存储约定

数据分为两个层次存放在你的知识库中：

- **原始层** (`raw/`) — 不可变的中间数据：weekly entries、decision replay indexes、制品索引、信号、骨架
- **Wiki 层** — 人类可读的输出：日报、周报大纲、月度回顾、决策路线图

你的知识库是一个 git 仓库（通常是 Obsidian vault），通过 git push/pull 实现跨机器同步。

## 零配置模式

没有 vault？没问题。`capture` 直接在对话中输出结构化 Markdown，所以第一个会话无需设置也有价值。等你希望 `/lode:recall`、`/lode:query` 和报告复用持久历史时，再配置 vault。

当你准备好使用持久存储时，运行 `/lode:cold-start-interview` 配置 vault 路径。已有的纯对话会话仍然有用 — 只是不会积累到报告中。
