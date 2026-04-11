# dev-context-skills

Claude Code skill collection — 开发过程中的上下文捕获工具集。

将开发过程中的变更意图、设计决策、架构演进自动记录到统一存储，供周报生成等下游工具消费。

## 包含的 Skills

| Skill | 用途 | 触发方式 |
|-------|------|----------|
| **stage-doc-generator** | 生成 Stage 实现文档（12 节结构） | "为 X stage 写文档"、"stage impl doc" |
| **pipeline-doc-generator** | 生成 Pipeline 架构演进文档（13 节结构） | "写架构文档"、"pipeline 架构演进" |
| **weekly-change-tracker** | Session 结束时捕获变更记录 | "收工"、"done"、"今天到这" |

## 信息流

```
开发过程中:
  weekly-change-tracker (session-end) ──→ ~/.weekly-ppt/weeks/{week}/{slug}.json
  stage-doc-generator (doc 生成后) ──────→ ~/.weekly-ppt/weeks/{week}/{slug}.json
  pipeline-doc-generator (doc 生成后) ──→ ~/.weekly-ppt/weeks/{week}/{slug}.json

周末:
  把变更日志路径贴给 weekly-ppt-lite → 高质量周报
```

## 共享存储约定

所有 skill 遵循同一份 schema，定义在 `references/weekly-ppt-convention.md`。

存储位置：`~/.weekly-ppt/weeks/{YYYY-WNN}/{project-slug}.json`

可选配置：`~/.weekly-ppt/projects.json` — 项目注册表，帮助 skill 自动识别项目 slug。

## 安装

将本仓库克隆到 Claude Code 的 skill 目录，或通过 `claude plugin add` 注册。详情参见 [Claude Code Skills 文档](https://docs.anthropic.com/en/docs/claude-code/skills)。

## 配套工具

- [weekly-multi-project-ppt-lite](https://github.com/KKenny0/weekly-multi-project-ppt-lite) — 消费变更日志生成周报 PPT（独立 repo）

## License

MIT
