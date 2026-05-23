---
title: See Lode in Action
description: Real outputs from 14 months of daily use. Every example below is actual Lode output, lightly sanitized.
---

# See Lode in Action

<div class="showcase-stats">
<div class="stat"><strong>14</strong><span>MONTHS OF DAILY USE</span></div>
<div class="stat"><strong>8</strong><span>SKILLS</span></div>
<div class="stat"><strong>0</strong><span>MOCKS</span></div>
</div>

Every example below is real Lode output, lightly sanitized. No demos, no synthetic data.

---

## 01 / Daily Note

Every day, automatically structured.

::: info What to notice
Four-level hierarchy: **project → module → change type → specific task**. Generated from raw entries + git history. No manual writing.
:::

```markdown
### 2026.05.05
- [Content Pipeline]
  （API 层）
    【结构变更】
      - [x] （routes → errors/helpers）集中 API 错误码至 AppError 枚举，抽取共享路由辅助函数，
      统一三模式（Direct/Callback/Interactive）错误响应结构（+240/-231 行）
        - 修复 2 个 P0 bug：exception handler 访问 task_id 崩溃、interactive fireCallback 参数错位
        - 引入模型继承，消除 contracts 中的重复定义
    【能力升级】
      - [x] （API → Direct）Direct 模式新增 callback_url 支持，Pipeline 完成后通过
      BackgroundTasks 触发回调通知（+17/-4 行）
      - [x] （API → Testing）新增 mock callback server 工具，支持本地验证完整 webhook 流程（+58 行）

### 2026.05.06
- [Content Pipeline]
  （Orchestrator → Core → Schemas → API）
    【结构变更】
      - [x] pipeline_runner 大规模拆分，按职责分离为 4 个子模块，新增 RegistrySnapshot 类型约束，
      TTL 缓存替代 lru_cache，健康检查增加 LLM provider 可达性探测（+1348/-1040 行）
        - pipeline_runner 从 1829→802 行，单文件膨胀问题解决
        - 原子 JSON 写入防止 registry 数据损坏
  （Schemas）
    【问题定位】
      - [x] LLM 输出模型 extra 策略从 forbid 放宽至 ignore，防止 LLM 输出字段错位导致 stage 崩溃
      （+10/-10 行）
        - 修复 extract_characters 因 variant_label 层级错误而 crash 的生产问题

### 2026.05.07
- [Content Pipeline]
  （Props → Characters → Registry → Output）
    【能力升级】
      - [x] 道具提升为一等实体，新增独立 ItemProfile 模型（item_id/scene_prompt/holders/state_variants），
      在 extract_characters 中联合提取，registry v2→v3 迁移并兼容旧数据（+359/-21 行）
        - 联合提取方案避免新增 pipeline stage，单次 LLM 调用零额外开销
```

---

## 02 / Weekly Report

PPT-ready weekly outline, zero manual writing.

::: info What to notice
Slide-structured reports with **problem → solution** narrative. Each row in the risk table traces back to an original raw entry.
:::

```markdown
# 2026-W21 Content Pipeline Weekly Report

> Signal coverage: High — 11 raw entries, 3 git-only gaps (minor config)

## Slide 2: Overview

- **English Script Pipeline Compatibility:** Fixed character name localization, binding
  validation failures, on-screen text translation, and rolling mode inconsistencies triggered
  by English-language scripts across the full pipeline
- **Content Fidelity & Efficiency:** Enhanced text/numeric retention rules based on
  cross-script analysis, optimized batch prompt token waste, fixed over-aggressive dialogue rules
- **Location Name Three-Layer Defense:** Built a cascade from prompt constraints to
  code-level enforcement across parse → analyze_scenes

## Slide 3: Problem — English Script Pipeline Breaks

| Problem                   | Break point                                | Impact                                              |
| Character names localized  | extract_characters prompt requires Chinese | Agent K → 特工 K, binding set breaks               |
| Canonical name truncation   | LLM returns "Guardians" not "Guardians (Squad)"  | Strict set containment check fails                  |
| On-screen text translated   | "原文" (original) is ambiguous             | English panel text → Chinese                        |
| Rolling mode inconsistency  | Parse LLM translates names unstably        | Same character gets different names across episodes |
| Dialogue prefix won't strip | canonical ≠ raw + rf-string bug            | 22% of dialogue entries keep full prefix            |

## Slide 4: Technical Solution

Phase 1 (May 18) — Character name & binding chain fix:

    parse (characters: Agent K, keep original)
        │
        ▼
    extract_characters (prompt: don't translate English names)
        │  name="Agent K" (not "特工 K")
        ▼
    generate_content binding
        │  LLM returns: "Guardians"
        │  CharacterNameMatcher: Guardians → Guardians (Squad) ✓
        ▼
    content: on-screen text verbatim from source_text
             "SYSTEM ALERT" → "SYSTEM ALERT" (no translation)

Phase 2 (May 21) — rolling mode & dialogue prefix:

    parse.py removed:
      _batch_translate_character_names (~100 lines)
      → character name determinism: same input = same name = forever

    local_flow_builder.py:
      _strip_dialogue_prefix(speaker, speaker_raw)
        → dual canonical + raw matching pattern
        → "Dr. Chen Wei" + "Chen Wei (os):" both match
```

