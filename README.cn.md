<p align="center">
  <img src="assets/mark.svg" alt="Lode" width="132" />
</p>

<h1 align="center">Lode</h1>

<p align="center"><strong>Agentic coding 的 persistent memory：记录为什么，复利成周报、月报和决策路线图。</strong></p>

<p align="center">
  <a href="https://kkenny0.github.io/Lode/zh/">文档</a> · <a href="README.md">English</a>
</p>

## Why

AI 让软件探索变便宜，也让上下文延续变困难。

一次 coding session 里，你可能会比较多个设计、放弃看似可行的路径、发现隐藏约束、更新 prompts、修改 schemas，并做出只有结合探索过程才说得清的决策。Git 记录最终 diff。Issue tracker 记录计划中的工作。它们都不会保存让这次工作成立的推理过程。

Session 结束，这些上下文通常就消失了。

Lode 是一个本地优先的 agentic coding persistent memory 工具箱。它捕获决策、风险、放弃路径、开放问题和架构产物，再把它们复利成周报、月报和决策路线图。它的差异化不是再做一个 memory layer，而是把原始 session 记忆变成可阅读、可复盘、可分享的 decision replay。

## Habit Loop

Lode 围绕一个应该被反复使用、直到变成习惯的 agentic coding loop 组织：

```text
开工 -> 实现探索 -> 收工 -> 周期复盘
```

周报、月报和决策路线图是这个 loop 之上的周期复利层。自适应深度 recap、轻量 sync suggestions、难点信号和 candidate rules 被吸收到保留的 skills 里，不再作为独立触发。

## Skills

每个 skill 对应一个你已经有的工作习惯。插件形态下，用统一的
namespaced command 激活。

| Skill | When | What it does |
| :--- | :--- | :--- |
| `/lode:cold-start-interview` | 首次使用 | 创建包含 vault path、项目身份、语言和报告偏好的 `~/.lode/config.yaml` |
| `/lode:capture` | 每次收工 | 识别 session archetype，按 decision/build/repair 等类型捕获深度信号，并在需要时索引 durable artifacts |
| `/lode:recall` | 每次开工 | 召回最近决策、风险、开放问题、放弃方案、相关 docs 和可能过期的 intent artifacts |
| `/lode:daily` | 每天按需 | 从 raw entries 和 git history 更新 Obsidian 日报 |
| `/lode:weekly` | 每周按需 | 基于 raw entries 生成周报大纲，有证据时加入本周难点 |
| `/lode:monthly` | 每月按需 | 生成月度工作回顾，并从重复证据中提出 candidate rules |
| `/lode:roadmap` | 按需 | 生成叙事性决策路线图，并汇总累积风险与反复开放问题 |

Skills 是独立的。Lode 不是一个强制流水线 — 每个 skill 可以单独使用，但它们共享同一套本地存储约定，所以后续报告可以复用之前沉淀的上下文。

## Decision Replay Proof

Lode 现在已经 dogfood 了派生的决策回放索引：raw entries 仍然是事实源，
`{vault}/raw/decisions/{slug}.json` 为 coding agent 提供回答“当时为什么这么选？”
所需的紧凑证据包。见 [`examples/decision-replay-proof.md`](examples/decision-replay-proof.md)：
里面包含一次真实的 Lode-on-Lode dogfood，以及一个在缺少决策历史时正确返回
无答案的负例查询。

## Install

```bash
# Codex Git-backed marketplace
codex plugin marketplace add KKenny0/Lode

# 本地开发 marketplace
codex plugin marketplace add ./path/to/Lode

# CLI verification remains available
npx @lode/cli doctor
```

然后先运行一次 `/lode:cold-start-interview`。之后在任意 git repo 里正常开发：
session 开始时说 `开工` 或 `/lode:recall`，session 结束时说 `收工` 或
`/lode:capture`，想回顾项目决策演变时运行 `/lode:roadmap`。

不配置 vault 也可以开始 — `收工` 会直接在对话中输出结构化 Markdown。

配置细节见 [docs/configuration.md](docs/configuration.md)。数据模型见 [docs/data-model.md](docs/data-model.md)。产物归属和路线图存储规则见 [docs/artifact-governance.md](docs/artifact-governance.md)。合成示例见 [`examples/`](examples/)。

## Background

Lode 这个名字来自英文里的 lode：矿脉，矿物在地下富集的地方。commits、sessions、diffs 是原矿，Lode 把它们提炼成值得长期保存的工作知识。这个词和 load 同源，也和中文的载（zài，承载、记录）同源。原来的标语 "the knowledge vein in your codebase" 仍然描述这个隐喻；现在更明确的产品承诺是：为 agentic coding 提供人能阅读、复盘和分享的 persistent memory。

Lode 只写本地 Markdown 和 JSON。和代码强绑定的架构文档默认留在项目 repo；共享记忆、索引和报告放在你的 knowledge vault。不引入远程服务、账号、同步后端或托管数据库。如果你的 knowledge vault 是 git repo，push 到哪里由你控制。

<details>
<summary>Development</summary>

```bash
npm --prefix cli run build
npm --prefix cli run copy-skills
npm --prefix cli run check-skills
```

Design principles:

- **Self-contained skills**: each skill carries its own references so it can be installed individually.
- **Raw-first reporting**: weekly reports use raw entries as the primary semantic source; git is fallback and coverage evidence.
- **Adaptive-depth recap**: 收工条目携带 archetype-specific fields，让周报能解释 decisions、repairs、investigations 和 builds，而不需要第二个写入 skill。
- **Artifact governance**: full repo-local docs stay near the code, while recap-owned vault indexes make them discoverable for recall and reports.
- **Graceful side effects**: when a raw write is only a side effect, failures do not block the primary deliverable.
- **Deterministic helpers**: scripts handle path resolution, date calculation, parsing, and aggregation where consistency matters.
- **Local evals, public protocols**: local fixtures stay ignored; public benchmark guidance lives under [`benchmarks/`](benchmarks/).

</details>

<details>
<summary>Benchmarks</summary>

Public benchmark protocols document the quality bar without publishing local fixtures:

- [`benchmarks/README.md`](benchmarks/README.md)
- [`benchmarks/weekly-outline.md`](benchmarks/weekly-outline.md)

</details>

## License

MIT
