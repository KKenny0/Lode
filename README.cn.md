<p align="center">
  <img src="assets/mark.svg" alt="Tracework" width="132" />
</p>

<h1 align="center">Tracework</h1>

<p align="center"><strong>把 agent session 沉淀成可追问、可汇总、可复盘的证据型工作记忆。</strong></p>

<p align="center">
  <a href="https://kkenny0.github.io/Lode/zh/"><strong>文档</strong></a> · <a href="README.md">English</a>
</p>

Tracework 让 agent work 留下可检查、可追问、可继续推进的工作痕迹。

它捕获 session 里的决策、证据、风险、artifact 和下一步，把一次性对话沉淀为
本地工作记录，用于召回、追问、汇报和复盘。

## Tracework 能做什么

Tracework 可以：

- 捕获 session 里的决策、放弃路径、风险、artifact 和下一步
- 在本地证据足够时回答“当时为什么这么选”
- 在后续 session 前召回有用上下文
- 把 raw session 记录汇总成日报、周报、月报或 roadmap
- 把 Markdown 和 JSON 记录留在你自己的 knowledge vault 里

核心循环很小：

```text
捕获 session 信号 -> 回放决策 -> 汇总成 brief、review 或 roadmap
```

Decision replay 是可信机制：后来的 agent 或读者可以从一个结论向下追到 raw
entry、被拒方案、风险和 source refs。如果记录不足以支持回答，Tracework 应该
明确说证据不足，而不是编造历史。

它不是会议纪要工具、审批流、绩效包装工具、员工监控界面或泛办公室套件。活动数、
提交数、代码行数只能说明记录覆盖度，不能单独证明成果。

## Skills

| Command | 时机 | 输出 |
| :--- | :--- | :--- |
| `/tracework:cold-start-interview` | 首次运行 | 配置本地 vault 和项目画像 |
| `/tracework:capture` | 收工或阶段记录 | 捕获决策、构建、调查、修复、风险和 artifact |
| `/tracework:recall` | 开工 | 召回最近决策、风险、开放问题和相关 artifact |
| `/tracework:query` | 定向追问 | 用本地证据回答“当时为什么这么选？” |
| `/tracework:weekly` | 每周 | 把 raw session 记录汇总成 brief-ready outline |
| `/tracework:monthly` | 每月 | 生成月度回顾和重复证据中的候选规则 |
| `/tracework:roadmap` | 阶段复盘 | 生成叙事性决策历史 |
| `/tracework:daily` | 每天 | 从 raw entries 和 git history 更新 Obsidian 风格日报 |

核心 habit loop 很小：

```text
首次运行 /tracework:cold-start-interview
收工或 /tracework:capture 结束 session
开工或 /tracework:recall 开始 session
需要解释原因时用 /tracework:query
```

日报、周报、月报和路线图都需要 raw entry 积累后才会更有价值。它们是同一份
记录上的视图，不是另一套 reporting database。

## 安装

### Codex

```bash
codex plugin marketplace add KKenny0/Lode
codex plugin add tracework@tracework
```

更新：

```bash
codex plugin marketplace upgrade tracework
codex plugin add tracework@tracework
```

### Claude Code

```bash
claude plugin marketplace add KKenny0/Lode
claude plugin install tracework@tracework
```

更新：

```bash
claude plugin marketplace update tracework
claude plugin update tracework@tracework
```

## Storage

- 配置：`~/.tracework/config.yaml` 或 `{project}/.tracework/config.yaml`
- Raw entries：`{vault}/raw/weeks/{week}/{slug}.json`
- Decision indexes：`{vault}/raw/decisions/{slug}.json`
- 可读输出：`{vault}/Daily Note.md` 和 `{vault}/Work Diary/`

公开产品名、命令、配置路径和 schema namespace 都是 `tracework`。Tracework 不再使用
legacy storage fallback；请在上面的配置文件中写入 `knowledge_vault`。

## 开发

```bash
npm --prefix cli run build
npm --prefix cli run copy-skills
npm --prefix cli run check-skills
npm --prefix cli run test
npm --prefix site run build
```

修改 `.codex-plugin/`、`skills/` 或 `assets/` 后运行：

```bash
npm --prefix cli run copy-skills
npm --prefix cli run check-skills
```

核心文档：

- [配置](docs/configuration.md)
- [数据模型](docs/data-model.md)
- [Artifact governance](docs/artifact-governance.md)

## License

MIT
