# Lode Agents-Sync and Auto-Capture Plan

## Background

Lode 当前定位是 personal tool：6 skill + cold-start，复合收益型，依赖用户主动 capture / daily / weekly / monthly。用户已自用 14 个月，价值已证，但传播困境来自产品类别本身（复合型 vs 即时型），优化实现无法跨越这道鸿沟。

经多轮 think 校准后，方向定为两条互补路径：

1. **降低坚持成本**：auto-capture 升级，让"无感生效"成为现实
2. **转向 agent 生态**：自动维护 `AGENTS.md` / `CLAUDE.md`，把 Lode 的产出物变成 agent 能消费的项目上下文

## Goal

让 Lode 在"复合型记忆工具"之外长出"agent 项目上下文同步器"这第二条价值路径，同时把现有 6 skill 的坚持成本降低。

## Implementation Principle（新增，覆盖整个 plan）

**所有 capture 类操作走 subagent + 低侵入主会话路径。** 参考 [tw93/waza `reviewer-architecture.md`](https://github.com/tw93/waza/blob/main/skills/check/agents/reviewer-architecture.md) 的范式：

- subagent 有单一身份定位（"You are a X specialist"）
- 明确的 focus areas 和禁止项
- 固定的结构化输出格式
- 严格的 scope rules

主会话只负责：调度 subagent、呈现结果给用户、执行用户确认的写入。所有"读 raw entries、合成内容、生成 diff"这类长上下文工作都在 subagent 内完成，主会话上下文窗口不被污染。

**现有 `skills/*/agents/openai.yaml` 不是真正的 subagent prompt**，只是 Codex 平台的快捷入口声明。本 plan 范围内会把 capture 和 agents-sync 两个 skill 真正 subagent 化；其他 skill（daily/weekly/monthly/roadmap）的 subagent 化不在本次范围。

## Scope

- 新增 `/lode:agents-sync` skill（subagent 实现，默认 dry-run）
- 把 capture skill 升级为 subagent 实现 + 接入双端 PreCompact hook
- 落地 AGENTS.md 模板（业界共识形态）
- 配套 dogfood：Lode 自己的 AGENTS.md 瘦身 + videowipe 上验证

## Non-Scope

- daily / weekly / monthly / roadmap 的 subagent 化（架构原则确立后可后续推进，但不在本 plan）
- daily / weekly / monthly 的 cron 自动化
- 适配 AGENTS.md / CLAUDE.md 之外的其他 agent 格式（`.cursorrules` 等）
- 重写现有 6 skill 的 raw entry schema
- 远端服务 / 托管 / SaaS

---

## Current State

- `skills/capture/` 已在记 `artifact_context`（scope / delta / source_of_truth）+ `sync_suggestions`，是 agents-sync 的天然数据源
- `skills/capture/SKILL.md` 当前是"主会话执行"假设：Step 1-4（分类、提取、生成、写入）都由主会话 agent 完成，会污染主会话上下文
- `skills/*/agents/openai.yaml` 是 Codex 快捷入口声明，不是 subagent prompt
- `auto_capture.enabled` 是 preference flag，实际触发靠 Claude Code Stop hook，且需用户手抄 `settings.json`
- **Codex 官方已正式支持 PreCompact / PostCompact hook**（[developers.openai.com/codex/hooks](https://developers.openai.com/codex/hooks)），且支持插件自带 hook（manifest `hooks` 字段或默认 `hooks/hooks.json`），插件启用即生效，零侵入用户全局配置
- Claude Code 端 PreCompact 也已支持（[code.claude.com/docs/en/hooks](https://code.claude.com/docs/en/hooks)）
- Lode 自己的 AGENTS.md 198 行，超出业界建议的 <150
- raw entries 质量（以 `videowipe.json` 为样本）：8 条 entries，含 4 处 `abandoned_alternatives`、2 处 `root_cause`、完整 `artifact_context`、`decision_threads` + `lifecycle_transition`、`sync_suggestions`。质量足够合成有用的 AGENTS.md

## Target State

- **capture 类操作 subagent 化**：主会话上下文窗口保持干净；capture / agents-sync 都通过专业 subagent 完成
- **PreCompact 双端触发**：Codex 插件自带 hook（零侵入）；Claude Code 由 cold-start 自动写 `~/.claude/settings.json`
- **延迟补模式（方案 A）**：PreCompact hook 不直接合成 raw entry，只写 pending 标记；下次 session 启动时由 subagent 消化 pending transcript
- **agents-sync**：能从 raw entries 合成 <150 行的 AGENTS.md diff，默认 dry-run
- **模板**：业界共识的 bullet-first <150 行模板落到 `skills/agents-sync/references/agents-md-template.md`

---

## Phase 1: Capture Subagent 化 + Pending 消化机制

**Effort**: Medium（subagent prompt 设计 + SKILL.md 重写 + pending 文件格式 + 消化逻辑）
**Dependency**: None
**Unlocks**: 主会话上下文干净；为 Phase 2 的 PreCompact 自动触发铺好"消化"路径

### 设计原则

参考 waza reviewer-architecture.md 范式，capture subagent prompt 包含：

- **单一身份**：`You are a session-recap specialist. Your job is reading a session transcript (or pending marker) and producing structured raw entries.`
- **Focus areas**：archetype 分类、report-worthy 信号提取、artifact_context 识别、sync_suggestions 命中
- **固定输出**：raw entry JSON 数组（schema 不变，与现有 `weekly-ppt-convention.md` 一致）
- **Scope rules**：不写过程日志、不拆分 coherent feature、不伪造字段
- **禁止项**：不与用户对话、不请求确认（输出 JSON，由主会话决定写不写）

主会话收到 subagent 返回的 JSON 后：
1. 调用 `lode_raw.py append-entry` 落盘
2. 向用户呈现 receipt（沿用现有 capture receipt 模板）
3. 失败时回退到现有 zero-config Markdown 输出

### Implementation

#### 1.1 设计 capture subagent prompt

新增 `skills/capture/agents/capture.md`（参考 waza reviewer 结构）：

```markdown
# Session Recap Specialist

You are a session-recap specialist. Your job is reading a session transcript
(or a pending marker referencing one) and producing structured raw entries
that are rich enough for weekly outlines, monthly reviews, decision roadmaps,
and session-start recall.

You receive: session transcript text or path, project slug, current ISO week.
Return: a JSON array of raw entries. No prose, no confirmation questions.

## Focus Areas

[archetype classification / motivation / abandoned alternatives /
root cause / artifact context / sync suggestions]

## Output Format

[JSON array matching weekly-ppt-convention.md schema]

## Scope Rules

- Maximum 5 entries; 1-3 is the normal range
- Group related work into logical units
- Skip process-only noise unless it explains a report-worthy signal
- Preserve "why", not just "what"

## Anti-Patterns

- Do not fabricate fields to satisfy the schema
- Do not ask confirmation questions
- Do not split one coherent feature across many entries
```

更新 `skills/capture/agents/openai.yaml` 引用这个 prompt（而不是只放 display name）。

#### 1.2 重写 `skills/capture/SKILL.md`

- Step 1-3（分类、提取、生成）合并为："dispatch to capture subagent with session context"
- Step 4（写入）仍由主会话执行（落盘需要工具权限，subagent 不一定有）
- 保留 zero-config fallback：subagent 不可用时降级为现有主会话流程

#### 1.3 设计 pending 文件格式

`{vault}/raw/pending/{session_id}.json`：

```json
{
  "session_id": "...",
  "transcript_path": "/abs/path/to/transcript",
  "cwd": "/abs/path/to/project",
  "trigger": "manual | auto",
  "platform": "claude-code | codex",
  "timestamp": "ISO 8601",
  "status": "pending"
}
```

设计原则：
- 只存指针（transcript path + 元数据），不复制 transcript 内容
- `status` 字段：`pending` → `consumed` → 可定期清理
- transcript 文件本身不修改、不依赖格式稳定性（只读路径）

#### 1.4 在 `recall` skill 中加 pending 消化逻辑

`recall` 在 SessionStart 时检查 `{vault}/raw/pending/`：
- 如果有 pending 文件，主动告知用户"上次 session 经历了 compaction，未做 capture，要不要补？"
- 用户同意后，dispatch capture subagent，输入是 pending 文件指向的 transcript
- 消化完成后 status 改为 `consumed`

`recall` subagent 化不在本次范围（recall 已经是低上下文负担，主会话执行 OK）。

### Validation

- 主会话上下文负担：dogfood 1 周，主观感受 + 观察主会话是否还需要长篇 recap 文本
- subagent 输出质量：与现有主会话 capture 输出做 5 组对比，评估字段完整度
- pending 消化端到端：制造一次 compaction → pending 落地 → 下次 session recall 提示 → subagent 消化 → raw entry 写入

### Rollback

- 删 `skills/capture/agents/capture.md`
- 还原 `skills/capture/SKILL.md`（git revert）
- 删 `recall` 中 pending 检查逻辑
- pending 文件可保留（不影响任何现有功能）

---

## Phase 2: PreCompact Hook 双端注册

**Effort**: Low-Medium（hook 注册 + Codex 插件 manifest 改动）
**Dependency**: Phase 1（pending 消化机制就位才能接住 hook 产生的 pending）
**Unlocks**: 长 session 不丢上下文，真正"无感"

### Implementation

#### 2.1 Codex 端：插件自带 PreCompact hook（零侵入）

利用 Codex 的 [plugin-bundled hooks 机制](https://developers.openai.com/codex/hooks)：插件 manifest `hooks` 字段或默认 `hooks/hooks.json`。

新增 `.codex-plugin/hooks/hooks.json`：

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "manual|auto",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"${PLUGIN_ROOT}/skills/capture/scripts/lode_raw.py\" write-pending --transcript \"${TRANSCRIPT_PATH}\" --cwd \"${CODEX_CWD}\"",
            "timeout": 30,
            "statusMessage": "Lode: marking pre-compact context for later capture"
          }
        ]
      }
    ]
  }
}
```

注意：
- `lode_raw.py` 新增 `write-pending` 子命令（写 pending JSON 文件，不试图合成 raw entry）
- `timeout: 30`（不用默认 600；hook 应快速返回）
- **不用 `continue: false`**——Lode 永不阻塞 compaction
- 用户启用 Lode 插件即生效，无需改 `~/.codex/config.toml`

#### 2.2 Claude Code 端：cold-start 自动写 hook

修订 `skills/cold-start-interview/SKILL.md`：用户同意 auto-capture 时，自动向 `~/.claude/settings.json` 追加 PreCompact + Stop 两个 hook 条目（保留打印 JSON 让用户手贴的 fallback）。

Hook command 同样调用 `lode_raw.py write-pending`（Path 调整为 Claude Code 风格）。

#### 2.3 更新文档

- `docs/configuration.md`：讲清 `auto_capture.enabled` 是偏好开关，真正触发靠 hook；双端策略
- `README.md`：诚实写明 Codex 通过插件 hook 自动生效，Claude Code 通过 cold-start 写 settings.json

### Validation

- Codex 端：装一次插件，跑长 session 触发 compaction，检查 `{vault}/raw/pending/` 是否产生 pending 文件
- Claude Code 端：跑 cold-start 后检查 `~/.claude/settings.json` 是否正确写入；触发 compaction 后同样检查 pending 文件
- dogfood 1 周：统计 pending 产生数 vs 实际 compaction 次数（目标 100%）

### Rollback

- Codex：删 `.codex-plugin/hooks/hooks.json`
- Claude Code：从 `~/.claude/settings.json` 删两个 hook 条目（cold-start 应提供对应的 remove 命令）
- pending 文件可保留可清理，不影响任何现有功能

---

## Phase 3: Agents-Sync Skill + AGENTS.md Template

**Effort**: Medium（5 new files + 2 manifest updates）
**Dependency**: None（手动 capture 也能用；不依赖 Phase 1/2）
**Unlocks**: agent 生态方向的实际产出

### Step 3a: AGENTS.md 模板（先落，独立可发）

创建 `skills/agents-sync/references/agents-md-template.md`：

- <150 行
- bullet-first，不写 narrative paragraph
- 6-8 个段：Project overview / Tech stack / Architecture / Conventions / Commands / Testing / Common pitfalls / Where to find more
- 明确 `@imports` 策略：超出长度的细节用 `@file.md` 引用

参考来源（已在 think 中验证）：

- Claude Code 官方 memory 文档：https://code.claude.com/docs/en/memory
- Hooks reference（PreCompact）：https://code.claude.com/docs/en/hooks
- Reddit 实践（routing file 哲学）：https://www.reddit.com/r/ClaudeAI/comments/1r66oo0/
- Marmelab 2026 agent-experience：https://marmelab.com/blog/2026/01/21/agent-experience.html
- SFEIR bullet-first 建议：https://institute.sfeir.com/en/claude-code/claude-code-memory-system-claude-md/tips/

### Step 3b: agents-sync subagent prompt（先于 skill 主体）

新增 `skills/agents-sync/agents/agents-sync.md`，参考 waza reviewer 范式：

```markdown
# Agents-Sync Specialist

