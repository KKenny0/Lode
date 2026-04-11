```markdown
# Pipeline Evolution / Architecture Doc 编写指南（v1.1）

本指南用于规范“Pipeline 级架构演进文档”的编写。该文档聚焦系统整体结构的变化、原因与影响，不涉及具体 Stage 实现细节。

---

## 0. Document Meta

### 应写内容
- version：版本号（如 v2.4）
- date：日期
- author：负责人
- related_changelog：对应 CHANGELOG 路径
- impacted_stages：涉及的 Stage 列表

### 要求
- 简洁、结构化
- 控制在 5~10 行

---

## 1. Context and Problem Statement

### 应写内容

#### 当前系统状态
- 当前 pipeline 的主链路结构
- 已具备的核心能力

#### 核心问题
- 3~5 个系统级问题
- 必须是跨 Stage 或全链路问题

#### 触发原因
- badcase
- 批量评测结果
- 新需求或约束

### 要求
- 使用 bullet points
- 每个问题必须可验证
- 不写实现细节

---

## 2. Current Pipeline Snapshot

### 应写内容

#### Pipeline 结构
- 使用文本结构图表示当前 pipeline

#### 核心 Artifact
- 列出关键数据结构（如 narrative_timeline / storyboard）

#### 数据主链路
- 描述数据流向

### 要求
- 强调结构与数据流
- 不涉及内部实现

---

## 3. Evolution Goals and Design Principles

### 应写内容

#### Goals
- 本次演进目标（3~5条）
- 对应问题

#### Design Principles
- 本次设计遵循的原则（如强约束、上游收敛）

### 要求
- Goals 面向结果
- Principles 面向方法
- 不写具体方案

---

## 4. Key Architectural Changes

### 应写内容

每个改动必须使用统一结构：

### Change N: {名称}

- Before：改动前结构或行为
- After：改动后结构或行为
- Why：对应解决的问题
- What Changed：具体变化范围（模块/数据/流程）
- Impact：对系统的影响（质量/稳定性/复杂度）

### 要求
- 至少 3 个 Change
- 必须有明确前后对比
- 不写代码或 prompt

---

## 5. Cross-Stage Contract Changes

### 应写内容

按 Stage 间关系描述：

### {Stage A} → {Stage B}

- 新增约束（字段 / 校验规则）
- 删除或调整的约束
- 兼容性说明

### 要求
- 聚焦“数据契约”
- 不写实现细节

---

## 6. Dataflow and Artifact Evolution

### 应写内容

#### 数据流变化
- Before vs After

#### Artifact 变化
- 新增 / 删除 / 强化的数据结构

#### 核心链路
- 主数据链路变化

### 要求
- 使用结构图或链路描述
- 强调闭环

---

## 7. System-Level Trade-offs

### 应写内容

列出 2~4 个关键权衡：

### Trade-off N
- Gain：收益
- Cost：代价

### 常见维度
- 质量 vs 性能
- 灵活性 vs 可控性
- 上游复杂度 vs 下游稳定性

### 要求
- 必须包含代价
- 避免只写优势

---

## 8. Impact Analysis (Quality / Efficiency / Stability)

### 应写内容

#### 定性影响
- 哪些能力提升或变化

#### 定量指标（如可得）
- coverage
- 错误率
- 生成时间

### 建议格式

| 维度 | Before | After | 变化 |
|------|--------|-------|------|

### 要求
- 至少 2 个量化指标（如果可获取）

---

## 9. Evaluation and Verification Strategy

### 应写内容

#### 验证方式
- 如何验证本次改动有效

#### 评测类型
- Stage-level
- E2E
- 批量评测

#### 数据来源
- 使用的数据集或样本类型

### 要求
- 必须可执行
- 避免概念性描述

---

## 10. Migration and Rollout Plan

### 应写内容

#### Rollout 阶段
- 并行运行
- 灰度发布
- 全量上线

#### 数据策略
- 是否需要迁移

#### 回滚策略
- 如何恢复旧版本

### 要求
- 明确步骤
- 可执行

---

## 11. Known Risks and Failure Modes

### 应写内容

列出 3~5 个风险：

- 风险点
- 触发原因
- 影响范围

### 要求
- 必须具体
- 不写泛化描述

---

## 12. Versioned Evolution History

### 应写内容

记录关键版本变化：

```

v2.2 → v2.3

* 核心变化

v2.3 → v2.4

* 核心变化

```

### 要求
- 只写关键架构变化
- 不重复 CHANGELOG

---

## 13. References and Source of Truth

### 应写内容

列出：
- design docs
- changelog
- stage docs
- 评测文档

### 要求
- 使用路径或链接
- 标明权威来源

---

## 编写约束（必须遵守）

1. 只描述 Pipeline 层，不描述 Stage 内部实现
2. 所有改动必须有 Before / After
3. 所有问题必须可验证
4. 所有验证方案必须可执行
5. 优先描述结构变化与数据流变化
6. 禁止出现 prompt / 代码细节
7. 内容必须工程化、可落地
```
