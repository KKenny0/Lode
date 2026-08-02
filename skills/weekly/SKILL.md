---
name: weekly
description: >
  Generate a management-facing weekly report from Tracework raw entries, using
  git only as limited fallback coverage. Supports work, personal, and private
  all-project scopes. Three modes: quick conversation review ("这周做了啥",
  "周报简版", "quick weekly", "本周概要"), default Markdown brief ("写周报",
  "周报", "/tracework:weekly", "weekly brief", "本周总结", "weekly report"),
  and PPT-ready Markdown Deck only when weekly PPT is explicit ("weekly PPT", "周报 PPT",
  "weekly slides", "演示大纲"). Do not use for daily notes, generic slide
  decks, or single-commit analysis.
---

# Tracework Weekly

Turn a week of agent work into an objective-anchored feedback loop: what the
period was meant to advance, what actually changed, why reality diverged, what
management judgment follows, and what commitment comes next. Preserve all
meaningful work without inventing a retrospective goal.

## Modes

Resolve mode before gathering evidence. Prefer the strongest explicit cue.

Priority when cues conflict: `slides` > `quick` > `brief`.

| Mode | Triggers (examples) | Output | Write files | Heavy slide rules |
| :--- | :--- | :--- | :--- | :--- |
| `quick` | 这周做了啥, 周报简版, quick weekly, 本周概要 | Conversation 5–7 bullets + carried-forward | No | No |
| `brief` | 写周报, 周报, /tracework:weekly, weekly brief, 本周总结, weekly report | Management brief | Yes when vault exists; else conversation | No |
| `slides` | weekly PPT, 周报 PPT, weekly slides, 演示大纲; or PPT/slides only after this skill is already selected for a weekly report | Audience-framed PPT-ready Markdown Deck, max 8 main slides; optional editable template-native PPTX when explicitly requested and supported | Same as brief; PPTX is a versioned copy | Yes |

Default is `brief` when the request is a normal weekly report without PPT or
quick wording. Do not treat bare “PPT” or “slides” alone as a reason to start
this skill; those words select slides mode only inside an already weekly
report request.

Slide mode projects the weekly analysis for one primary audience, occasion, and
communication job. Do not combine managers, peers, and technical reviewers. If
the framing question is skipped, default to a five-minute manager decision brief.

## Progressive References

Always:

- `references/reporting-narrative-contract.md` for scope partition, selection,
  closure, evidence, and audience safety.

For Weekly, the goal-loop rules below replace the shared contract's default
headline and next-target counts. Scope, evidence, closure, and audience-safety
rules remain unchanged.

For `brief` and `slides` only:

- `references/weekly-analysis-contract.md` for structured analysis. Use the brief
  analysis path unless mode is `slides`.
- `references/weekly-brief-template.md` for brief output (and as analysis
  backbone before slides).

For `slides` only:

- Full slide sections in `references/weekly-analysis-contract.md`
- `references/slide-template.md`

Do not read `slide-template.md` for `quick` or `brief`.

## Inputs and Output

Resolve `{vault}` from project then global `.tracework/config.yaml`.

Defaults:

- Date range: current Monday through today.
- Scope: resolve with First-Run and Local Fallback below. Do not silently force
  unassigned projects into `work`.
- Mode: as above; default `brief`.
- Slides framing: user-supplied audience, occasion/duration, decision, and optional PPTX template path; no persistent template registry or style config.
- Brief/slides file output: `{vault}/Work Diary/Weekly/{YYYY-WNN}.md`, unless
  the user or config provides another path. Write that file only for normal
  scoped group output. Quick mode, no-vault runs, and local first-run stay in
  conversation so unassigned content is not written into workplace weekly files.

If the target brief/slides file exists, ask before overwriting unless the user
requested update, rewrite, or overwrite. If no vault exists, return brief or
slides content in conversation. Quick mode always stays in conversation.
Cold-start is optional upgrade copy, never a hard gate.

For an explicitly requested editable PPTX, preserve the template and write a
versioned copy. Without presentation-editing capability, deliver Markdown and
state the boundary; never imitate editability with flattened slide images.

