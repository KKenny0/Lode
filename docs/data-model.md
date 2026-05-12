# 数据模型

[返回主 README](../README.md)

Knowledge vault 采用双层架构设计，将结构化数据与人类可读文档分层存储，实现机器可读性与人类可理解性的平衡。

## 双层存储结构

Lode 的数据治理不只依赖 vault。完整模型包含四个存储表面：

- **Project Repo**：和代码强绑定、需要随实现一起演进的产物，例如 `arch-doc`、`DESIGN.md`、`PLAN.md`、`AGENTS.md`、prompt/schema contracts。
- **Vault Raw Layer**：机器可读的记忆和索引，例如 weekly raw entries、artifact index、monthly signals。
- **Vault Wiki Layer**：人类可读的综合输出，例如 Daily Note、weekly outline、monthly review、decision roadmap。
- **Conversation Fallback**：无配置时的即时价值，例如 `收工` 的 Markdown recap。

Knowledge vault 内部分为 raw/wiki 两层：

```
{vault}/
  raw/                            # Raw layer: 结构化中间数据
    projects.json                 # 可选项目注册表
    artifacts/
      storyboard-pipeline.json    # Durable artifact index entries
    weeks/
      2026-W18/
        storyboard-pipeline.json  # Raw change entries
    months/
      2026-04/
        signals.json
        skeleton.json
  Daily Note.md                   # Wiki layer: 人类可读笔记
  Work Diary/
    Weekly/
      2026-W18.md
    Monthly/
      2026-04.md
      2026-04.summary.md
```

### Raw Layer (原始层)
- **存储位置**: `{vault}/raw/`
- **数据类型**: 结构化的 JSON 数据
- **用途**: 
  - 机器可读的中间数据
  - 技能间共享的结构化信息
  - 后续报告的语义来源
- **内容**:
  - `projects.json`: 可选的项目注册表，定义项目元信息
  - `artifacts/`: 长期产物索引，指向 repo-local docs、design docs、prompt/schema contracts 等
  - `weeks/`: 按周组织的 raw change entries
  - `months/`: 按月组织的信号和框架数据

### Wiki Layer (知识库层)
- **存储位置**: `{vault}/Daily Note.md` 和 `{vault}/Work Diary/`
- **数据类型**: Markdown 文档
- **用途**:
  - 人类可读的工作记录
  - 直接面向消费者的文档输出
  - 长期可维护的知识档案
- **内容**:
  - `Daily Note.md`: 每日工作记录的主入口
  - `Work Diary/Weekly/`: 周度归档
  - `Work Diary/Monthly/`: 月度归档和总结

## 数据复用关系

各技能通过共享的数据模型实现上下文复用：

```
开发过程中:
  lode-session-recap -> {vault}/raw/weeks/{week}/{slug}.json
  lode-arch-doc      -> project docs/ + {vault}/raw/weeks/{week}/{slug}.json
                     -> {vault}/raw/artifacts/{slug}.json

每天:
  lode-git-daily-note <- raw entries + git log -> {vault}/Daily Note.md

每周:
  lode-weekly-outline <- raw entries + fallback git coverage -> weekly outline

每月:
  lode-monthly-review <- Daily Note.md -> monthly archive + summary
```

## Artifact Ownership Matrix

| 产物 | Primary location | Secondary representation |
|---|---|---|
| session recap entry | `{vault}/raw/weeks/{week}/{slug}.json` | 无 vault 时输出到 conversation |
| Stage implementation doc | project repo `docs/{week}/lode-stage-*.md` by default | raw weekly signal + artifact index |
| Pipeline evolution doc | project repo `docs/{week}/lode-pipeline-*.md` by default | raw weekly signal + artifact index |
| Daily Note | `{vault}/Daily Note.md` | none |
| Weekly outline | `{vault}/Work Diary/Weekly/{week}.md` | 无 vault 时输出到 conversation |
| Monthly archive/summary | `{vault}/Work Diary/Monthly/` | `{vault}/raw/months/{month}/` |
| Decision roadmap | `{vault}/Work Diary/Decision Roadmap*.md` | 无 vault 时输出到 conversation |
| Open questions / risks / decisions | raw entries at creation time | future derived lifecycle indexes |

## Raw Entry 与 Artifact Index 的边界

Raw entry 回答“这次发生了什么判断”：

- 为什么做；
- 试过什么；
- 选了什么；
- 放弃了什么；
- 还悬着什么；
- 对报告、路线图或下一次 session 有什么价值。

Artifact index 回答“有哪些长期可召回资料”：

- 产物是什么；
- 完整内容在哪里；
- 覆盖哪些 topic、decision thread、open question；
- 是否仍然 active，是否被 supersede；
- future recall 是否值得读取它。

Weekly raw entries 不应承担文档目录的职责。Artifact index 是 `开工召回`、决策路线图、周报和月度回顾的 source navigation layer。

## 生命周期语义

Lode 不修改历史 raw entry。后续 skill 如果发现问题、风险或决策状态变化，应追加新的 raw entry 记录 transition。

```text
open_question:
  open -> answered -> obsolete -> promoted_to_decision

risk:
  identified -> mitigated -> accepted -> obsolete

decision:
  proposed -> chosen -> revised -> superseded

artifact:
  draft -> active -> superseded -> obsolete
  active -> missing
```

第一阶段只要求 producer 清楚写出 lifecycle signal；当前状态可以由 `decision-roadmap`、`weekly-outline` 或 `monthly-review` 从 raw entries 和 artifact index 推导。

### 数据流说明

1. **Raw Entry 生成**
   - `lode-session-recap`: 每次工作结束时生成结构化的变更信号
   - `lode-arch-doc`: 架构工作后生成架构相关的 raw entries
   - 两者都写入 `{vault}/raw/weeks/{week}/{slug}.json`

2. **日报生成**
   - `lode-git-daily-note` 读取 weekly raw entries
   - 结合 git log 补充上下文
   - 生成或更新 `{vault}/Daily Note.md`

3. **周报生成**
   - `lode-weekly-outline` 消费 weekly raw entries
   - 使用 git 作为 fallback 和 coverage 补充
   - 生成结构化的周报大纲

4. **月度回顾**
   - `lode-monthly-review` 基于 Daily Note.md
   - 拆分月度档案并生成总结
   - 输出到 `{vault}/Work Diary/Monthly/`

## 设计优势

- **原始优先**: 周报以 raw entries 为主要语义来源，确保信息质量
- **灵活架构**: 技能可以独立运行，但通过共享数据模型增强协作
- **双向流动**: Raw entries 既可向上生成报告，也可向下补充日报
- **可读性保证**: Wiki 层提供人类友好的文档访问方式
- **版本友好**: 所有数据文件均为纯文本，天然支持 git 版本控制

## 数据约定

- **命名规范**: 使用 ISO 周格式 (YYYY-WXX) 和 ISO 月格式 (YYYY-MM)
- **文件格式**: JSON 用于结构化数据，Markdown 用于人类可读文档
- **路径约定**: 严格遵循上述目录结构，确保技能间互操作性
- **扩展性**: 预留了 months 层用于月度数据聚合，支持未来的技能扩展
