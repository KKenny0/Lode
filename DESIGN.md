# Lode -- Design Document

> **Version:** 0.1.0
> **Date:** 2026-04-24
> **Status:** Active

---

## 1. Name

**Lode** — /loʊd/

A lode is a vein of ore: the place where valuable mineral is concentrated underground, waiting to be discovered and refined. The word shares its root with **load** (to carry, to bear) — and with the Chinese character **载 (zài)**, meaning to carry, to record, to preserve across time.

### Why Lode

These skills share one purpose: **extracting lasting value from raw development activity**. Commits, sessions, diffs, and code changes are the ore — abundant but unrefined. Lode is the vein that concentrates them into something worth keeping: daily notes, architecture docs, changelogs, weekly outlines.

The metaphor works at every level:

| Metaphor layer | What it maps to |
|---|---|
| **Vein of ore** | The concentrated value hidden in raw git history and dev sessions |
| **Mining / extraction** | The skills' work of pulling structured records out of unstructured activity |
| **Load / carry** | 载 — these records carry development context forward across time |
| **Lodestar** | The records serve as navigation markers for future reference — where have we been, what did we do |
| **Refining** | Raw commits → polished docs, scattered changes → coherent weekly outline |

### What Lode is NOT

Lode is **not** a pipeline. These skills are independent — each triggered at its own time, for its own purpose. There is no sequential dependency between them. The shared identity is thematic, not procedural.

This distinguishes Lode from a system like Taku (a structured sprint pipeline with phase routing). Lode's skills are miners, not stages.

---

## 2. Skill Inventory

| Skill | Purpose | Trigger timing |
|---|---|---|
| `lode-git-daily-note` | Obsidian daily notes from git history | Per day, on demand |
| `lode-pipeline-doc` | 13-section Pipeline architecture docs | After architectural work |
| `lode-stage-doc` | 12-section Stage implementation docs | After stage implementation |
| `lode-weekly-changelog` | Session-end change log extraction | Per session, at wrap-up |
| `lode-weekly-outline` | Multi-project weekly PPT outline | Per week, on demand |

All skills carry the `lode-` prefix to avoid collision with user-installed skills from other sources.

---

## 3. Information Flow

```
开发过程中:
  lode-weekly-changelog ──→ ~/.weekly-ppt/weeks/{week}/{slug}.json
  lode-pipeline-doc ──────→ ~/.weekly-ppt/weeks/{week}/{slug}.json
  lode-stage-doc ─────────→ ~/.weekly-ppt/weeks/{week}/{slug}.json

每天:
  lode-git-daily-note ← git commit history → Obsidian 日报

每周:
  lode-weekly-outline ← git commits + ~/.weekly-ppt/ → 周报大纲
```

---

## 4. Design Principles

### 4.1 Self-contained skills

Each skill has its own copy of shared files in its `references/` directory. Skills work correctly when installed individually. Skills cannot reference files outside their directory via `../`.

### 4.2 Silent failure

If `~/.weekly-ppt/` doesn't exist or project slug can't be determined, skip the side-effect gracefully.

### 4.3 Convention sync

The canonical convention lives at `references/weekly-ppt-convention.md`. After editing it, run `scripts/sync-convention.sh` to copy to all skill directories that need it.

---

## 5. Branding Notes

This section documents the metaphor and visual concepts for future logo and tagline design.

### Core metaphor

**Mining development activity for lasting value.** The image is geological: raw development work is like unprocessed earth — it contains value, but you have to know where to look and how to extract it. Lode is the system that finds the vein and refines the ore.

### Visual concepts for logo

- A vein of mineral running through rock (the "lode" itself)
- A lodestar / guiding star (navigation, finding your way through development history)
- Layers of sediment / geological strata (different time scales: daily, weekly, per-component)
- Contrast between rough (raw commits) and refined (polished docs/notes)

### Tagline directions

- "Mine your dev history for what matters."
- "Development work, refined into record."
- "从开发活动中，开采值得留下的东西。"

### Tone

Like the geological metaphor: grounded, patient, enduring. Not flashy. These skills do quiet, reliable work — they don't transform your process, they make sure nothing valuable is lost.
