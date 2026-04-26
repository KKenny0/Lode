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

## 智能分类系统

### 分类优先级

| 优先级 | 类别 | 匹配方式 |
|--------|------|---------|
| 1 | 【用户自定义】 | 配置文件中定义的类别，按 patterns 关键词匹配 |
| 2 | 【能力升级】 | feat, enhance, add, new, implement |
| 3 | 【问题定位】 | fix, bug, resolve, repair, patch |
| 4 | 【结构变更】 | refactor, restructure, reorg, migrate |
| 5 | 【配置调整】 | config, setting, env, manager |
| 6 | 【文档优化】 | docs, doc, readme, comment |
| 7 | 【测试覆盖】 | test, spec, coverage |
| 8 | 【其他更新】 | 以上都不匹配时 |

### LLM 语义分类（当 `enable_smart_classify: true` 时）

当关键词匹配落入【其他更新】时，启用语义分类作为回退：

1. **关键词匹配** — 先用上表的快速路径匹配（零开销）
2. **语义回退** — 如果关键词匹配失败（落入【其他更新】），将 commit subject + diff 摘要交给 LLM 判断
3. **LLM 判断依据**：
   - diff 中新增了功能代码 → 【能力升级】
   - diff 中修复了错误处理/边界条件 → 【问题定位】
   - diff 中重新组织了代码结构 → 【结构变更】
   - diff 中调整了配置/参数 → 【配置调整】
   - diff 中仅有注释/文档 → 【文档优化】
   - diff 中仅增加了测试用例 → 【测试覆盖】
4. **LLM 也可以创造新类别** — 如果 diff 内容明显属于一个尚未定义的类别（如"依赖升级"、"CI/CD 调整"），LLM 可以用 `【新类别名】` 标注，并在日报末尾附注说明

语义分类的目标是让日报分类更贴近实际工作内容，而非机械匹配关键词。

---

## 写作风格：语义化优先

日报是给人读的工作日志，不是 code review 记录。

- **写意图，不写实现** — "数据格式从嵌套对象简化为自然语言" 而非 "`SomeSchema.field_a` 从 `dict` 改为 `str`"
- **写效果，不写手段** — "绑定时能匹配到正确选项" 而非 "新增 `_resolve_match()` 遍历查找"
- **标注模块归属** — 每条改动用 `（模块A → 模块B）` 标注影响范围，从 commit scope 和 diff 文件路径推断
- **保留关键实体名作为锚点** — 配置项名、schema 名可保留，但不要堆砌整个句子

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
4. 将 entries 按 type 映射为日报分类：

| JSON type | 日报分类 |
|-----------|---------|
| `feature` | 【能力升级】 |
| `fix` | 【问题定位】 |
| `refactor` | 【结构变更】 |
| `decision` | 【其他更新】 |
| `risk` | 【其他更新】 |

**JSON entries 已经是高质量结构化数据**（有 summary + context），不需要再做 diff 分析或分类。直接进入 Step 5 的智能合并。

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

#### 5a. 分类

按分类优先级匹配。如果 `enable_smart_classify: true`，关键词匹配失败时启用 LLM 语义分类回退。

#### 5b. 同功能多 commit 智能合并

识别属于同一功能/任务的多个 commit，合并为一条日报条目：

**合并信号**（满足任一即可合并）：
- commit scope 相同（如 `feat(auth): ...` 和 `fix(auth): ...`）
- diff 涉及相同的核心文件
- commit message 语义关联（如 "add X" 后跟 "fix X edge case"）

**合并规则**：
- 取最高优先级的类别作为合并后的类别（如 feat + fix → 【能力升级】）
- 行数累加（+N1+N2 / -M1-M2）
- 语义描述合并为一条，涵盖整体意图
- 详细说明保留每个 commit 的关键信息

**不合并**：完全无关的 commit 保持独立。

### Step 5: 智能合并

**JSON entries（来自 Step 2）**：不合并，已经是高质量结构化数据。直接进入 Step 6。

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

```markdown
### YYYY.MM.DD
- [项目名称]
	- {模块}
		- 【类别】
			- [x] （模块A → 模块B）语义化描述（+N/-M 行）
				- 详细说明
```

模块标签规则：
- 单模块：`（模块名）`
- 跨模块：`（模块A → 模块B → 模块C）`，按改动链路排列

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
- [ ] 格式与现有日报一致
- [ ] 已检查当天是否有重复条目
- [ ] 相关 commit 已智能合并
- [ ] 分类准确（必要时使用了语义分类）
