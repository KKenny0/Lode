---
name: lode-monthly-review
description: >
  Monthly work review from daily notes. Splits long Daily Note.md into monthly archives,
  extracts structured signals, and generates fact-based monthly summaries.
  Use this skill when the user mentions: "月度总结", "月报", "月度回顾", "monthly review",
  "按月拆分日报", "生成本月工作总结", "工作日志整理", "月度分析".
  Also trigger when the user wants to review project progress, work distribution,
  or prepare materials for performance review from daily notes.
---

# Lode Monthly Review

面向工作沉淀的月度日志处理。从 Daily Note.md 中按月拆分归档，提取结构化信号，生成事实优先的月度总结。

核心产物：

- 月度归档（原始 Markdown，不改写）
- 月度总结（由 agent 撰写，事实优先，禁止脑补）
- 中间数据（signals.json + skeleton.json，供二次消费）

## 设计原则

- **事实优先**：只从原始记录中提取和归纳，不虚构缺失信息
- **原文不动**：归档文件保留原始 Markdown，不做改写
- **总结与日志分离**：归档和总结是独立文件
- **允许总结，禁止脑补**：可以把多条记录归纳为一个主题，但不得凭空生成不存在的"成果"或"结论"

## 配置

此 skill 使用 Lode 统一配置系统。从以下位置解析知识库路径（`{vault}`），高优先级优先：

| 优先级 | 位置 | 说明 |
|--------|------|------|
| 1 | `.lode/config.yaml`（项目根目录） | 项目级覆盖 |
| 2 | `~/.lode/config.yaml` | 全局配置 |
| 3 | `$WEEKLY_PPT_PATH` 环境变量 | legacy fallback |
| 4 | `~/.weekly-ppt/` | legacy fallback 默认值 |

项目级配置覆盖全局配置的同名字段。此 skill 的主产物依赖 `{vault}`；如果无法解析路径，提示用户配置 `knowledge_vault`。完整配置格式和合并规则见 `references/weekly-ppt-convention.md`。

此 skill 的路径映射：
- 输入：`{vault}/Daily Note.md`
- 归档输出：`{vault}/Work Diary/Monthly/{YYYY-MM}.md`
- 中间数据：`{vault}/raw/months/{YYYY-MM}/signals.json` 和 `skeleton.json`
- 总结输出：`{vault}/Work Diary/Monthly/{YYYY-MM}.summary.md`

## 输入参数

### 必需

| 参数 | 说明 |
|------|------|
| `input_file` | Daily Note.md 的路径（默认从配置推导） |
| `output_dir` | 输出目录路径（默认 `{vault}/Work Diary/Monthly/`） |

### 可选

```yaml
summary_mode: project_focused    # light | project_focused | engineering_review
overwrite_policy: overwrite      # append | overwrite | skip_existing
month_filter: null               # 只处理指定月份，如 "2026-03"
project_filters: []              # 只保留特定项目视角
evidence_mode: strict            # strict | best_effort
```

- `summary_mode`：`light` 只提炼主线和关键词；`project_focused`（默认）按项目归并；`engineering_review` 强化问题/方案/风险结构
- `evidence_mode`：`strict`（默认）每条总结需有原文依据，`best_effort` 允许适度归纳

## 执行步骤

### Step 1：读取与预检

1. 确认 `input_file` 存在且可读（UTF-8）
2. 识别标题层级结构（年 → 月 → 日期）
3. 格式不符合时提示用户参考 `references/daily-note-format.md`

标题正则：
```
年标题：  ^#\s*\d{4}\s*年
月标题：  ^##\s*\d{4}\s*年\s*\d{1,2}\s*月
日标题：  ^###\s*\d{4}\.\d{2}\.\d{2}
```

### Step 2：按月拆分归档

运行 `scripts/split_daily_note.py`，将 Daily Note.md 拆分为 `YYYY-MM.md` 月度归档文件，保存到 `{vault}/Work Diary/Monthly/`。

- 保留原始内容，不做改写
- 缺少月级标题时自动从日期推断
- 支持 `overwrite_policy` 和 `month_filter`

### Step 3：提取信号 + 构建骨架

运行 `scripts/prepare_monthly_data.py`（合并了原 extract + build 两个脚本）：

```bash
python scripts/prepare_monthly_data.py \
  --input {vault}/Work\ Diary/Monthly/{YYYY-MM}.md \
  --signals-output {vault}/raw/months/{YYYY-MM}/signals.json \
  --skeleton-output {vault}/raw/months/{YYYY-MM}/skeleton.json \
  --summary-mode project_focused \
  --evidence-mode strict
```

脚本完成所有确定性工作：
- 提取项目/模块/类别标签、任务状态、当日焦点、风险信号、下一步信号
- 按项目归并、统计分布、识别工作阶段
- 自动识别真实项目（出现 >= 2 天的）
- 输出 signals.json 和 skeleton.json

### Step 4：Agent 撰写总结

读取 `references/worklog-summary-template.md` 模板、`skeleton.json` 骨架数据、原始月度归档 `YYYY-MM.md`。

按模板撰写 `{YYYY-MM}.summary.md`，保存到 `{vault}/Work Diary/Monthly/`。

**重要约束：**

- `evidence_mode=strict` 时，每条总结必须能在原文中找到对应条目
- 不把"优化中"说成"已完成"
- 不把多条独立小修复包装成"重大成果"
- 某项目只有零星记录时如实说明"记录较少"

**取舍规则：**
- 每个项目最多 2-3 个核心主题，其余合并为"日常优化包括..."
- 代码变更数字只在净增 >300 行或净减 >200 行时保留
- 配置调整、文档优化、<50 行变更的小修复合并为一句
- 总结总长度 80-120 行
- 如果多个日期记录同一工作流，合并为一个主题，按最新状态表述；不要把同一 raw/git 来源在日报中的重复痕迹放大成多个成果
- 如果同一主题同时包含完成项、风险项、决策项，按"完成了什么 + 保留了什么风险/决策"组织，避免只写成功叙事

### Step 5：输出执行摘要

终端输出 JSON 格式的执行摘要：
```json
{
  "months_created": ["2026-03"],
  "summaries_created": ["2026-03.summary.md"],
  "summary_mode": "project_focused",
  "projects_detected": ["项目A", "项目B"],
  "warnings": []
}
```

## 项目归类规则

项目通过 Daily Note 中的 `- [项目名]` 标签自动识别。核心原则：
- 以 `[项目名]` 标签为归类依据，不根据内容猜测
- Markdown 链接 `[文本](URL)` 不是项目标签
- 详细规则见 `references/project-tagging-guide.md`

## 边界与非目标

此 skill **不负责**：改写原始 Daily Note、写汇报文案、生成绩效表述、判断工作价值。

此 skill **只负责**：拆分 → 归档 → 提炼 → 结构化输出。

## 错误处理

1. **文件不存在**：报告路径，提示检查
2. **编码异常**：报告位置，建议 UTF-8
3. **标题层级不识别**：展示实际层级，提示参考 `references/daily-note-format.md`
4. **某月无内容**：正常处理，总结中标注"本月无记录"
5. **脚本执行失败**：报告完整错误，不吞异常

## Reference 文件

| 文件 | 何时读取 |
|-----|---------|
| `references/daily-note-format.md` | 理解 Daily Note 格式约定 |
| `references/worklog-summary-template.md` | 撰写总结时（必须读取） |
| `references/project-tagging-guide.md` | 项目归类规则 |
| `references/weekly-ppt-convention.md` | 共享存储约定 |
