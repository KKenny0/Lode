# 快速开始

## 1. 安装

```bash
codex plugin marketplace add KKenny0/Tracework
codex plugin add tracework@tracework
```

## 2. 每个项目配置一次

运行 `/tracework:cold-start-interview`，设置本地 vault、项目身份，以及 `work` 或
`personal` 等 reporting group。

从 0.2 升级后，请在已有项目中各运行一次。未分组项目会被 scoped report 排除，
不会被猜进公司汇报。

## 3. 完成工作收口

```text
/tracework:daily work
/tracework:weekly work
/tracework:monthly work
```

个人项目使用 `personal`；私人全景使用 `all`，各组会分别叙事。Weekly 默认生成
Markdown brief；明确说 `weekly PPT` 时，才生成面向部门内部汇报、以 IC 为讲述者的
6–10 页 slide outline。核心机制变化会组合 Before/After、方案逻辑图、实施叙事和
独立验证证据，主 deck 最多保留 2–3 张逻辑图，原始证据映射留在附录。该命令生成的
是大纲，不是已经渲染的 `.pptx` 文件。

没有 raw entries 时，报告可以用有意义的 git 活动生成 `limited` coverage，但不会
补造动机、决策或已验证影响。

## 4. 提升证据质量

关键工作结束时说“收工”或运行 `/tracework:capture`。Capture 会从 session 信号选择
lite、standard 或 deep，只保存值得跨 session 复用的事实。

如果更适合每天结束时集中补录，可以显式启用：

```yaml
session_scan:
  enabled: true
  retention_days: 30
```

然后运行 `/tracework:capture day [YYYY-MM-DD] [work|personal|all]`。插件 Hook 只索引
元数据；Capture Day 会先完成 reporting group 分区，再读取会话内容。

## 5. 需要时再追问和恢复

- `/tracework:query why did we choose ...?`
- 继续旧工作时运行 `/tracework:recall`
- 长周期决策复盘时运行 `/tracework:roadmap`

这些是低频能力，不需要培养成每日操作。
