# Daily Note Writing Rules

Read this reference when generating or updating daily notes from raw entries or
fallback git commits.

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

Daily notes are human work logs, not code review records.

- Write intent and effect, not implementation mechanics.
- Use module scope markers like `（模块A → 模块B）`.
- Preserve important entity names such as config keys or schema names, but do
  not pack the sentence with function and field names.
- Prefer `impact` from raw entries when present; otherwise use `summary` plus
  `context`.
- For `status: ongoing`, avoid wording that implies completion.
- For `status: risk`, keep the risk visible instead of converting it into a
  success statement.

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
- [项目名称]
	- {模块}
		- 【类别】
			- [x] （模块A → 模块B）语义化描述（+N/-M 行）
				- 详细说明
```

Module labels:

- Single module: `（模块名）`
- Cross-module: `（模块A → 模块B → 模块C）`

Incremental update rules:

- Match existing date headings in `### YYYY.MM.DD` or `### YYYY-MM-DD` format.
- Append under the existing date section when present.
- Do not create duplicate date headings.
- If no raw entries and no fallback commits exist for a date, report that there
  is no work to write and do not create an empty section.
