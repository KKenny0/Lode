# Skills

完整命令参考。第一次上手优先看 [快速开始](./quick-start)：先试写周报或日报，再配置 vault。

## 高频报告

### Daily

`/tracework:daily [work|personal|all]` 为每个 reporting group 生成一个今日判断、通常
三条状态变化主线、完整组合覆盖和下一道门。

### Weekly

`/tracework:weekly [work|personal|all]` 默认生成 management brief。明确要求 PPT 时，
生成面向部门内部汇报、以 IC 为讲述者的 6–10 页 slide outline。核心技术成果分别
覆盖四层表达：

- Before/After 说明为什么要改，以及状态发生了什么变化；
- 方案逻辑图说明数据流、控制流、关键分支、回退和不变量如何协作；
- 实施叙事按执行顺序解释方案如何落地；
- 数据、测试或明确的 measurement gap 说明结果是否有效，以及证据成熟到哪一步。

核心运行机制变化必须覆盖四层。主 deck 最多保留 2–3 张逻辑图；普通维护工作不生成
装饰性架构图。逻辑图只解释方案如何工作，独立证据才说明方案是否有效；原始证据映射
留在附录。

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
