<p align="center">
  <img src="assets/mark.svg" alt="Tracework" width="132" />
</p>

<h1 align="center">Tracework</h1>

<p align="center"><strong>把 Agent 工作持续收口成有证据的日报、周报和月报。</strong></p>

<p align="center">
  <img src="assets/tracework-reporting-hero.webp" alt="Tracework 把零散的 Agent 工作收口成清晰、有证据、能赢得管理者认可的汇报" width="1086" />
</p>

<p align="center">
  <a href="https://kkenny0.github.io/Tracework/zh/"><strong>文档</strong></a> · <a href="README.en.md">English</a>
</p>

Tracework 把 Agent 工作收口成人能直接使用的报告，同时保留足够的本地证据，供以后
追问其中的决策。

Daily、Weekly、Monthly 是高频主产品；Capture 是安静的数据基础；Query、Recall、
Roadmap 是低频的可信度与恢复能力，只在工作被追问、继续或阶段复盘时使用。

## 核心循环

```text
Agent 工作
  -> capture 持久事实
  -> 完成当天收口
  -> 形成本周判断
  -> 回顾月度阶段

需要时
  -> query 当时为什么这么选
  -> recall 从哪里继续
```

Tracework 是 reporting-first、decision-replay-backed。没有 raw entries 时，报告仍可
用 git 生成 `limited` 版本；capture 保存 git 无法解释的动机、状态、风险、取舍和
证据边界。

## 公司与个人项目分区

每个项目可以声明报告分组：

```yaml
profile:
  project_name: My Project
  reporting_group: work   # 也可以是 personal、open-source、consulting
```

Daily、Weekly、Monthly 必须先分区，再选择主线：

- `work`：只包含公司项目，任何个人内容都不得进入正文或证据附录。
- `personal`：只包含个人项目。
- `all`：私人全景视图，各组分别拥有自己的判断和 headline。

默认三条 headline 的预算按分组计算，不是整个 vault 共用。其余有意义的工作会保留
在组合状态中，不会因为没有进入 headline 而消失。

从 0.2 升级时，尚未配置 `reporting_group` 的项目会成为 `unassigned`，并出于安全
原因被 scoped report 排除。请在每个项目中运行一次
`/tracework:cold-start-interview`，或手动补上该字段。

## Skills

| Command | 角色 | 输出 |
| :--- | :--- | :--- |
| `/tracework:daily` | 高频收口 | 今天改变了什么、为什么重要、下一道门是什么 |
| `/tracework:weekly` | 高频收口 | 周级管理判断；默认 Markdown brief，明确请求时生成 PPT 大纲 |
| `/tracework:monthly` | 高频回顾 | Raw-first 的阶段成果、反复风险和下月收口目标 |
| `/tracework:capture` | 证据基础 | 动态选择 lite/standard/deep 的 session raw record |
| `/tracework:query` | 低频可信度 | 用引用回答当时为什么这么选 |
| `/tracework:recall` | 低频恢复 | 继续旧工作时恢复有边界的上下文 |
| `/tracework:roadmap` | 高级复盘 | 长周期决策线程叙事 |
| `/tracework:cold-start-interview` | 一次性设置 | Vault、项目身份和报告分组 |

Decision replay 是可信机制，而不是需要每天使用的操作。读者可以从报告主张向下追到
raw entry、被拒方案、风险和直接证据。记录不足时，Tracework 应该明确暴露缺口，而
不是编造历史。

Tracework 不是会议纪要、审批流、绩效包装、员工监控或泛办公室套件。活动数、提交数
和代码行数只能描述覆盖度，不能证明成果。

## 安装

### Codex

```bash
codex plugin marketplace add KKenny0/Tracework
codex plugin add tracework@tracework
```

### Claude Code

```bash
claude plugin marketplace add KKenny0/Tracework
claude plugin install tracework@tracework
```

## Storage

- 配置：`~/.tracework/config.yaml` 或 `{project}/.tracework/config.yaml`
- Raw entries：`{vault}/raw/weeks/{week}/{slug}.json`
- Artifact dossiers：`{vault}/raw/artifacts/{slug}.json`
- Decision indexes：`{vault}/raw/decisions/{slug}.json`
- 可读输出：`{vault}/Daily Note.md` 和 `{vault}/Work Diary/`

Raw entries 是语义真相；decision index 是可重建的查询视图；Artifact dossier 保存导航
和已记录边界，不复制完整源文档。

## 开发

```bash
npm --prefix cli run build
npm --prefix cli run copy-skills
npm --prefix cli run check-skills
npm --prefix cli run test
npm --prefix site run build
```

核心文档：[配置](docs/configuration.md)、[数据模型](docs/data-model.md)、
[Artifact governance](docs/artifact-governance.md)。

## 支持

如果 Tracework 帮你把 Agent 工作收口成了更清晰的报告，同时保留了重要决策背后的
证据，你可以在这里支持项目继续维护：

<https://kkenny0.github.io/support/>

你的支持将用于持续维护报告质量、跨运行时插件打包、存储契约和文档。

## License

MIT