---

## 03 / Decision Replay

"Why did we choose this?" — with cited evidence.

::: info What to notice
Not a summary — an **evidence pack**. Reasoning, rejected alternatives, open questions, and impact. Every captured decision becomes queryable.
:::

```json
{
  "id": "lode:2026-W19:002",
  "confidence": "explicit",
  "week": "2026-W19",
  "timestamp": "2026-05-05T11:30:00+08:00",

  "decision": "Added zero-config mode to session-recap with decision-recording schema enhancement across all skills",

  "why": "Adoption barrier caused by requiring configuration before first value delivery. Schema lacked decision context needed for project self-awareness.",

  "chosen": "Zero-config for session-recap only → single skill is the natural first-touch hook, other skills gain data once vault is configured.",

  "rejected": [
    {
      "option": "Terminal-only output (no formatting)",
      "reason": "would not demonstrate the full richness of Lode entries"
    },
    {
      "option": "Zero-config for all 5 skills",
      "reason": "weekly/monthly skills need accumulated data to be useful"
    }
  ],

  "impact": "First-use experience transforms from configure-first to value-first. Raw entries now carry exploration signals that enable roadmap visibility across weekly and monthly reviews.",

  "open_questions": [
    "Will the zero-config Markdown output consistently follow the template across different AI agents?",
    "Should other skills eventually gain lightweight zero-config modes?"
  ],

  "evidence_refs": ["abc1234"]
}
```

---

## 04 / Monthly Review

One month, one page — with signal extraction.

::: info What to notice
**20 work days, 126 completed tasks** — compounded from daily notes into statistics, work distribution, and key change tracking. Evidence mode: strict.
:::

```markdown
# 2026-04 Work Summary

---
> **20** work days | **126** completed tasks | **0** in progress
---

## Overview

Fast-paced month, advancing two directions: content generation and content automation.
First half focused on architecture simplification and data model unification, clearing
structural barriers for cross-episode execution. Second half entered full content
automation: three leaps from monolithic pipeline to cross-episode rolling execution, from
batch mode to per-character concurrency, from single-thread to three-mode API service.

## Work Distribution

| Category         | Count | Share |
| Capability       | 17    | 30%   |
| Structural       | 15    | 26%   |
| Bug fixes        | 14    | 25%   |
| Configuration    | 5     | 9%    |
| Documentation    | 2     | 4%    |
| Other            | 4     | 7%    |

## Key Changes (net >300 lines)

| Change                            | Net lines   | Note                        |
| Pipeline v2.7 cross-episode       | +2792/-430  | Largest change this month   |
| Content binding system upgrade  | +1716/-128  | Layered binding + grouping  |
| Per-character extraction           | +1376/-35   | Fixed batch 12/21 miss      |
| Timeline scene-first refactor      | +654/-3185  | Net -2531 lines (simplified) |
| Scene analysis fact constraints    | +634/-253   | Strict evidence mode        |
| Rolling pipeline 3-layer refactor  | +610/-243   | 3-layer architecture        |

> Based on Daily Note.md 2026-04 raw records and skeleton.json statistics.
> Evidence mode: strict. Each summary traceable to original daily entry.
```

---

## How It Works

Six skills, one habit loop.

| Skill | When | What it does |
| :--- | :--- | :--- |
| `/lode:capture` | Every session wrap-up ("收工", "done") | Classifies archetype, captures decision/repair depth, indexes artifacts |
| `/lode:recall` | Session start ("开工") | Recalls decisions, risks, open questions, relevant docs |
| `/lode:query` | Targeted follow-up | "Why did we choose this?" with cited evidence |
| `/lode:daily` | Daily, on demand | Structured daily notes from raw entries + git history |
| `/lode:weekly` | Weekly, on demand | PPT-ready weekly outlines with technical narrative |
| `/lode:monthly` | Monthly, on demand | Monthly reviews with statistics and candidate rules |

---

<div class="showcase-cta">
<a class="showcase-button" href="/Lode/quick-start">Get Started</a>
</div>

All examples above are real Lode outputs from daily use, 2025-03 to 2026-05.
Internal URLs and proprietary details have been removed.
