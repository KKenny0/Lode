# 快速开始

## 安装

```bash
# Codex Git-backed marketplace
codex plugin marketplace add KKenny0/Lode

# 或本地开发
codex plugin marketplace add ./path/to/Lode

# 验证安装
npx @lode/cli doctor
```

## 首次运行

运行一次冷启动访谈来配置 Lode：

```
/lode:cold-start-interview
```

这会创建 `~/.lode/config.yaml`，包含你的 vault 路径、项目标识、语言和报告偏好。

## 日常使用

**开始会话：**

```
开工
```

或

```
/lode:recall
```

Lode 会从你的 vault 中呈现最近的决策、风险、开放问题和相关文档。

**结束会话：**

```
收工
```

或

```
/lode:capture
```

Lode 会分类会话原型并捕获重要内容 — 决策、风险、放弃的方案、制品变更。

## 周期复盘

| 命令 | 何时 | 输出 |
| :--- | :--- | :--- |
| `/lode:query` | 随时 | 针对具体历史决策问题给出带引用的回答 |
| `/lode:roadmap` | 随时 | 叙事性决策路线图，包含累积风险 |
| `/lode:daily` | 每天 | 从原始条目 + git 历史生成 Obsidian 日报 |
| `/lode:weekly` | 每周 | 周报大纲，包含条件性困难章节 |
| `/lode:monthly` | 每月 | 月度回顾 + 从重复证据生成的候选规则 |

当下一个 agent 需要知道某个选择为什么发生时，优先使用 `/lode:query`。
它只从本地证据回答；vault 没有支持记录时应该返回无答案，而不是猜测。

## 配置

Lode 从以下位置读取配置（按优先级排序）：

1. `{project}/.lode/config.yaml` — 项目级
2. `~/.lode/config.yaml` — 全局

```yaml
knowledge_vault: /path/to/your/knowledge-vault
project_slug: my-project

profile:
  project_name: 我的项目
  report_language: mixed
  weekly_mode: tech
  team_context: solo
```

完整选项参见[配置模板](https://github.com/KKenny0/Lode/blob/main/references/lode-config-template.yaml)。

## 零配置

完全跳过 vault。`capture` 直接在对话中输出结构化 Markdown。`recall` 仅使用对话上下文。你从第一个会话就能获得即时价值。

等你需要积累报告时再配置 vault。
