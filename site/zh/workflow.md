# 工作流

## 最小 Loop

```text
安装 -> 配置 -> 生成报告或追问 -> capture 关键 session
```

1. 以 `tracework@tracework` 安装插件。
2. 运行 `/tracework:cold-start-interview`。
3. 运行 `/tracework:daily`、`/tracework:weekly` 或一个具体的 `/tracework:query`。
4. 关键工作结束后用 `收工` 或 `/tracework:capture`，让后续报告和决策查询有更强证据。

这条路径能更快证明核心价值：报告可以马上有用，capture 负责保存 git 无法恢复的
“为什么”。

## 复用地图

```text
Capture -> raw/weeks/{week}/{slug}.json
Query   <- raw/decisions/ + raw/weeks/
Recall  <- raw/weeks/ + raw/artifacts/ + raw/decisions/
Daily   <- raw/weeks/ + fallback git coverage
Weekly  <- raw/weeks/ + fallback git coverage
Monthly <- Daily Note.md + matching raw entries
Roadmap <- raw entries + decision indexes
```

Skills 独立触发，没有强制流水线。共享 storage convention 让后续视图可以复用早期
证据。

日报和周报可以在没有 raw entries 时用 git fallback coverage 运行。但这些输出必须
保持 `limited`：它们可以描述活动和进展，不能补写动机、取舍、风险或已验证影响。

## 逐层收口

Brief 和 review 应该向上汇总工作，同时保留向下核验路径：

```text
向上：raw entries -> decisions -> work streams -> outcomes / risks / next steps
向下：outcome claim -> stream -> decision -> raw entry / evidence ref
```

周报和月报可以使用本地标签：

- `O#`：成果、进展、风险或决策
- `W#`：支撑工作主线
- `D#`：决策或取舍
- `E#`：证据审计

这些标签让报告可检查。它们不改变 raw schema。

## 零配置

没有 vault 时，capture 仍然可以直接在对话里返回结构化 recap。当你需要安静写入、
跨 session recall、decision query，以及更高质量的 brief 或 review 时，再配置 vault。

## 证据规则

- Source ref 是记录出处，不自动等于证明。
- 只有 git 的工作属于 fallback evidence。
- 活动数量不能证明 outcome。
- 不支持的 query 应该返回 evidence gap。
- 新事实应该追加成新的 raw entry，不写进旧记录。
