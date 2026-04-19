# work-sync-skills

Claude Code skill collection — 工作同步工具集。

将开发过程中的变更意图、设计决策、架构演进自动记录，并生成日报和周报。

## 包含的 Skills

安装本插件后，你将获得以下 5 个 skill：

| Skill | 用途 | 触发方式 |
|-------|------|----------|
| **stage-doc-generator** | 生成 Stage 实现文档（12 节结构） | "为 X stage 写文档"、"stage impl doc" |
| **pipeline-doc-generator** | 生成 Pipeline 架构演进文档（13 节结构） | "写架构文档"、"pipeline 架构演进" |
| **weekly-change-tracker** | Session 结束时捕获变更记录 | "收工"、"done"、"今天到这" |
| **git-daily-note-updater** | 从 git 提交记录生成 Obsidian 日报 | "更新日报"、"日报"、"daily note" |
| **weekly-ppt-lite** | 多项目 git 周报 PPT 大纲 | "周报"、"weekly PPT" |

## 信息流

```
开发过程中:
  weekly-change-tracker (session-end) ──→ ~/.weekly-ppt/weeks/{week}/{slug}.json
  stage-doc-generator (doc 生成后) ──────→ ~/.weekly-ppt/weeks/{week}/{slug}.json
  pipeline-doc-generator (doc 生成后) ──→ ~/.weekly-ppt/weeks/{week}/{slug}.json

每天:
  git-daily-note-updater ← git commit history → Obsidian 日报

每周:
  weekly-ppt-lite ← git commits + ~/.weekly-ppt/ → 周报 PPT 大纲
```

## 共享存储约定

stage-doc-generator、pipeline-doc-generator、weekly-change-tracker 遵循同一份 schema，定义在 `references/weekly-ppt-convention.md`。

存储位置：`~/.weekly-ppt/weeks/{YYYY-WNN}/{project-slug}.json`

可选配置：`~/.weekly-ppt/projects.json` — 项目注册表，帮助 skill 自动识别项目 slug。

## 安装

将本仓库克隆到 Claude Code 的 skill 目录，或通过 `claude plugin add` 注册。详情参见 [Claude Code Skills 文档](https://docs.anthropic.com/en/docs/claude-code/skills)。

## License

MIT
