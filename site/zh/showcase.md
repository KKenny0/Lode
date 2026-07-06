---
title: 效果展示
description: Tracework 的输出形态与证据边界。
---

# 效果展示

这个页面会刻意保守。Tracework 不应该把合成示例包装成真实 proof。

## 输出形态

| Surface | 应该展示什么 | 证据边界 |
| :--- | :--- | :--- |
| Capture | 路由深度、Session 目标、决策、放弃路径、风险、证据、下一步 | 这是 agent 捕获到的记录，本身不是独立 proof |
| Query | 可回答性、核心决策、原因、替代方案、source refs | 本地记录不支持问题时，必须明确拒绝编造答案 |
| Weekly | 成果或进展、工作主线、决策、证据审计 | 只有 git fallback 时要保持 evidence-limited，不应补写原因 |
| Monthly | 回顾叙事、重复信号、风险、候选规则 | 计数留在 coverage appendix，不能直接升级成 outcome claim |
| Roadmap | 决策线索、累积风险、反复开放问题 | 从 raw entries 和 decision indexes 派生 |

## 示例 Claim Chain

```text
O1 成果或进展
  W1 支撑它的工作主线
    D1 决策或取舍
      E1 raw entry 或 evidence reference
```

这条 chain 只在报告内部成立。它帮助读者从 brief 向下回到证据，但不会改写 raw
data。

## 真实输出门槛

把公开 case 放到这里之前，先确认：

- 来源是真实 Tracework run，或明确标注为 fixture
- 私有路径和专有细节已经移除
- `source_entry_refs` 被描述为 provenance，而不是自动 verification
- 每个 outcome claim 都有独立证据，或者有明确可见的限制
- 不受支持的 query 会返回明确的 evidence gap

## Commands

| Command | 用途 |
| :--- | :--- |
| `/tracework:capture` | 捕获 session 记录 |
| `/tracework:query` | 用证据回放一个决策 |
| `/tracework:recall` | 带着最近工作上下文开始 |
| `/tracework:weekly` | 准备周度 brief |
| `/tracework:monthly` | 准备月度 review |
| `/tracework:roadmap` | 回顾决策演变 |
