# {stage_name} Stage Implementation

---

## 0. Document Meta（文档元信息）
【目的】明确“这份文档描述的是哪一版实现”，防止后续失真

必须包含：
- stage_name:
- doc_version:
- created_date: （YYYY-MM-DD）
- last_updated:
- owner:
- related_code_paths: （精确到文件/模块）
- related_prompts:
- related_schemas:
- upstream_stages:
- downstream_stages:
- default_enabled: true/false

建议补充：
- changelog_reference:
- experiment_flags / feature_flags

---

## 1. Stage Role in Pipeline（在 Pipeline 中的位置）

【目的】明确执行位置 + 调度方式

必须写清：
- 执行顺序（依赖哪些 stage）
- 是否可并行（parallel group / 独立执行）
- 是否支持跳过（skip 条件）
- 是否支持缓存（cache key 规则）
- 是否支持重跑（rerun 机制）

**必须包含 Pipeline Position 图**，格式如下：

```
stage_a → stage_b → THIS_STAGE → stage_c → stage_d
                        ↑
             dependencies: (stage_a, stage_b)
             artifact_input_key: "input_key_name"
```

建议用结构化表达：
- execution_mode: sequential / parallel
- dependency_graph:
- trigger_condition:

---

## 2. Responsibilities and Non-Goals（职责与边界）

【目的】避免职责漂移

必须包含：
### Responsibilities（负责）
- 核心产出语义（必须是“语义级”，不是技术动作）
- 对下游的承诺（例如：保证字段完整 / 顺序一致 / 对齐关系）

### Non-Goals（不负责）
- 明确列出“已经移出该 Stage 的职责”
- 明确哪些事情由下游处理

### Boundary（边界）
- 与上游的输入假设
- 与下游的接口契约

---

## 3. Inputs and Upstream Dependencies（输入契约）

【目的】保证输入稳定性 + 可复现

必须拆成 4 层：

### 3.1 Runtime Inputs
- API 输入字段（JSON 示例）
- config 覆盖项（如 feature flags）

### 3.2 Upstream Artifacts
- 依赖哪些 artifact（明确 key 名）
- artifact 来源 stage

### 3.3 Schema Dependencies
- 依赖的数据结构（字段级说明）
- 必填字段 vs 可选字段
- **当涉及多个关联类型时，必须包含 Schema Hierarchy 图**，展示类型间的继承/组合关系：

```
              BaseType (基础层)
              ─────────────────
              field_a: str
              field_b: int
                     │
                     │  inherits
                     ▼
              ExtendedType (扩展层)
              ──────────────────────
              + field_c: str
              + field_d: list[str]
```

### 3.4 External Knowledge / Reference
- 使用哪些 reference 文件
- 是否依赖 story_bible / rules / template

---

## 4. Outputs and Downstream Contracts（输出契约）

【目的】保证下游可稳定消费

必须拆两块：

### 4.1 Primary Outputs（主输出）
- schema 定义
- 字段语义说明（逐字段）
- 示例（必须提供 JSON）

必须强调：
- 哪些字段是“下游强依赖”
- 顺序是否重要（如 timeline）

### 4.2 Secondary Outputs（附加输出）
- metadata（usage / debug info）
- warnings / errors
- diagnostic 字段
- repair 相关字段

---

## 5. Core Processing Flow（核心处理流程）

【目的】把”黑盒 LLM”拆成可理解步骤

必须用”步骤流”写清：

Step 1: 输入准备
Step 2: Prompt / Rule 构建
Step 3: LLM / 算法执行
Step 4: 解析与结构化
Step 5: 归一化（normalize）
Step 6: 校验（validation）
Step 7: 修复（repair）
Step 8: 输出落盘（artifact）

每一步必须：
- 对应代码模块/函数
- 说明输入输出

### 5.x 编排模块（Orchestration Module）

**当 Stage 有非平凡的编排逻辑时（并发、fan-out、条件分支），必须用 Function Call Tree + Data Flow 图说明。**

#### Function Call Tree（代码调用树）

展示主编排入口的函数调用层级：

```
run(inputs)
 ├── Inputs.model_validate(inputs)                    # 输入校验
 ├── _preprocess(parsed_data)                          # 预处理
 ├── asyncio.gather(                                   # 并发 fan-out
 │     _process_item(item_0),
 │     _process_item(item_1),
 │     ...  (Semaphore 限流)
 │ )
 ├── sort by order
 └── materialize_output(all_results, inputs)
```

对于包含循环/重试的子函数，展开为：

