# Skills

完整命令参考。第一次上手优先看 [快速开始](./quick-start)：先试写周报或日报，再配置 vault。

## 高频报告

### Daily

`/tracework:daily [work|personal|all]` 为每个 reporting group 生成一个今日判断、通常
三条状态变化主线、完整组合覆盖和下一道门。

### Weekly

三档：

- **quick**：`这周做了啥` / `周报简版` — 对话内 5–7 条 + 结转，不写文件。
- **brief**（默认）：`/tracework:weekly` / `写周报` — management brief。
- **slides**：明确 `weekly PPT` / `周报 PPT` 时 — 面向部门内部汇报、以 IC 为讲述者的
  PPT-ready Markdown Deck；没有最低页数，主 deck 最多 8 页。

Slides 会先形成 Story Why/Goal，再通过内部认知任务、source grounding 与 Content
Materialization 把事实、关系、数字、机制和风险直接写入演示正文。intended takeaway
与完整 source packet 不公开；读者应从内容中自然得到认识，PPT 制作者只做视觉转译。

### Monthly

`/tracework:monthly [work|personal|all]` 以 raw entries 为语义真相，Daily/Weekly 只
作为已有的人类判断，输出阶段弧线、反复风险和下月收口目标。

## 证据基础

### Capture

`/tracework:capture`、checkpoint 或“收工”保存动态深度的 raw facts，不提前写三份
Daily、Weekly、Monthly 文案。

`/tracework:capture day [YYYY-MM-DD] [scope]` 从显式启用的本地 session manifest
增量补回持久事实。分区发生在 transcript 读取之前，正文不会被复制进 vault。

## 低频可信度与恢复

### Query

从有引用的本地证据回答具体的 why、alternatives、revisit 或 impact 问题。证据不足
时明确返回缺口。

### Recall

继续旧工作时恢复有边界的项目上下文。

### Roadmap

对决策线程生成长周期叙事，是高级复盘，不是报告必经步骤。

### Cold Start

用最少问题配置 vault、项目身份和 reporting group。元数据级 session scan 保持显式
opt-in。