## First-Run and Local Fallback

Weekly must produce value without prior setup.

### Scope resolution

1. If the user explicitly names `all` or an exact reporting group such as
   `work` or `personal`, that scope is **explicit**.
2. Else if `profile.default_reporting_group` is configured, that scope is
   **configured**.
3. Else the scope is **implicit**.

### Partition rules

- **Explicit or configured** `work` / `personal` / named group:
  - Include only matching projects.
  - Exclude `unassigned`. Never promote unassigned into `work`.
  - If empty because the current project is unassigned, return a clear
    excluded/empty result with repair hint:
    `/tracework:cold-start-interview` or set `profile.reporting_group`.
  - Do not fail the skill.

- **Implicit** scope (no explicit group, no configured default):
  - If the current project has a `reporting_group`, use that group.
  - If the current project is `unassigned` or has no project config, enter
    **local first-run**:
    - Report only the current repository.
    - Label scope `local` (unassigned), never `work`.
    - Use git plus any raw entries for that repo.
    - Mark git-only material `limited`.
    - Hint that workplace-scoped reports need `reporting_group`.
  - Do not mix unrelated assigned vault projects into a local first-run.

### No vault

- Always allowed for quick, brief, and slides.
- Write nothing to disk.
- Keep the narrative short; use conversation output.
- End brief/slides with at most one upgrade line:

  > 可选：配置 knowledge vault 后可跨天累计并写入文件。`/tracework:cold-start-interview`

- Do not imply the run failed because setup is missing.

### Empty signal

If local first-run has no raw entries and no meaningful git activity, return a
short empty-state and suggest capture or waiting for more work signal.

### Conversation brief shape (no vault or local first-run)

When not writing the weekly file, a compact brief is enough:

```markdown
## {YYYY-WNN} · {work | personal | all | local}

**目标与判断：** {confirmed goal, inferred goal with boundary, or 目标未记录}；…

### 目标推进
- {goal}: {actual change and status}

### 偏差与决策
- {variance, replanning, decision, support, or unplanned material change}

### 下周承诺
- {commitment}: {pass/fail closure criterion}

### 证据边界
- raw / git / limited 各一句

---
可选：配置 knowledge vault 后可跨天累计并写入文件。`/tracework:cold-start-interview`
```

## Workflow

### 0. Resolve Mode, Range, and Scope

1. Choose `quick`, `brief`, or `slides` from the mode table.
2. Resolve week range and scope class (explicit / configured / implicit).
3. If mode is `quick`, follow **Quick Mode** and stop after its quality gate.
4. Otherwise continue with partition → evidence → goals → analysis → write.

### 1. Resolve and Partition

1. Load projects from the prompt, `raw/projects.json`, or current repo.
2. Resolve each project's `reporting_group` from project config, then registry.
3. Apply First-Run and Local Fallback with the audience-safety rules.
4. For normal scoped output, filter to the exact requested group. For `all`,
   keep groups separate throughout analysis and writing.
5. Exclude unassigned projects from scoped `work` / `personal` output and
   report the missing classification. Show them separately only in `all`.
6. For local first-run, keep a single `local` lane for the current repo.

### 2. Gather Evidence

For every in-scope project or the local lane:

1. Read matching `{vault}/raw/weeks/{week}/{slug}.json` entries when a vault
   exists.
2. Read the previous Weekly's next-period items as editorial context when it
   exists. Preserve whether each item was a confirmed commitment or only a
   report proposal; never silently promote a proposal.
3. Read explicit goal sources available in the request or project, such as a
   milestone or current `PLAN` artifact. Read only sources needed to establish
   the reporting goal.
4. Read optional artifact dossiers for navigation and recorded scope.
5. Run a lightweight git log only to detect uncovered work.
6. Merge duplicate raw/git signals before analysis.
7. Without a vault, use git coverage and conversation context only.

Raw entries are the semantic source. Git-only work remains `limited` and cannot
substantiate a completed outcome or invented trade-off.

### 3. Resolve Goals and Prior Commitments

Resolve each goal lane from the strongest available source:

