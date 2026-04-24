# Lode

Claude Code skill collection — 从开发活动中开采值得留下的东西。

将开发过程中的变更意图、设计决策、架构演进自动记录，并生成日报和周报大纲。

## 包含的 Skills

安装本插件后，你将获得以下 5 个 skill：

| Skill | 用途 | 触发方式 |
|-------|------|----------|
| **lode-stage-doc** | 生成 Stage 实现文档（12 节结构） | "为 X stage 写文档"、"stage impl doc" |
| **lode-pipeline-doc** | 生成 Pipeline 架构演进文档（13 节结构） | "写架构文档"、"pipeline 架构演进" |
| **lode-session-recap** | Session 结束时捕获变更记录 | "收工"、"done"、"今天到这" |
| **lode-git-daily-note** | 从 git 提交记录生成 Obsidian 日报 | "更新日报"、"日报"、"daily note" |
| **lode-weekly-outline** | 多项目 git 周报 PPT 大纲 | "周报"、"weekly PPT" |

## 信息流

```
开发过程中:
  lode-session-recap (session-end) ──→ ~/.weekly-ppt/weeks/{week}/{slug}.json
  lode-stage-doc (doc 生成后) ───────→ ~/.weekly-ppt/weeks/{week}/{slug}.json
  lode-pipeline-doc (doc 生成后) ────→ ~/.weekly-ppt/weeks/{week}/{slug}.json

每天:
  lode-git-daily-note ← git commit history → Obsidian 日报

每周:
  lode-weekly-outline ← git commits + ~/.weekly-ppt/ → 周报大纲
```

## 共享存储约定

lode-stage-doc、lode-pipeline-doc、lode-session-recap 遵循同一份 schema，定义在 `references/weekly-ppt-convention.md`。

存储位置：`~/.weekly-ppt/weeks/{YYYY-WNN}/{project-slug}.json`

可选配置：`~/.weekly-ppt/projects.json` — 项目注册表，帮助 skill 自动识别项目 slug。

## 安装

将本仓库克隆到 Claude Code 的 skill 目录，或通过 `claude plugin add` 注册。详情参见 [Claude Code Skills 文档](https://docs.anthropic.com/en/docs/claude-code/skills)。

## License

MIT
