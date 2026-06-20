# Workflow

## The Replay Loop

Lode is organized around the shortest loop that proves its value:

```text
install → demo → capture one session → query one decision
```

Each step maps to a natural moment in your workflow:

1. **Install** — add the plugin and verify the CLI if needed.
2. **Demo** — run `node examples/decision-replay-demo.mjs` to see the evidence-pack shape.
3. **Wrap up one real session** — `收工` or `/lode:capture` classifies the session and captures decisions, risks, abandoned alternatives, artifact changes, and source references.
4. **Query one decision** — run `/lode:query` when an agent needs cited evidence for why a project chose a path.
5. **Compound later** — use `/lode:recall`, `/lode:roadmap`, `/lode:daily`, `/lode:weekly`, or `/lode:monthly` after history exists.

## Compounding Layers

Lode is not a strict pipeline. Skills are independently triggered, but they reuse each other's artifacts when available.

```text
Capture → raw/weeks/{week}/{slug}.json    → raw entry + artifact index
Query   ← raw/decisions/ + raw/weeks/      → cited decision replay pack
Recall ← raw/weeks/ + raw/artifacts/      → session context
Roadmap ← raw/weeks/ + raw/decisions/      → decision narrative
Daily   ← raw/weeks/ JSON + git log       → Daily Note.md
Weekly  ← raw/weeks/ + git coverage       → weekly outline
Monthly ← Daily Note.md                   → monthly review + candidate rules
```

The key insight: raw entries from `capture` are report-worthy. They carry archetype-specific fields (decision rationale, repair root causes, investigation findings) so `/lode:query`, `/lode:roadmap`, and periodic reports can explain what happened without a second write pass.

Daily, weekly, and monthly outputs are compounding layers. They should improve
as decision evidence accumulates, but they are not required for the first useful
Lode experience.

## Reporting Roll-up

Lode uses one reversible path for reporting: roll session signals upward into
outcomes, then let every important claim drill back down to decisions and
evidence.

```text
Roll upward: raw entries → decisions/tradeoffs → work streams → outcomes/progress
Verify downward: outcomes/progress → supporting work → decisions/tradeoffs → raw/source/evidence refs
```

- `capture` records concrete changes, impact, status, work streams, and evidence references.
- `weekly` and `monthly` promote only claims that pass the outcome check; ongoing work, risks, exploration, and maintenance keep their honest status.
- `query` uses cited local records to explain why a claim exists, what was rejected, and which evidence or evidence gaps remain.
- Raw entries remain the source of truth. Reports are traceable reading views; they do not create facts retroactively.

Commit counts, changed lines, task counts, work days, and log volume measure
activity or coverage. None proves an outcome by itself.

## Storage Convention

Data lives in two layers within your knowledge vault:

- **Raw layer** (`raw/`) — immutable intermediate data: weekly entries, decision replay indexes, artifact indexes, signals, skeletons
- **Wiki layer** — human-readable outputs: Daily Note, weekly outline, monthly review, decision roadmap

Your knowledge vault is a git repo (typically an Obsidian vault), enabling cross-machine sync via git push/pull.

## Zero-Config Mode

No vault? No problem. `capture` outputs structured Markdown directly in the conversation, so you get value from the first session without setup. Configure a vault when you want `/lode:recall`, `/lode:query`, and reports to reuse durable history.

When you're ready for persistent storage, run `/lode:cold-start-interview` to configure a vault path. Existing conversation-only sessions remain useful — they just don't compound into reports.
