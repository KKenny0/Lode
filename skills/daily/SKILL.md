---
name: daily
description: >
  Generate or update workplace-facing daily reports from Tracework raw entries,
  using git commit history only as fallback coverage. The output is intended
  for managers/collaborators and as structured monthly-review input. Use this
  skill for "/tracework:daily". Triggers on updating daily reports/work logs
  from recorded Tracework entries, filling in missing daily notes for past
  dates, or summarizing today's work across repos.
  Key phrases: "更新日报", "写日报", "日报", "工作日志", "生成工作日志",
  "根据 tracework 写日报", "补日报", "daily note", "work log".
  Do NOT trigger for writing code, git operations (merge/rebase/conflict),
  meeting notes, or generic reports without Tracework or repo activity context.
---

# Tracework 日报更新器

从 Tracework raw entries 生成面向职场汇报的 Obsidian 日报内容，并只用
git 提交统计补足未被 raw entries 覆盖的活动。日报的直接受众是上级、
协作者或月度回顾，不承担下一次 agent 开工接力职责；开工接力由
artifact dossier、recall、query 和 roadmap 负责。

---

## 配置系统

### 配置文件位置（优先级从高到低）

| 优先级 | 位置 | 说明 |
|--------|------|------|
| 1 | 项目根目录 `.tracework/config.yaml` | 项目级覆盖 |
| 2 | `~/.tracework/config.yaml` | 全局配置 |

> **迁移说明**：旧版 `.daily-note-config.yaml` 已废弃。日报设置现在统一在 `.tracework/config.yaml` 的 `daily_note:` 子节点下。如果检测到旧配置文件，提示用户迁移。

### 配置文件结构

```yaml
# Tracework Configuration
# 全局: ~/.tracework/config.yaml  |  项目级: {project-root}/.tracework/config.yaml

knowledge_vault: /path/to/your/knowledge-vault

# 日报设置（可选，原 .daily-note-config.yaml）
daily_note:
  path: /path/to/your/Daily Note.md   # 默认 {vault}/Daily Note.md
  repos:                               # 工作仓库列表
    - /path/to/repo1
    - /path/to/repo2
  categories:                          # 自定义类别
    - name: 【安全加固】
      patterns: ["security", "auth", "permission"]
    - name: 【性能优化】
      patterns: ["perf", "optimize", "speed"]
  enable_smart_classify: false          # LLM 语义分类（默认 false）
```

### 首次使用

如果没有找到任何配置文件：
1. 提示用户运行 `/tracework:cold-start-interview` 创建全局配置
2. 如果用户直接提供路径，也可以将最小配置写入 `~/.tracework/config.yaml`
3. 如果用户希望项目特定配置，则写入项目根目录的 `.tracework/config.yaml`

### 配置合并规则

项目级配置**覆盖**全局配置的同名字段。未配置的字段从全局配置继承。此 skill 的主产物依赖 `{vault}` 或明确的 `daily_note.path`；如果无法解析路径，提示用户运行 `/tracework:cold-start-interview` 或配置 `knowledge_vault`。

---

## Writing and Classification Rules

Read `references/daily-note-writing.md` before classifying fallback commits or
writing final Daily Note content. Keep `SKILL.md` focused on execution flow; the
reference contains category mapping, semantic writing rules, merge rules, and
the exact output format.

---

## 工作流程

### Step 1: 加载配置

```
1. 检查项目根目录 .tracework/config.yaml
2. 检查 ~/.tracework/config.yaml
3. 如果都不存在 → 提示用户运行 `/tracework:cold-start-interview` 或配置 `knowledge_vault`
4. 如果仍无法解析 → 提示运行 `/tracework:cold-start-interview`，或在用户直接提供路径时创建最小全局配置
5. 合并配置（项目级覆盖全局级）
6. 如果 config 中没有 repos，尝试从 {vault}/raw/projects.json 读取项目路径作为补充
```

| 参数 | 来源 | 默认值 |
|------|------|--------|
| `daily_note_path` | 配置文件 `daily_note.path` | `{vault}/Daily Note.md` |
| `repos` | 配置文件 `daily_note.repos` → `{vault}/raw/projects.json` | 当前目录 |
| `date` | 用户指定 | 今天 (YYYY-MM-DD) |
| `date_end` | 用户指定 | 同 date（单天模式） |

### Step 1.5: Raw Data Coverage Check

Before processing, check how much raw entry data exists for the target date(s):

1. Count raw entries matching the target date from `{vault}/raw/weeks/{week}/{slug}.json`
2. Count git commits for the same date range
3. Report coverage:

| Coverage Level | Raw Entries | Git-Only Commits | Quality |
|---------------|-------------|------------------|---------|
| Full | >= 1 | any | High — raw entries carry intent and decisions |
| Partial | 0 | >= 1 | Medium — git-only; lacks motivation and trade-offs |
| None | 0 | 0 | Empty — no work signal available |

If coverage is `Partial` or `None`, include a warning at the top of the output:

- **Partial**: "本日无 raw entry 覆盖，日报内容来自 git log，缺少决策动机和上下文。建议运行 /tracework:capture 记录关键决策。"
- **None**: "本日无 raw entry 和 git commit，建议确认日期范围是否正确。"

### Step 2: 读取 weekly change entries（主数据源）