You are an AGENTS.md / CLAUDE.md synchronization specialist. Your job is
reading recent raw entries and an existing AGENTS.md / CLAUDE.md, then
producing a structured diff that brings the agent-facing project file
in sync with the latest decisions, pitfalls, and artifact structure.

You receive: recent raw entries (JSON), existing AGENTS.md / CLAUDE.md (or null).
Return: a unified diff plus a quality-density score. No prose outside the diff.

## Mapping Rules

[artifact_context -> Repository structure /
root_cause -> Common pitfalls /
abandoned_alternatives + decision_threads -> Key decisions /
motivation + impact -> Project overview / Architecture /
sync_suggestions -> Files to keep in sync /
exploration_paths -> DO NOT include]

## Output Format

[unified diff + density score + skip reason if quality insufficient]

## Scope Rules

- Output must stay under 150 lines; spill to @imports when over
- Default is dry-run; never emit apply commands
- Skip when raw entry density is insufficient (only summary/context filled)

## Anti-Patterns

- Do not fabricate sections that have no raw entry evidence
- Do not include exploration_paths (too detailed for AGENTS.md)
- Do not produce apply commands; diff only
```

### Step 3c: `/lode:agents-sync` skill 主体

新建：

- `skills/agents-sync/SKILL.md`
- `skills/agents-sync/scripts/agents_sync.py`（路径解析 + raw entries 读取 + dispatch subagent + diff 呈现）
- `skills/agents-sync/references/agents-sync-output-format.md`
- `skills/agents-sync/references/agents-md-template.md`（来自 Step 3a）
- 在 `.claude-plugin/plugin.json` 和 `.codex-plugin/plugin.json` 注册

**核心流程**：

1. 读最近 N 周 raw entries（默认 N=4）
2. 读现有 `AGENTS.md` / `CLAUDE.md`（如有）
3. dispatch agents-sync subagent，输入是 raw entries + 现有文件
4. 主会话收到 diff 后呈现给用户
5. 默认 dry-run；用户显式确认或 `--apply` 后才写

**质量门控**：subagent 返回 density score，主会话据此决定是否呈现 diff 还是直接告知用户"capture 质量不够"。

### Validation

dogfood 三处：

- **videowipe**（raw entries 质量最高，预期产出最佳）
- **Lode 自己的 AGENTS.md**（同时瘦身 198 → <150）
- **keel**（中等数据量）

负向测试：

- 空 vault：subagent 应输出 "no entries to sync"
- 低质量 capture：subagent 返回 density score 不足，主会话告知用户
- AGENTS.md 已被手改：subagent 产出 reconciliation diff，不直接覆盖

### Rollback

删 `skills/agents-sync/` + 从 plugin manifest 移除。无持久状态。

---

## Risks and Rollback Points

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| PreCompact hook 阻塞 compaction | Low | High | timeout 设 30 秒；hook 只写 pending 标记，不做重活；永远不用 `continue: false` |
| 用户不愿让工具碰 AGENTS.md | Medium | High | 默认 dry-run；退一步只输出到 `.lode/agents-sync-suggestion.md` |
| capture 质量方差大导致 agents-sync 产出浅 | Medium | Medium | subagent 返回 density score；质量不足时主会话明确告知 |
| subagent 输出质量不如主会话当场写 | Medium | Medium | dogfood 期与现有主会话输出做 5 组对比；不行就回滚 |
| Codex transcript 格式不稳定 | Medium | Low | pending 只存 transcript 路径，不解析；解析由 subagent 在 transcript 仍可用时做 |
| Claude Code 写用户全局 settings.json 出错 | Low | Medium | cold-start 写入前备份；提供对应 remove 命令 |

## Validation Checklist

Phase 1:
- [ ] capture subagent prompt 符合 waza reviewer 范式（单一身份 / focus areas / 固定输出 / scope rules / 禁止项）
- [ ] 主会话上下文负担显著下降（主观验证）
- [ ] subagent 输出与原主会话 capture 质量相当（5 组对比）
- [ ] pending 文件格式稳定
- [ ] recall 正确识别并消化 pending

Phase 2:
- [ ] Codex 插件 hook 注册后无需用户改 config.toml
- [ ] Claude Code cold-start 自动写 settings.json 正确
- [ ] PreCompact 触发率 100%（compaction 发生时）
- [ ] pending 文件正确产生
- [ ] hook 不阻塞 compaction

Phase 3:
- [ ] AGENTS.md 模板符合业界共识（<150 行，bullet-first）
- [ ] agents-sync subagent prompt 符合 waza reviewer 范式
- [ ] videowipe 上跑通，产出可用
- [ ] Lode 自身 AGENTS.md 瘦身到 <150
- [ ] keel 上跑通
- [ ] 空 vault 不崩
- [ ] 低质量 capture 触发质量门控
- [ ] dry-run 默认，需要显式确认才写

---

## Differences from Prior Design

四轮 think 校准带来的修订：

1. **auto-capture 触发器**：Stop-only → PreCompact + Stop 双触发（用户提议 PreCompact，验证为 Claude Code / Codex 双端官方 event）
2. **AGENTS.md 模板前置**：原 plan 直接写 skill，修订为先落 template 再写 skill（用户提醒需要先研究最佳实践）
3. **raw entries 质量校准**：原 premise collapse "信息密度不够"被证伪（用户给出真实样本 `videowipe.json` 验证）
4. **不做 daily/weekly/monthly cron 自动化**：用户原提议包含，分析后判断 cron 不是核心痛点，延后
5. **Codex 端从"手动 fallback"升级为"插件自带 hook 零侵入"**（第四轮校准，用户提供 [Codex hooks 文档](https://developers.openai.com/codex/hooks) + [Issue #12208](https://github.com/openai/codex/issues/12208) 证据）
6. **PreCompact 触发策略选方案 A "标记 + 延迟补"**（用户决策）：hook 只写 pending，下次 session 由 subagent 消化
7. **所有 capture 类操作 subagent 化**（用户决策，参考 [tw93/waza reviewer-architecture.md](https://github.com/tw93/waza/blob/main/skills/check/agents/reviewer-architecture.md) 范式）：主会话只调度和呈现，长上下文工作在 subagent 内完成
8. **Phase 拆分调整**：原 Phase 1 拆为 Phase 1（capture subagent 化 + pending 消化）+ Phase 2（PreCompact hook 注册），保证各自独立可发

## Unknowns

两个原 Unknown 都已解决：

1. **Codex 端 PreCompact 等价物**：已解决。[Codex 官方 hooks 文档](https://developers.openai.com/codex/hooks) 确认 PreCompact 是正式 event，且支持插件自带 hook（manifest `hooks` 字段或默认 `hooks/hooks.json`），Lode 作为 Codex 插件可以零侵入接入。

2. **PreCompact timeout 阻塞风险**：已消除。链路：hook 只调 `lode_raw.py write-pending`（写 ~200 字节 JSON，毫秒级，不调 LLM、不读 transcript 内容）→ 真正 capture 由下次 session 的 subagent 异步消化，与 hook timeout 无关 → 显式 `timeout: 30` 作为双保险 → 永远不用 `continue: false`，Lode 不阻塞主流程是硬原则。

唯一实施时的工程项（不是 plan-level unknown）：`write-pending` 命令必须保证 mkdir、不依赖外部状态、毫秒级返回。在 Phase 2 实施时加 smoke test 验证。

Plan is decision-complete. No open unknowns.