```
for attempt in range(max_attempts):
    ├── render_template(system + user)
    ├── _run_llm → structured_output
    ├── _enrich → deterministic enrichment
    ├── _validate → coverage check
    │
    ├── PASS → return result
    │
    └── FAIL
          └── _build_repair_prompt
              └── next attempt (repair replaces user_prompt)
```

#### Data Flow Diagram（数据流图）

当存在并发处理、条件分支（PASS/FAIL）、或数据汇合时，必须用 Data Flow 图：

```
                    ┌─── input_a ───┐
                    │               │
                    │ (concurrent)  │
                    ▼               ▼
              process_a         process_b
                    │               │
             ┌──────┴──────┐  ┌─────┴─────┐
             PASS          │  PASS        │
             │          FAIL              FAIL
             │             │              │
             │         repair           repair
             │             │              │
             ▼             ▼              ▼
       (result_a)    (result_b)
             │              │
             └──────┬───────┘
                    ▼
               merge_results
                    │
                    ▼
               final_output
```

#### 模块级说明

每个关键模块（函数）需要：
- **所属文件**：`src/core/module_name.py`
- **职责**：一句话说明
- **输入**：函数签名中的关键参数
- **输出**：返回值及类型
- **边界条件**：异常处理、空值、边界情况

---

## 6. Prompt / Rule / Reference Contracts

【目的】明确“模型行为是如何被约束的”

必须拆三层：

### 6.1 Prompt Design
- system prompt 作用
- user prompt 作用
- prompt 中的强约束（如必须覆盖、必须对齐）
- **当 prompt 有多层模板组合（如 Jinja2 macro 导入）时，用表格或 Data Flow 图说明模板关系**：

```
shared_macros.j2 (共享宏库)
    │
    ├── system.j2 (导入 shared → 组装系统提示)
    │    └── 角色 + 约束 + 输出契约 + 参考资料
    │
    └── user.j2 (导入 shared → 组装用户提示)
         └── 任务指令 + 当前数据注入
```

### 6.2 Rule Layer（非 LLM 规则）
- 后处理规则
- deterministic 校验逻辑

### 6.3 Reference Layer
- reference 文件提供什么知识
- 如何被注入 prompt

---

## 7. Validation, Repair, and Failure Handling（校验与修复）

【目的】体现工程化能力（非常关键）

必须结构化写：

### 7.1 Validation Types
- schema validation
- semantic validation
- coverage validation
- alignment validation

### 7.2 Failure Modes
- 常见失败类型（列举）
- 每种失败的检测方式

### 7.3 Repair Strategy
- repair 触发条件
- repair 输入（上下文）
- repair 次数限制
- 是否 fallback

### 7.4 Failure Output
- 最终失败如何表现（error / partial result）

---

## 8. Observability and Debugging（可观测性）

【目的】降低排查成本

必须写：

### 8.1 Logging
- 关键日志字段
- stage usage 记录内容

### 8.2 Artifacts
- 输出文件路径
- debug 文件

### 8.3 Debug Guide
- 推荐排查步骤（非常重要）
  1. 看 manifest
  2. 看 artifact
  3. 看 prompt
  4. 看 validation

---

## 9. Compatibility and Migration Notes（兼容与迁移）

【目的】支持版本演进

必须包含：
- 与上一版本的差异类型：
  - 输入变化
  - 输出变化
  - 语义变化
- 是否需要：
  - 重跑历史数据
  - 迁移 schema
- 潜在风险：
  - cache 不兼容
  - 下游 break

---

## 10. Known Issues and Open Questions（已知问题）

【目的】真实反映系统状态

必须写三类：

### 10.1 Known Issues（已知问题）
- 当前线上/样本中真实存在的问题

### 10.2 Limitations（设计限制）
- 当前方案的结构性限制

### 10.3 Open Questions（开放问题）
- 尚未确定的设计方向

---

## 11. Versioned Changes Since Previous Iteration（版本差异）

【目的】支持版本对比

必须用表格：

| version | change | type | impact_input | impact_output | downstream_impact | need_rerun |
|--------|--------|------|--------------|--------------|------------------|-----------|

type 示例：
- feature
- refactor
- bugfix
- behavior_change

---

## 12. Source of Truth（事实来源）

【目的】防止文档与代码脱节

必须列出：
- 代码路径（最权威）
- config 文件
- prompt 文件
- reference 文件
- CHANGELOG

并明确：
> 本文档仅为解释性描述，实际行为以代码为准