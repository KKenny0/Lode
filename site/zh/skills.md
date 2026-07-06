# 技能

Tracework 包含八个独立 skills。它们共享同一套 storage convention，所以一次
capture 的输出可以继续服务 recall、query、brief、review 和 roadmap。

## 开始

### Cold Start Interview

**触发：** `/tracework:cold-start-interview`

完成 Tracework 的首次设置：选择本地 knowledge vault，记录项目身份，并保存后续
capture、recall 和 review 会复用的偏好。

### Capture

**触发：** `/tracework:capture`、`/tracework:capture checkpoint`、`收工`

捕获一次 session 或 checkpoint。它会动态路由为 lite、standard 或 deep 深度，
再保留值得复用的目标、状态变化、决策、放弃路径、风险、source refs、artifact
变化和下一步。零配置模式会直接在对话中返回结构化 Markdown。

### Recall

**触发：** `/tracework:recall`、`开工`

读取最近 raw entries、decision indexes 和 artifact indexes，为下一次 session
准备上下文。它应该浮现决策、风险、开放问题、放弃方案和可能过期的 artifact。

## 追问

### Query

**触发：** `/tracework:query`、`why did we choose this?`、`为什么当时这么选`

从本地证据回答具体项目历史问题。它区分 provenance 和 verification：
`source_entry_refs` 说明说法记录在哪里，direct evidence refs 才支持更强的
claim。如果记录不足，query 应拒绝编造答案。

### Roadmap

**触发：** `/tracework:roadmap`、`决策路线图`

从 raw entries 和 decision indexes 中综合决策线索、累积风险、反复开放问题和被
重新讨论的替代方案。

## 回顾

### Daily

**触发：** `/tracework:daily`、`日报`

从 raw entries 生成面向上级/协作者的职场日报。git history 只用于补覆盖缺口；
输出会保留项目、状态、风险、下一步和证据边界字段，方便月度回顾继续解析。
只有 git 的输出仍可用，但必须标为 `limited`；capture 会补强为什么和证据边界。

### Weekly

**触发：** `/tracework:weekly`、`周报`

优先使用 raw entries 构建周度 brief outline，git 只作为 coverage 和 fallback
evidence。本地 `O#`、`W#`、`D#`、`E#` 链路让 brief 可以被检查。
它可以在 capture 覆盖不足时运行，但 fallback-only 工作必须保持 limited。

### Monthly

**触发：** `/tracework:monthly`、`月报`

从职场日报和匹配到的 raw evidence 构建月度 review。计数和活动指标留在覆盖度语境，
不能直接升级成 outcome claim。