1. an explicit goal in the current request;
2. a confirmed commitment from the previous Weekly;
3. an explicit milestone, plan, or project-goal artifact;
4. a goal inferred from raw motivation, decision, or carry-forward;
5. `unknown`.

Record the goal statement, source, confidence, closure criterion, status, and
commitment state. Confidence is `confirmed`, `inferred`, or `unknown`; status is
`met`, `advanced`, `blocked`, `replanned`, or `not_started`; commitment state is
`confirmed` or `proposed`.

For `brief` and `slides`, if no reliable goal exists, ask at most one question:

> 这周原本最重要的是推进什么？

If the user skips it, continue with `目标未记录`. Never backfill a confirmed Why
from completed activities. Quick mode does not ask this question.

`reporting_group` is an audience and privacy boundary, not proof that its
projects share one objective. Keep separate goal lanes when no common goal is
recorded.

### 4. Analyze Change and Variance (brief and slides)

Apply `references/weekly-analysis-contract.md` in the main dialog. For `brief`,
do not build slide candidates, diagrams, or chart briefs unless the user later
upgrades to slides.

For every prior commitment, record whether it was met, advanced, blocked,
replanned, or not started. No prior commitment may disappear.

Connect every material weekly change to a goal lane. When no honest link exists,
label it `unplanned but material` or keep it in the portfolio. Preserve the old
goal, evidence trigger, reason, and new direction for replanned work.

Rank goal-linked and unplanned material changes inside each reporting group by:

- observable end-state significance;
- management relevance;
- evidence strength;
- effect on the next planning decision.

Write one weekly judgment per group. Do not force a headline count. Multiple
activities may support one change, and one goal may need multiple changes when
they carry distinct management meaning. Put every remaining meaningful stream
in the portfolio table. Do not allocate prose by entry count.

### 5. Project the Brief When Requested

Skip for `quick` and `slides`. For `brief`, apply **Brief Projection** in
`references/weekly-analysis-contract.md`: keep only blocks whose removal would
change judgment, action, or confidence in the body; route accountability,
coverage, and provenance to the appendix. Use one expanded home per fact and no
fixed length or item count.

### 6. Build the PPT-ready Markdown Deck

Skip this entire step for `quick` and `brief`. Run it only for `slides`.

Transform the stable Weekly Analysis and its raw sources into audience-facing
presentation content before applying `references/slide-template.md`.

1. Apply **Audience and Occasion Framing** and **Main-deck Admission** from
   `references/weekly-analysis-contract.md`; use its default when framing is skipped.
2. Form the fewest internal Stories and run **Cognitive Task Decomposition**;
   keep its labels internal and give each retained task one supported claim.
3. Apply **Source Grounding** and **Content Materialization**. Use the exact
   commit plus an eligible immutable snapshot; never infer history from a branch
   or today's `HEAD`. Without a snapshot, narrow to the commit tree or degrade.
4. Split only for independent supported claims with distinct grounded content
   and a prerequisite relationship. Otherwise merge. With a template, finish
   this decision only after native-layout fit.
5. Use the supported claim as the public title and make the body visibly prove
   it. Route implementation inventory and provenance to notes or appendix.
6. Keep only compact claim-to-source mapping in the Evidence Appendix. Hide all
   authoring and production analysis.
7. Delete pages whose removal does not change the audience outcome. Keep at most
   eight necessary main slides.

If data is missing, incomparable, or contradictory, do not invent a chart.
Use a mechanism or state-change diagram, lower the evidence boundary, expose
the measurement gap, and name its closure criterion.

For an explicitly requested template-native PPTX, follow the optional contract
in both slide references. Reuse runtime capability; do not build a renderer.

### 7. Write

- `quick`: conversation only; see Quick Mode.
- `brief`: use `weekly-brief-template.md`.
- `slides`: use `slide-template.md`; emit 1-8 necessary slides with no preset
  target, or return an evidence-insufficient empty state without a deck file.
- Keep claim-level evidence in the appendix. Main prose must be readable
  without report-local ids.
