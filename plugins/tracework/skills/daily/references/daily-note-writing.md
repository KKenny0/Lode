# Daily Note Writing Rules

Read this reference when generating or updating workplace daily reports from raw
entries or fallback git commits.

## Classification

Apply user-defined categories first. Use default categories only when no custom
pattern matches.

| Priority | Category | Match |
|----------|----------|-------|
| 1 | 用户自定义 | `daily_note.categories` patterns |
| 2 | 【能力升级】 | feat, enhance, add, new, implement |
| 3 | 【问题定位】 | fix, bug, resolve, repair, patch |
| 4 | 【结构变更】 | refactor, restructure, reorg, migrate |
| 5 | 【配置调整】 | config, setting, env, manager |
| 6 | 【文档优化】 | docs, doc, readme, comment |
| 7 | 【测试覆盖】 | test, spec, coverage |
| 8 | 【其他更新】 | fallback |

Raw change entry type mapping:

| JSON type | Daily note category |
|-----------|---------------------|
| `feature` | 【能力升级】 |
| `fix` | 【问题定位】 |
| `refactor` | 【结构变更】 |
| `decision` | 【其他更新】 |
| `risk` | 【其他更新】 |

When `enable_smart_classify: true`, use LLM semantic classification only for
fallback commits that land in 【其他更新】 after keyword matching. Do not reclassify
raw entries; they are already structured.

LLM classification guide:

- New functional code → 【能力升级】
- Error handling or edge-case fixes → 【问题定位】
- Code organization changes → 【结构变更】
- Configuration, environment, or parameter changes → 【配置调整】
- Documentation or comments only → 【文档优化】
- Tests only → 【测试覆盖】
- Clear dependency, CI, or tooling work may use a new bracketed category with a
  short note at the end of the daily note.

## Writing Style

Daily notes are workplace-facing daily reports. The primary reader is a manager
or collaborator who needs to know what changed today, why it matters, what is
blocked, and what should happen next. Monthly review is the second reader.

- Start from report value, not implementation detail.
- Prefer `reporting.outcome_candidate`, `reporting.impact_boundary`,
  `reporting.evidence_boundary`, `reporting.evidence_gap`,
  `reporting.module_scope`, and `reporting.hard_signals` when present.
- When `reporting` is absent, use `impact` first, then `summary` + `context`.
- Treat `impact` as a recorded claim whose wording must preserve its status and
  evidence boundary; do not strengthen an expected effect into a verified result.
- For `status: ongoing`, write progress language.
- For `status: risk`, keep the risk visible instead of converting it into a
  success statement.
- Preserve `open_questions`, `abandoned_alternatives`, and `type/status:
  decision` as workplace risk, decision, or next-step context. Do not use Daily
  as the agent handoff surface.
- If artifact dossier metadata points to a high-value source document, link the
  artifact title or path concisely. Do not paste long architecture docs into the
  daily note.
- The `[x]` marker, when present in legacy or fallback content, means the source
  activity was recorded as completed. It is activity metadata, not proof that
  the activity produced an outcome or impact.
- `+N/-M` line counts describe change size only. Never use line counts as
  outcome, quality, importance, or value evidence.

## Merge Rules

Raw entries from `{vault}/raw/weeks/` are already high-quality signals. Do not
merge them unless the same entry is duplicated exactly.

Fallback commits may be merged when they belong to the same task:

- Same conventional commit scope
- Same core files or module
- Semantic relation such as "add X" followed by "fix X edge case"

Merged fallback commits:

- Use the highest-priority category, for example feat + fix → 【能力升级】.
- Sum insertions and deletions.
- Produce one semantic description with concise detail lines for important
  commits.

Do not merge unrelated commits only because they happened on the same day.

## Output Format

```markdown
### YYYY.MM.DD

#### 今日摘要
- {1-2 bullets summarizing the day for managers/collaborators. State whether the day is raw-entry-backed, mixed, or git-only.}

#### 项目进展
- [项目名称]
	- 工作流：{work_stream or project_area}
	- 状态：raw-entry-backed | mixed | git-only；done | ongoing | risk | decision
	- 进展：{what moved today; outcome/progress/activity wording from reporting when present}
	- 影响：{observed/expected/unknown impact boundary; preserve evidence gap when present}
	- 风险/问题：{risk, open question, conflict, or "无明确风险记录"}
	- 下一步：{workplace-facing next action, watch item, or escalation}
	- 来源/证据边界：{verified | recorded | limited}；{raw timestamp, evidence_ref, commit, or artifact dossier link}
```

This is the default format. Preserve the `- [项目名称]` project label exactly so
monthly parsing remains stable. Use `状态：` and `来源/证据边界：` on every
project block so monthly review can preserve status and evidence gaps.

When the source is fallback git only, set `状态：git-only` or include `limited`
in `来源/证据边界：`. Do not imply decision intent, motivation, or verified
impact from commits alone.

When the source records several raw entries for one project, use multiple
project blocks only if they represent separate work streams. Otherwise merge
them into one block and keep risks/next steps visible.

Module labels:

- Single module: `（模块名）`
- Cross-module: `（模块A → 模块B → 模块C）`

Legacy checkbox/category format remains valid for historical Daily Note
content:

```markdown
- [项目名称]
	- {模块}
		- 【类别】
			- [x] （模块A → 模块B）语义化描述（+N/-M 行）
```

New output should use the report-led format above. Consumers must continue to
treat checkbox and line-count metadata as coverage/activity signals rather than
outcomes.

Incremental update rules:

- Match existing date headings in `### YYYY.MM.DD` or `### YYYY-MM-DD` format.
- Append under the existing date section when present.
- Do not create duplicate date headings.
- If no raw entries and no fallback commits exist for a date, report that there
  is no work to write and do not create an empty section.
