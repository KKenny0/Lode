---
name: lode-git-daily-note
description: >
  Generate or update structured Obsidian daily notes from weekly change entries
  and git commit history. Triggers on updating daily notes/work logs/diary from
  git commits, generating work reports from git history, filling in missing
  daily notes for past dates, or summarizing today's work across repos.
  Key phrases: "更新日报", "写日报", "日报", "工作日志", "生成工作日志",
  "根据git提交写日报", "补日报", "daily note", "work log", "git daily".
  Do NOT trigger for writing code, git operations (merge/rebase/conflict),
  meeting notes, or generic reports without git context.
---

# Git 日报更新器

从 Lode weekly change entries 和 git 提交统计生成结构化的 Obsidian 日报内容。

---

## 配置系统

### 配置文件位置（优先级从高到低）

| 优先级 | 位置 | 说明 |
|--------|------|------|
| 1 | 项目根目录 `.lode/config.yaml` | 项目级覆盖 |
| 2 | `~/.lode/config.yaml` | 全局配置 |
| 3 | `$WEEKLY_PPT_PATH` 环境变量 | legacy fallback |
| 4 | `~/.weekly-ppt/` | legacy fallback 默认值 |

> **迁移说明**：旧版 `.daily-note-config.yaml` 已废弃。日报设置现在统一在 `.lode/config.yaml` 的 `daily_note:` 子节点下。如果检测到旧配置文件，提示用户迁移。

### 配置文件结构

```yaml
# Lode Configuration
# 全局: ~/.lode/config.yaml  |  项目级: {project-root}/.lode/config.yaml

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
1. 提示用户：`检测到首次使用 Lode。请提供知识库（Obsidian vault）路径来创建全局配置：`
2. 将配置写入 `~/.lode/config.yaml`
3. 如果用户希望项目特定配置，则写入项目根目录的 `.lode/config.yaml`

### 配置合并规则

项目级配置**覆盖**全局配置的同名字段。未配置的字段从全局配置继承。此 skill 的主产物依赖 `{vault}` 或明确的 `daily_note.path`；如果无法解析路径，提示用户配置 `knowledge_vault`。

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
1. 检查项目根目录 .lode/config.yaml
2. 检查 ~/.lode/config.yaml
3. 如果都不存在 → 回退到 legacy `$WEEKLY_PPT_PATH` → `~/.weekly-ppt/`
4. 如果仍无法解析 → 首次使用引导，创建全局配置
5. 合并配置（项目级覆盖全局级）
6. 如果 config 中没有 repos，尝试从 {vault}/raw/projects.json 读取项目路径作为补充
```

| 参数 | 来源 | 默认值 |
|------|------|--------|
| `daily_note_path` | 配置文件 `daily_note.path` | `{vault}/Daily Note.md` |
| `repos` | 配置文件 `daily_note.repos` → `{vault}/raw/projects.json` | 当前目录 |
| `date` | 用户指定 | 今天 (YYYY-MM-DD) |
| `date_end` | 用户指定 | 同 date（单天模式） |

### Step 2: 读取 weekly change entries（主数据源）

从 `{vault}/raw/weeks/{week}/{slug}.json` 读取当天已有的 change entries。

1. 计算 target date 的 ISO week（`date +%Y-W%V`）
2. 遍历所有 repos 对应的 slug，读取 `{vault}/raw/weeks/{week}/{slug}.json`
3. 筛选 timestamp 匹配 target date 的 entries（比较日期部分 YYYY-MM-DD）
4. 按 `references/daily-note-writing.md` 将 entries 映射为日报分类。

**JSON entries 已经是高质量结构化数据**（有 summary + context，可能有 impact/status/project_area/evidence_refs），不需要再做 diff 分析或分类。优先使用 `impact` 写日报描述；`status: ongoing` 不写成已完成，`status: risk` 保留风险语气。直接进入 Step 5 的智能合并。

If multiple raw entries describe the same work from different sources, merge them into one daily-note item instead of duplicating the same change. Prefer `session-recap` for intent and `arch-doc` for evidence/context. Preserve conflict or risk language explicitly when entries disagree.

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

如果 `scripts/git-stats.sh` 可访问，也可用它获取结构化数据（但仍然跳过完整 diff）：

```bash
bash <skill-path>/scripts/git-stats.sh <repo_path> <date>
```

### Step 4: 分类（仅用于 Step 3 补漏的 commit）

Use `references/daily-note-writing.md` for keyword categories, optional LLM
semantic classification, and same-task merge rules. These rules apply only to
fallback commits. Do not reclassify raw entries.

### Step 5: 智能合并

**JSON entries（来自 Step 2）**：只合并明显重复或同源的工作项，不重新分类、不重写事实。`session-recap` + `arch-doc` 同一变化合并为一条，保留 evidence/context。

**补漏 commits（来自 Step 3-4）**：按原合并规则处理 — 同功能多 commit 可合并为一条。

最终将两组数据合并，按分类和模块排列进入 Step 6。

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
- [ ] 语义化描述（意图/效果，非函数名/字段名）
- [ ] 每条改动标注了模块归属
- [ ] raw entry 的 `impact` / `status` 已正确反映在日报措辞中（如存在）
- [ ] 格式与现有日报一致
- [ ] 已检查当天是否有重复条目
- [ ] 相关 commit 已智能合并
- [ ] 分类准确（必要时使用了语义分类）

## Reference 文件

| 文件 | 何时读取 |
|-----|---------|
| `references/daily-note-writing.md` | 分类、合并、写作风格、输出格式 |
| `references/config-template.yaml` | 配置文件示例 |