- Preserve risks, unresolved decisions, and evidence gaps.
- Preserve confirmed versus proposed commitments and inferred versus confirmed
  goals.
- Keep tables, full commitment accounting, portfolio coverage, and provenance
  in the brief appendix. The brief body uses prose and bullets only.
- Keep `limited`, conflicting, and expected-only boundaries beside the body
  claim they qualify. Verified provenance can remain in the appendix.
- When evidence is thin or git-only, keep the main narrative short and mark
  `limited` explicitly rather than padding with architecture theater.

## Quick Mode

Triggers: `这周做了啥`, `周报简版`, `quick weekly`, `本周概要`, and clear
equivalents.

Behavior:

1. Resolve week range and scope class with First-Run and Local Fallback.
2. Partition accordingly. Explicit/configured `work` / `personal` still exclude
   unassigned. Implicit unassigned current repo uses `local`.
3. Read raw entries for in-scope projects when a vault exists. Optionally glance
   at git to detect uncovered commits.
4. Do not read `slide-template.md` or build slide candidates, diagrams, or
   implementation narratives.
5. Output 5–7 bullets in the conversation only. Prefer
   `[archetype] summary`-style lines grounded in raw fields; git-only bullets
   stay bounded and `limited`.
6. Append at most three carried-forward lines for open risks or unresolved
   decisions.
7. If no raw entries but meaningful git exists: say evidence is `limited`, list
   at most a few commit-derived bullets without inventing intent, and offer a
   full brief.
8. If no raw and no usable git: empty-state with a short hint to capture or run
   a full brief after more work signal exists.
9. If explicit scope excluded the current unassigned project, say so and point
   to reporting_group setup instead of returning a silent empty list.

Suggested shape:

```markdown
## {YYYY-WNN} 快速回顾（{scope}）

- [decision] …
- [build] …
- [repair] …

**结转**：… · …
```

Do not write vault files in quick mode. A single optional upgrade line is
allowed; do not block on cold-start.

## Coverage

Calculate project coverage as raw entries versus uncovered commits, but put
coverage badges in the appendix or portfolio—not in the headline narrative.

- High: raw explains intent and status.
- Moderate: mixed raw and git-only gaps.
- Low: mostly git-only; narrative is limited.
- None: no usable work signal.

Coverage measures source completeness, not value. Quick mode may mention
coverage in one line; it does not need badges.

## Quality Gate

### Shared (all modes that emit scoped narrative)

- Scope class (explicit / configured / implicit-local) was resolved before
  ranking or bullet selection.
- `work` contains no personal or unassigned titles, paths, commits, artifacts, or refs.
- Local first-run is labeled `local` / unassigned, never presented as safe `work`.
- Explicit scoped emptiness explains exclusion and repair without leaking
  unassigned content into `work`.
- No-vault runs return conversation output without blocking on cold-start.
- Evidence grades and uncertainty are preserved; git-only material stays `limited`.
- Activity volume is never promoted into outcomes.

### Quick only

- Conversation output only; no weekly file write.
- 5–7 bullets, plus at most three carried-forward lines.
- No slide structure, solution-logic diagrams, or implementation narratives.

### Brief only

- Every group has exactly one weekly judgment.
- Every goal states its source, confidence, status, and closure criterion.
- Inferred or unknown goals never use confirmed-goal language.
- Every prior commitment is accounted for; proposals remain proposals.
- Every material change is goal-linked, explicitly unplanned, or in the
  portfolio.
- Replanned work preserves the prior direction, evidence trigger, reason, and
  new direction.
- Every meaningful remaining stream appears in the portfolio.
- Every unresolved risk or next commitment has a concrete closure criterion.
- The body alone reconstructs goal state, actual change, material variance,
  decision or support, next commitment, and confidence boundary.
- Every body block survives counterfactual deletion; full prior-item,
  portfolio, and evidence coverage stays in the appendix.
- The body contains no tables, source paths, commit lists, or evidence index.
- Appendix ledgers and mappings do not repeat body narrative.
- Brief mode does not require diagrams, implementation narratives, or charts.

### Slides only

