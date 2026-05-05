# 数据模型

[返回主 README](../README.md)

Knowledge vault 采用双层架构设计，将结构化数据与人类可读文档分层存储，实现机器可读性与人类可理解性的平衡。

## 双层存储结构

Knowledge vault 分为两层：

```
{vault}/
  raw/                            # Raw layer: 结构化中间数据
    projects.json                 # 可选项目注册表
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
  lode-arch-doc      -> {vault}/raw/weeks/{week}/{slug}.json

每天:
  lode-git-daily-note <- raw entries + git log -> {vault}/Daily Note.md

每周:
  lode-weekly-outline <- raw entries + fallback git coverage -> weekly outline

每月:
  lode-monthly-review <- Daily Note.md -> monthly archive + summary
```

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