从 `{vault}/raw/weeks/{week}/{slug}.json` 读取当天已有的 change entries。

1. 计算 target date 的 ISO week（`date +%Y-W%V`）
2. 遍历所有 repos 对应的 slug，读取 `{vault}/raw/weeks/{week}/{slug}.json`
3. 筛选 timestamp 匹配 target date 的 entries（比较日期部分 YYYY-MM-DD）
4. 按 `references/daily-note-writing.md` 将 entries 映射为日报项目进展。

**JSON entries 已经是高质量结构化数据**（有 summary + context，可能有
`reporting` / impact / status / project_area / evidence_refs），不需要再做
diff 分析或重新分类。优先使用 `reporting` 的 outcome/progress/activity、
impact boundary、evidence boundary 和 evidence_gap；缺失时再使用
`impact`、`status`、`summary`、`context`。`status: ongoing` 不写成已完成，
`status: risk` 保留风险语气。直接进入 Step 5 的智能合并。

If multiple raw entries describe the same work from different sources, merge them into one daily-note item instead of duplicating the same change. Prefer adaptive-depth `session-recap` for intent and artifact evidence; treat legacy `arch-doc` as historical evidence/context. Preserve conflict or risk language explicitly when entries disagree.

Report requirements:
- Preserve raw-entry decisions, risks, open questions, and follow-up signals.
- Link high-value artifact dossiers from `{vault}/raw/artifacts/{slug}.json` when metadata is present.
- Do not duplicate full architecture docs into the Daily Note.
- Keep next-step content workplace-facing: what should be done, watched, or
  escalated after today. Do not turn Daily into an agent handoff document.
- Missing artifact index is acceptable and must not block output.

如果 `{vault}/raw/` 不存在或对应 week 目录不存在，跳过此步骤，全部走 Step 3 补漏。

### Step 3: Git log 补漏（次数据源）

用 `git log --stat` 获取当天所有 commit，与 JSON entries 对比，找出未覆盖的提交。

```bash
git log --since="<date> 00:00:00" --until="<date> 23:59:59" --pretty=format:"%h %s" --stat
```

**覆盖判断**：对比 commit subject 与 JSON entry 的 summary。如果 commit 的语义已被某个 entry 覆盖，跳过该 commit。

**未覆盖的 commit** 走简化分析流程：
- 只看 commit subject + stat（文件变更统计），**不做完整 diff 分析**
- 用分类系统的关键词匹配分类（不需要 LLM 语义分类）
- 生成轻量日报条目

如果 `<this-skill>/scripts/git-stats.sh` 可访问，也可用它获取结构化数据（但仍然跳过完整 diff）：

```bash
bash <this-skill>/scripts/git-stats.sh <repo_path> <date>
```

### Step 4: 分类（仅用于 Step 3 补漏的 commit）

Use `references/daily-note-writing.md` for keyword categories, optional LLM
semantic classification, and same-task merge rules. These rules apply only to
fallback commits. Do not reclassify raw entries.

### Step 5: 智能合并

**JSON entries（来自 Step 2）**：只合并明显重复或同源的工作项，不重新分类、不重写事实。`session-recap` + legacy `arch-doc` 同一变化合并为一条，保留 evidence/context。

**补漏 commits（来自 Step 3-4）**：按原合并规则处理 — 同功能多 commit 可合并为一条。

最终将两组数据合并，按项目和工作流排列进入 Step 6。

### Step 6: 生成日报内容

#### 多日期支持

用户可以指定日期范围（如 "补过去三天的日报"），此时 `date_end` > `date`：
- 每天生成独立的日期条目
- 按日期从新到旧排列

#### 增量更新检测

生成前先检查日报文件中是否已有当天条目（匹配 `### YYYY.MM.DD` 或 `### YYYY-MM-DD`）：
- **已存在** → 在当天条目下合并新增内容，不重复创建日期标题
- **不存在** → 创建新的日期条目

#### 输出格式

Use the exact output format and module label rules in `references/daily-note-writing.md`.

---

## 执行检查清单

**配置**:
- [ ] 配置文件存在（全局或项目级）或已创建
- [ ] 日报文件路径有效

**提交分析**:
- [ ] 获取了当天所有提交（reflog 交叉验证）
- [ ] 每个补漏 commit 都有 subject + stat 信息
- [ ] 量化了改动规模（+N/-M 行）

**输出质量**:
- [ ] 输出是面向上级/协作者的日报，而不是 agent 接力记录
- [ ] 每个项目包含进展、影响、风险/问题、下一步和来源/证据边界
- [ ] raw entry 的 `reporting` / `impact` / `status` 已正确反映在日报措辞中（如存在）
- [ ] raw entry 的 open questions / risks / decisions 已保留为汇报风险或下一步（如存在）
- [ ] artifact dossier 中的高价值 source links 已按需引用，未把全文复制进日报
- [ ] 格式与现有日报一致
- [ ] 已检查当天是否有重复条目
- [ ] 相关 commit 已智能合并
- [ ] 分类准确（必要时使用了语义分类）

## Reference 文件

| 文件 | 何时读取 |
|-----|---------|
| `references/daily-note-writing.md` | 分类、合并、写作风格、输出格式 |
| `references/config-template.yaml` | 配置文件示例 |