- Emit 1-8 necessary slides with no preset target; zero admitted candidates
  produce an empty state rather than a deck file.
- One primary audience, their prior knowledge, the occasion or duration, the
  deck job, and the required audience outcome are resolved before slide
  selection.
- The deck states one evidence-bounded thesis and audience decision; slides form
  a cumulative argument rather than mirror Weekly Analysis fields.
- Story Why/Goal and cognitive roles remain internal authoring logic, not
  mandatory public headings.
- Every title states a supported audience-facing claim; the body visibly proves
  it and keeps the evidence boundary beside the claim.
- Slides directly contain supported facts, relations, comparisons, mechanisms,
  numbers, boundaries, and risks using Markdown, Mermaid, tables, quotes, or
  concise lists.
- Complex design/mechanism results form two content pages under one Story only
  when the second depends on the facts and trade-offs established by the first.
- Simple results remain one content page when one Before/After, relation, or
  flow explains root cause, choice, and operation.
- A fresh member of the target audience can state the thesis, confidence
  boundary, and requested decision or action after a short read without a PPT
  or production instructions.
- A maker using only the Markdown Deck can perform visual translation without
  vault research, semantic invention, or a new split decision.
- Removing any slide changes the audience's decision, understanding, or
  confidence.
- Charts require comparable evidence; missing or conflicting data stays visible
  without a fabricated chart.
- Mechanism completion, effect validation, and production acceptance are stated
  separately.
- Main slides omit commit hashes, source locations, SDK line numbers, and raw
  evidence ids unless the user explicitly requested a technical-review deck.
- Template-native PPTX pages map to source slides, remain editable, pass rendered
  checks, preserve the prior version, and survive a scoped revision. Stable jobs
  keep ids; changed evidence may add, remove, or reorder pages.

## Anti-Patterns

### All modes

- Flat project or commit list as the overview.
- Cross-group themes in `all` mode.
- Activity volume promoted into outcomes.
- Retrofitting a confirmed Why from completed actions.
- Treating a report proposal as a prior commitment.
- Hiding a prior goal when evidence caused a replan.
- Forcing unrelated projects in one reporting group under a shared goal.
- Keeping a body block whose removal changes neither judgment, action, nor
  confidence.
- Repeating the same narrative in the body and appendix.
- Hiding a blocked/replanned material item, decision request, or evidence
  conflict only in the appendix.
- Hiding work because it did not qualify as a headline (brief/slides) or
  omitting material risks from carried-forward (quick).
- Treating expected impact as an observed result.
- Treating code completion as production acceptance.
- Applying slides-only diagram or implementation-narrative gates to brief or
  quick output.

### Brief and slides

- Evidence ids dominating the spoken narrative.

### Slides only

- One slide per stream by default.
- Fixed “design slide + implementation slide” pairs.
- A public Storyboard or Production Brief beside the public Markdown Deck.
- `Audience takeaway`, `Recommended visual form`, `Page composition`,
  `On-slide copy`, `Production constraints`, or page-level Source Grounding
  Packet sections in the public deck.
- Public Story Why/Goal or cognitive-role scaffolding that the audience would
  not expect to see in the actual presentation.
- Topic, question, process, or object-only titles that hide the supported claim.
- A design slide that only supplies background, history, or option inventory.
- A mechanism slide that is only a module, field, code, or step list.
- Two slides that do not perform independent cognitive work.
- Content that makes the reader or PPT maker reopen the vault to discover the
  actual claim, node, relationship, number, or risk.
- Layout, typography, color, card, or diagram-production instructions.
- A detail slide whose removal changes neither thesis nor audience decision.
- Topic-only slide titles such as `结果弧线一`, `方案怎么跑通`, or
  `工作组合状态`.
- Charts without comparable evidence, units, or sample context.
- Decorative architecture diagrams with only component names and arrows.
- Ungrounded, wrong-cutoff, target-as-current, or prose-reformatting diagrams.
- Using a solution-logic diagram as proof of effectiveness.
- Bundled style galleries, flattened slides, or a custom version database when
  a user-owned template and versioned files already solve the need.
