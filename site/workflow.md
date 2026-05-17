# Workflow

## The Habit Loop

Lode is organized around the loop you want to repeat until it becomes automatic:

```text
开工 (recall) → 实现探索 (work) → 收工 (capture) → 周期复盘 (review)
```

Each step maps to a natural moment in your workflow:

1. **Start a session** — `开工` or `/lode:recall` surfaces recent decisions, risks, and open questions so you pick up where you left off.
2. **Work normally** — code, explore, decide, reject paths, update schemas. No special action needed.
3. **Wrap up** — `收工` or `/lode:capture` classifies the session and captures what matters: decisions, risks, abandoned alternatives, artifact changes.
4. **Query decisions** — run `/lode:query` when an agent needs cited evidence for why a project chose a path.
5. **Review periodically** — run `/lode:daily`, `/lode:weekly`, `/lode:monthly`, or `/lode:roadmap` when you need structured synthesis.

## Compounding Layers

Lode is not a strict pipeline. Skills are independently triggered, but they reuse each other's artifacts when available.

```text
Recall ← raw/weeks/ + raw/artifacts/      → session context
Capture → raw/weeks/{week}/{slug}.json    → raw entry + artifact index
Query   ← raw/decisions/ + raw/weeks/      → cited evidence pack
Daily   ← raw/weeks/ JSON + git log       → Daily Note.md
Weekly  ← raw/weeks/ + git coverage       → weekly outline
Monthly ← Daily Note.md                   → monthly review + candidate rules
Roadmap ← raw/weeks/                      → decision narrative
```

The key insight: raw entries from `capture` are report-worthy. They carry archetype-specific fields (decision rationale, repair root causes, investigation findings) so downstream reports can explain what happened without a second write pass.

## Storage Convention

Data lives in two layers within your knowledge vault:

- **Raw layer** (`raw/`) — immutable intermediate data: JSON entries, artifact indexes, signals, skeletons
- **Wiki layer** — human-readable outputs: Daily Note, weekly outline, monthly review, decision roadmap

Your knowledge vault is a git repo (typically an Obsidian vault), enabling cross-machine sync via git push/pull.

## Zero-Config Mode

No vault? No problem. `capture` outputs structured Markdown directly in the conversation. `recall` works conversation-only. You get value from the first session without any setup.

When you're ready for persistent storage, run `/lode:cold-start-interview` to configure a vault path. Existing conversation-only sessions remain useful — they just don't compound into reports.
