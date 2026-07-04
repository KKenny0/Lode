# Workflow

## Minimal Loop

```text
install -> configure -> capture one real session -> query one decision
```

1. Install the plugin as `tracework@tracework`.
2. Run `/tracework:cold-start-interview`.
3. End a real session with `收工` or `/tracework:capture`.
4. Ask `/tracework:query why did we choose <the decision>?`.

This proves the core value: a later reader can recover why a choice happened
without rereading the whole transcript.

## Reuse Map

```text
Capture -> raw/weeks/{week}/{slug}.json
Query   <- raw/decisions/ + raw/weeks/
Recall  <- raw/weeks/ + raw/artifacts/ + raw/decisions/
Weekly  <- raw/weeks/ + fallback git coverage
Monthly <- Daily Note.md + matching raw entries
Roadmap <- raw entries + decision indexes
```

Skills are independent. There is no required pipeline. The shared storage
convention lets later views reuse earlier evidence.

## Progressive Closure

Briefs and reviews should roll work upward while preserving a route back down:

```text
upward: raw entries -> decisions -> work streams -> outcomes / risks / next steps
downward: outcome claim -> stream -> decision -> raw entry / evidence ref
```

Weekly and monthly outputs can use report-local labels:

- `O#`: outcome, progress, risk, or decision
- `W#`: supporting work stream
- `D#`: decision or tradeoff
- `E#`: evidence audit

These labels make a report inspectable. They do not change the raw schema.

## Zero-Config

Without a vault, capture can still return a structured recap in the conversation.
Configure a vault when you want quiet writes, cross-session recall, query, and
brief/review outputs.

## Evidence Rules

- A source ref is provenance, not proof by itself.
- Git-only work is fallback evidence.
- Activity counts do not prove outcomes.
- Unsupported queries should return an evidence gap.
- New facts should be appended as new raw entries, not written into old records.
