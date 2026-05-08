<p align="center">
  <img src="assets/logo.png" alt="Lode" width="180" />
</p>

<h1 align="center">Lode</h1>

<p align="center"><strong>The knowledge vein in your codebase.</strong></p>

<p align="center">
  <a href="README.md">English</a>
</p>

## Why

你和 AI 一起做开发。一次 session 里，你们探索了好几条路径 — 试过什么方案、放弃过什么、为什么放弃、哪些风险被识别、哪些设计在权衡之后确定。这些知识是项目最有价值的部分。

Session 结束，它们就消失了。

Git 记录 **what changed**。Issue tracker 记录 **planned work**。但 **你在这个过程中学到了什么**，没有人记录。

Lode 是第三层。它在每次 session 结束时捕获动机、探索路径、放弃的方案和悬而未决的问题，再把这些记忆复用到日报、周报、月报和架构文档里。

## See it

<img src="assets/lode-demo.gif" alt="Lode demo: session recap to weekly report" width="800" />

一次 `收工` 就能看到价值 — 不需要配置，不需要等待积累。

## Habit Loop

Lode 围绕一个高频 agentic coding loop 组织：

```text
开工 -> 实现探索 -> 同步意图 -> 收工 -> 周期复盘 -> 沉淀经验
```

日报、周报、月报和决策路线图是这个 loop 之上的周期复利层，不是主要产品故事。

## Skills

每个 skill 对应一个你已经有的工作习惯，用一个触发词激活。

| Skill | When | What it does |
| :--- | :--- | :--- |
| `lode-session-recap` | 每次收工 | 提取 session 中的决策信号：动机、探索路径、放弃的方案、开放问题 |
| `lode-arch-doc` | 架构工作之后 | 生成 Stage 实现文档或 Pipeline 架构演进文档 |
| `lode-session-start-recall` | 每次开工 | 召回最近决策、风险、开放问题、放弃方案和相关 repo-local docs |
| `lode-intent-sync` | 实现学习之后 | 提议更新 DESIGN / PLAN / AGENTS / README，让意图与实现学习保持一致 |
| `lode-hard-stuff-radar` | 按需 | 发现反复出现的开放问题、架构风险、陈旧线程和需要人工判断的难点 |
| `lode-experience-distillation` | 按需 | 把重复经验沉淀成 AGENTS rules、checklists、playbooks 或 skill ideas |
| `lode-decision-roadmap` | 按需 | 从积累的 entries 生成叙事性决策路线图 — 展示项目决策演变，重新评估放弃的方案 |
| `lode-git-daily-note` | 每天按需 | 从 raw entries 和 git history 更新 Obsidian 日报 |
| `lode-weekly-outline` | 每周按需 | 基于积累的 raw entries 生成多项目周报大纲 |
| `lode-monthly-review` | 每月按需 | 从 Daily Notes 生成月度工作回顾 |

Skills 是独立的。Lode 不是一个强制流水线 — 每个 skill 可以单独使用，但它们共享同一套本地存储约定，所以后续报告可以复用之前沉淀的上下文。

## Install

```bash
# 1. Install all skills
npx skills add KKenny0/Lode -g --all

# 2. Configure vault path
mkdir -p ~/.lode
cat > ~/.lode/config.yaml <<EOF
knowledge_vault: /path/to/your/knowledge-vault
EOF

# 3. Verify
npx @lode/cli doctor
```

然后在任意 git repo 里正常开发。session 开始时说 `开工`，实现学习需要同步到 specs 时说 `同步意图`，session 结束时说 `收工`，想回顾项目决策演变时说 `决策路线图`。

不配置 vault 也可以开始 — `收工` 会直接在对话中输出结构化 Markdown。

配置细节见 [docs/configuration.md](docs/configuration.md)。数据模型见 [docs/data-model.md](docs/data-model.md)。产物归属和路线图存储规则见 [docs/artifact-governance.md](docs/artifact-governance.md)。合成示例见 [`examples/`](examples/)。

## Background

Lode 这个名字来自英文里的 lode：矿脉，矿物在地下富集的地方。commits、sessions、diffs 是原矿，Lode 把它们提炼成值得长期保存的工作知识。这个词和 load 同源，也和中文的载（zài，承载、记录）同源。

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
- **Artifact governance**: full repo-local docs stay near the code, while vault indexes make them discoverable for recall and reports.
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
