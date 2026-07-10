# Daily Note Writing Rules

Use these rules after reading `reporting-narrative-contract.md`.

## Source Priority

1. Raw entry factual fields: `summary`, `context`, `status`, `impact`,
   `motivation`, `root_cause`, decisions, risks, and evidence refs.
2. Optional `reporting` metadata for claim kind and impact/evidence boundary.
3. Artifact dossiers for concise navigation and recorded scope.
4. Git subjects and stats for uncovered activity only.

Old rich `reporting` objects remain readable. Treat channel-specific
`carry_forward` text as a hint, not as current truth; later entries may have
changed the state.

## Merge and Selection

- Merge entries that describe the same work-stream state transition.
- Do not split one coherent arc by commit, file, module, or archetype.
- Keep genuinely independent work separate.
- Rank headline candidates by end-state significance, intended-reader
  relevance, evidence strength, and effect on the next decision.
- Use two to four headline advances per reporting group, normally three.
- Put meaningful non-headline work under `其他活动`; do not drop it.

Legacy category labels may still be parsed, but new reports do not organize the
main narrative as 能力升级/问题定位/结构变更. Those labels describe activity
type, not why the day matters.

## Daily Judgment

Write one or two sentences per reporting group. State:

- the most important end-state change;
- the main remaining gate or risk;
- whether any escalation is needed.

Do not list projects in the judgment. Synthesize the day.

## Headline Item

Each project block should make the narrative spine visible through concise
fields:

- `收口类型`: `delivery`, `decision`, `risk`, or `learning`.
- `状态`: source coverage plus `done`, `ongoing`, `risk`, or `decision`.
- `进展`: starting situation, decisive movement, and current state.
- `影响`: observed, expected, or unknown management meaning.
- `风险/问题`: unresolved gate, conflict, or `无明确风险记录`.
- `下一步`: the next acceptance gate, watch item, or escalation.
- `来源/证据边界`: `verified`, `recorded`, or `limited`, plus concise refs.

The next step is not an agent handoff or a task dump.

## Output Format

Single reporting group:

```markdown
### YYYY.MM.DD

#### 今日判断

{1-2 sentence management judgment. State raw-backed, mixed, or git-only when material.}

#### 关键推进

- [项目名称]
  - 工作流：{work_stream}
  - 收口类型：{delivery | decision | risk | learning}
  - 状态：{raw-entry-backed | mixed | git-only}；{done | ongoing | risk | decision}
  - 进展：{starting situation -> decisive movement -> end state}
  - 影响：{observed | expected | unknown}；{management meaning}
  - 风险/问题：{remaining gate, conflict, or 无明确风险记录}
  - 下一步：{next acceptance gate, watch item, or escalation}
  - 来源/证据边界：{verified | recorded | limited}；{concise refs}

#### 其他活动

- [项目名称] {bounded coverage statement and evidence boundary}

#### 需要关注或决策

- {only when an escalation, decision, or cross-team dependency exists}
```

Omit optional sections when empty.

For `all`, repeat the report body under separate group headings:

```markdown
### YYYY.MM.DD

#### 公司工作

##### 今日判断
...

##### 关键推进
...

#### 个人项目

##### 今日判断
...
```

Never create one judgment or headline ranking across groups.

## Compatibility

- Preserve `- [项目名称]` exactly.
- Preserve `状态：`, `进展：`, `影响：`, `风险/问题：`, `下一步：`, and
  `来源/证据边界：` so Monthly can parse new reports.
- Accept historical checkbox/category content without rewriting it.
- `[x]` and line counts are activity metadata, not result evidence.
- When updating an old-format date section, append the new report-led block
  without deleting user-authored history.

## Fallback Boundaries

Git-only output is useful but limited:

- Phrase it as activity or bounded progress.
- Do not invent a starting constraint, management effect, decision, risk, or
  evidence grade that the commit does not support.
- Filter chore-only noise.
- Suggest targeted capture only for a specific missing decision, risk, or
  evidence gap worth preserving.
