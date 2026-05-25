# 快速开始

## 1. 安装

```bash
codex plugin marketplace add KKenny0/Lode
npx @lode/cli install-codex-plugin
```

## 2. 运行 Demo

配置 vault 前，先运行确定性的 replay fixture：

```bash
node examples/decision-replay-demo.mjs
```

它会打印 `/lode:query` 应该返回的证据包形状：answerability metadata、top
decision node、raw source references、matched terms，以及 rejected alternatives。

## 3. 首次运行

运行一次冷启动访谈来配置 Lode：

```
/lode:cold-start-interview
```

这会创建 `~/.lode/config.yaml`，包含你的 vault 路径、项目标识、语言和报告偏好。

## 4. Capture 一次 Session

在一次真实 coding session 结束时，说：

```
收工
```

或运行 `/lode:capture`。Lode 会分类会话原型，并捕获重要内容：决策、风险、
放弃的方案、制品变更和 source references。配置了 vault 后，capture 默认只做简短确认。

长 session 中途可以运行 `/lode:capture checkpoint`，安静保存一个有价值的阶段进展。

## 5. Query 一个 Decision

完成一次 capture 后，问一个具体问题：

```
/lode:query why did we choose <the decision>?
```

通过标准是带引用的回答：匹配到的 decision node ids、`source_entry_refs`、已有记录中的 rejected alternatives，以及在缺少证据时明确返回证据不足。

## 之后：Recall 和 Reports

有历史之后，用 `开工` 或 `/lode:recall` 开始 session。积累多个 decision 后用
`/lode:roadmap`。raw record 足够厚之后，再生成日报、周报和月报。

## 复利输出

| 命令 | 何时 | 输出 |
| :--- | :--- | :--- |
| `/lode:query` | 随时 | 针对具体历史决策问题给出带引用的回答 |
| `/lode:recall` | 已有历史后的开工 | 紧凑 Decision Context |
| `/lode:roadmap` | 多个决策之后 | 叙事性决策路线图，包含累积风险 |
| `/lode:daily` | 每天 | 从原始条目 + git 历史生成 Obsidian 日报 |
| `/lode:weekly` | 每周 | 周报大纲，包含条件性困难章节 |
| `/lode:monthly` | 每月 | 月度回顾 + 从重复证据生成的候选规则 |

当下一个 agent 需要知道某个选择为什么发生时，优先使用 `/lode:query`。
它只从本地证据回答；vault 没有支持记录时应该返回无答案，而不是猜测。

## 配置

Lode 从以下位置读取配置（按优先级排序）：

1. `{project}/.lode/config.yaml` — 项目级
2. `~/.lode/config.yaml` — 全局
3. `$WEEKLY_PPT_PATH` — legacy 环境变量 fallback
4. `~/.weekly-ppt/` — legacy 默认 fallback

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

完全跳过 vault。`capture` 直接在对话中输出结构化 Markdown，所以第一个会话仍然有即时价值。等你希望安静写入、`/lode:recall`、`/lode:query` 或报告跨会话复用记录时，再配置 vault。

等你需要积累报告时再配置 vault。
