# 快速开始

## 1. 安装

```bash
codex plugin marketplace add KKenny0/Lode
codex plugin add tracework@tracework
```

更新：

```bash
codex plugin marketplace upgrade tracework
codex plugin add tracework@tracework
```

## 2. 配置 Vault

首次运行：

```text
/tracework:cold-start-interview
```

这会把配置写入 `~/.tracework/config.yaml` 或
`{project}/.tracework/config.yaml`。

## 3. Capture 一次真实 Session

工作结束时说：

```text
收工
```

或运行：

```text
/tracework:capture
```

长任务中途可以记录阶段进展：

```text
/tracework:capture checkpoint
```

Capture 应该记录决策、放弃路径、风险、证据、artifact 变化和下一步。没有
vault 时，它也可以直接在对话里返回结构化 recap。

## 4. Query 一个 Decision

问一个具体的 why 问题：

```text
/tracework:query why did we choose <the decision>?
```

好的回答应该包含匹配到的 decision nodes、raw `source_entry_refs`、被记录的
rejected alternatives，以及记录不足时明确的 evidence gap。

## 5. 复用记录

| Command | 何时使用 | 目的 |
| :--- | :--- | :--- |
| `/tracework:recall` | 有几次 capture 之后 | 开工时恢复相关上下文 |
| `/tracework:weekly` | 有一周记录之后 | 生成 brief-ready outline |
| `/tracework:monthly` | 有一个月记录之后 | 生成 review 和候选规则 |
| `/tracework:roadmap` | 积累多个 decision 后 | 复盘决策如何演变 |

## Storage

Tracework 读取配置的顺序：

1. `{project}/.tracework/config.yaml`
2. `~/.tracework/config.yaml`

请在其中一个文件里配置 `knowledge_vault`。Tracework 会把 raw entries、decision
indexes 和可读输出写入这个 vault。
